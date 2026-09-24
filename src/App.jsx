import React from 'react';
import { TravelPlanProvider } from './context/TravelPlanContext';
import Navbar from './components/layout/Navbar';
import PlanningWorkspace from './components/layout/PlanningWorkspace';
import Footer from './components/Footer';

function App() {
  return (
    <TravelPlanProvider>
      <div className="relative min-h-screen bg-[#08090E] text-white selection:bg-[#E60012]/30 selection:text-white font-sans antialiased overflow-x-hidden">
        {/* Ambient Gradient Glows */}
        <div className="fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#5A2D82]/12 blur-[140px] pointer-events-none" />
        <div className="fixed -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#E60012]/10 blur-[140px] pointer-events-none" />

        {/* Floating Kanji Background Watermarks */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
          {['旅', '美', '和', '桜', '道', '光', '風'].map((kanji, i) => (
            <span
              key={i}
              className="absolute font-display text-white/[0.015] select-none"
              style={{
                fontSize: `${100 + (i * 35)}px`,
                top: `${12 + (i * 13)}%`,
                left: `${6 + (i * 13) % 85}%`,
              }}
            >
              {kanji}
            </span>
          ))}
        </div>

        {/* Application Navigation Bar */}
        <Navbar />

        {/* Core Autonomous AI Planning Workspace */}
        <div className="relative z-10">
          <PlanningWorkspace />
        </div>

        {/* Application Footer */}
        <Footer />
      </div>
    </TravelPlanProvider>
  );
}

export default App;
