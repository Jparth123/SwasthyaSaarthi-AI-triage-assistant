import React, { useState } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../ui/Badge.jsx';
import {
  Sparkles,
  X,
  Send,
  Cpu,
  History,
  Lightbulb,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AICoPilotDrawer() {
  const { isCoPilotOpen, setIsCoPilotOpen, state, executeNLP, isProcessingNLP } = useTravelPlan();
  const [drawerPrompt, setDrawerPrompt] = useState('');
  const [activeTab, setActiveDrawerTab] = useState('suggestions'); // 'suggestions' | 'audit' | 'tools'

  const auditLog = state.auditLog || [];
  const trip = state.trip;

  const handleDrawerSubmit = (e) => {
    e?.preventDefault();
    if (!drawerPrompt.trim() || isProcessingNLP) return;
    executeNLP(drawerPrompt.trim());
    setDrawerPrompt('');
  };

  const suggestions = [
    {
      title: 'Geographic Routing Optimization',
      desc: 'Re-align activities to minimize cross-city subway transit.',
      actionPrompt: 'Optimize route to avoid backtracking',
    },
    {
      title: 'Night Food Alley Discovery',
      desc: 'Add an authentic Yakitori crawl in Nonbei Yokocho or Omoide Yokocho.',
      actionPrompt: 'Add dinner at Yakitori Alley on Day 1',
    },
    {
      title: 'Traditional Ryokan Upgrade',
      desc: 'Experience natural hot-spring open-air onsen baths in Kyoto.',
      actionPrompt: 'Switch to luxury ryokan in Kyoto',
    },
    {
      title: 'Budget Safety Audit',
      desc: 'Verify that 25%+ reserve remains for spontaneous shopping and food.',
      actionPrompt: 'Recalculate budget breakdown and reserve',
    },
  ];

  return (
    <AnimatePresence>
      {isCoPilotOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCoPilotOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-[#10121A] border-l border-white/20 shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#E60012] to-[#5A2D82] text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    AI Travel Co-Pilot
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    State Inspector & Proactive Assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCoPilotOpen(false)}
                aria-label="Close co-pilot drawer"
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Pills */}
            <div className="flex items-center gap-1 p-2.5 border-b border-white/10 bg-white/5 text-xs">
              <button
                onClick={() => setActiveDrawerTab('suggestions')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'suggestions'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Suggestions
              </button>
              <button
                onClick={() => setActiveDrawerTab('audit')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'audit'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Log
              </button>
              <button
                onClick={() => setActiveDrawerTab('tools')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'tools'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Telemetry
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Tab 1: Proactive Suggestions */}
              {activeTab === 'suggestions' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <span className="text-zinc-400 block mb-1">Current Active Context:</span>
                    <p className="font-semibold text-white">{trip.title}</p>
                    <p className="text-zinc-400 mt-1">
                      {trip.dates.durationDays} Days • {trip.travelers.count} Travelers • {trip.preferences.pace} Pace
                    </p>
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-4">
                    Proactive Enhancements
                  </h4>

                  {suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all group cursor-pointer"
                      onClick={() => executeNLP(sug.actionPrompt)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                            {sug.title}
                          </h5>
                          <p className="text-xs text-zinc-400 mt-1">{sug.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Audit History */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Plan Mutation Audit Timeline
                  </h4>

                  {auditLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="purple" size="sm">
                          {log.actionType}
                        </Badge>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-zinc-200 mt-1">{log.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: System Telemetry */}
              {activeTab === 'tools' && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Registered Application Tools
                  </h4>

                  {[
                    { name: 'planTripTool', desc: 'Synthesizes complete multi-day schedule with lodging and transit' },
                    { name: 'addActivityTool', desc: 'Inserts activity item with automatic time conflict resolution' },
                    { name: 'removeActivityTool', desc: 'Prunes item and updates total budget utilization' },
                    { name: 'routeOptimizerTool', desc: 'Performs TSP nearest-neighbor sorting on coordinates' },
                    { name: 'budgetTool', desc: 'Calculates category allocations and overrun warnings' },
                    { name: 'searchLodgingTool', desc: 'Filters curated hotel/ryokan database by city and tier' },
                    { name: 'searchTransitTool', desc: 'Matches bullet train, rail, and airport transfer legs' },
                  ].map((t) => (
                    <div key={t.name} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="font-mono text-cyan-300 font-bold block">{t.name}()</span>
                      <span className="text-zinc-400 text-[11px] mt-0.5 block">{t.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Drawer Quick Prompt Input */}
            <form
              onSubmit={handleDrawerSubmit}
              className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center gap-2"
            >
              <input
                type="text"
                value={drawerPrompt}
                onChange={(e) => setDrawerPrompt(e.target.value)}
                placeholder="Ask Co-Pilot to edit plan..."
                disabled={isProcessingNLP}
                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-400 outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={!drawerPrompt.trim() || isProcessingNLP}
                className="p-2.5 rounded-xl bg-[#E60012] text-white hover:bg-red-600 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
