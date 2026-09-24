import React from 'react';
import { motion } from 'framer-motion';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`touch-target no-select relative flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl shadow-lg"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            {Icon && <Icon className="w-4 h-4 relative z-10" />}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge && (
              <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-[#E60012]/30 text-red-300 font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
