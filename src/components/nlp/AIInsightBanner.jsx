import React, { useState } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import Badge from '../ui/Badge.jsx';
import { CheckCircle2, ChevronDown, ChevronUp, Undo2, Cpu } from 'lucide-react';

export default function AIInsightBanner() {
  const { state, undo, canUndo } = useTravelPlan();
  const [isExpanded, setIsExpanded] = useState(false);

  const intent = state.lastParsedIntent;
  if (!intent) return null;

  const confidencePct = Math.round((intent.confidence || 0.9) * 100);
  const entities = intent.entities || {};
  const toolTrace = intent.toolTrace || [];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-6">
      <div className="bg-[#141824]/80 border border-white/15 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl shadow-lg transition-all">
        {/* Top Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Understood:</span>
              <span className="text-xs font-semibold text-white truncate max-w-sm sm:max-w-md">
                "{intent.rawPrompt}"
              </span>
              <Badge variant="purple" size="sm">
                Action: {intent.action}
              </Badge>
              <Badge variant="emerald" size="sm">
                {confidencePct}% Confidence
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {canUndo && (
              <button
                type="button"
                onClick={undo}
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                title="Revert this action"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
              aria-label={isExpanded ? 'Hide AI details' : 'Show AI details'}
            >
              <Cpu className="w-3 h-3 text-[#E60012]" />
              <span>{isExpanded ? 'Hide Trace' : 'Tool Trace'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expanded Telemetry & Entity Breakdown */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs animate-in fade-in duration-200">
            {/* Extracted Entities */}
            <div className="flex flex-wrap items-center gap-2 text-zinc-300">
              <span className="text-zinc-500 font-medium">Extracted Entities:</span>
              {entities.destination && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">
                  📍 Dest: {entities.destination}
                </span>
              )}
              {entities.durationDays && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">
                  📅 Days: {entities.durationDays}
                </span>
              )}
              {entities.targetDay && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">
                  🗓️ Day: {entities.targetDay}
                </span>
              )}
              {entities.travelers?.count && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">
                  👥 Travelers: {entities.travelers.count} ({entities.travelers.type})
                </span>
              )}
              {entities.budget?.tier && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">
                  💰 Tier: {entities.budget.tier}
                </span>
              )}
              {entities.title && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-200">
                  🏷️ Item: {entities.title}
                </span>
              )}
            </div>

            {/* Active Tool Execution Pipeline */}
            {toolTrace.length > 0 && (
              <div className="space-y-1">
                <span className="text-zinc-500 font-medium block">Deterministic Function Execution Trace:</span>
                <div className="flex flex-col gap-1.5 pl-2 border-l border-white/15">
                  {toolTrace.map((trace, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{trace.tool}()</span>
                      <span className="text-zinc-400">➔</span>
                      <span className="text-zinc-300">{trace.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
