import React, { useState } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import { Sparkles, Send, Mic, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  'Plan a 7-day culinary trip to Tokyo & Kyoto for 2 with $4,000 budget',
  'Add private tea ceremony to Day 3 afternoon',
  'Switch to luxury ryokans in Kyoto',
  'Optimize route to eliminate backtracking',
  'Find bullet trains between Tokyo and Kyoto',
  'Recalculate budget and check expenses',
];

export default function NaturalLanguageBar() {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { executeNLP, isProcessingNLP } = useTravelPlan();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isProcessingNLP) return;
    executeNLP(prompt.trim());
    setPrompt('');
  };

  const handleSuggestionClick = (text) => {
    if (isProcessingNLP) return;
    executeNLP(text);
  };

  // Voice simulation / web speech api if available
  const handleVoiceToggle = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      // Gentle mock voice simulation
      setIsListening(true);
      setTimeout(() => {
        setPrompt('Add a sunset walk at Shibuya Sky to Day 1');
        setIsListening(false);
      }, 1200);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-6">
      {/* Primary Input Container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-[#131620]/90 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-2xl shadow-purple-950/20 focus-within:border-white/40 focus-within:shadow-[0_0_30px_rgba(230,0,18,0.25)] transition-all"
      >
        {/* Left AI Sparkle Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#E60012]/20 to-[#5A2D82]/30 text-white/90 ml-1">
          {isProcessingNLP ? (
            <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#E60012]" />
          )}
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isProcessingNLP}
          placeholder={
            isListening
              ? 'Listening to your request...'
              : 'What would you like to plan? (e.g., "Add tea ceremony to Day 3", "Optimize route", "Switch to luxury ryokan")'
          }
          className="allow-select flex-1 bg-transparent border-none outline-none px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-zinc-400 text-sm sm:text-base font-normal tracking-wide"
        />

        {/* Speech Input Button */}
        <button
          type="button"
          onClick={handleVoiceToggle}
          title="Voice input"
          aria-label="Voice input"
          className={`touch-target no-select p-2 sm:p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isProcessingNLP}
          aria-label="Submit natural language command"
          className="touch-target no-select flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#E60012] to-[#B8000E] text-white text-xs sm:text-sm font-semibold hover:shadow-[0_0_20px_rgba(230,0,18,0.5)] active:scale-[0.97] disabled:opacity-40 disabled:hover:shadow-none transition-all cursor-pointer"
        >
          <span className="hidden sm:inline">Interpret & Apply</span>
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </form>

      {/* Suggested Quick Natural Language Actions */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-zinc-500 font-medium whitespace-nowrap pl-1 flex items-center gap-1">
          Suggestions:
        </span>
        {SUGGESTIONS.map((sugg, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSuggestionClick(sugg)}
            disabled={isProcessingNLP}
            className="no-select whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer text-[11px] sm:text-xs min-h-[32px]"
          >
            {sugg}
          </button>
        ))}
      </div>
    </div>
  );
}
