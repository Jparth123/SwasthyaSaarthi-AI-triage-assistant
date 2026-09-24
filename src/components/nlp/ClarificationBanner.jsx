import React from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import { HelpCircle, X, ArrowRight } from 'lucide-react';

export default function ClarificationBanner() {
  const { activeClarification, answerClarification, setActiveClarification } = useTravelPlan();

  if (!activeClarification) return null;

  const { question } = activeClarification;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-gradient-to-r from-[#5A2D82]/30 via-[#1A1C29] to-[#E60012]/20 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl shadow-purple-950/30 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#5A2D82]/40 text-purple-300 border border-purple-400/40 flex-shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                Clarification Needed
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                {question.prompt}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveClarification(null)}
            aria-label="Dismiss clarification"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10">
          {question.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => answerClarification(opt.value)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium hover:border-purple-400 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{opt.label}</span>
              <ArrowRight className="w-3 h-3 text-purple-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
