import React, { useState } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import BottomSheetPicker from '../ui/BottomSheetPicker.jsx';
import { clearSavedState } from '../../services/persistenceService.js';
import { SUPPORTED_CURRENCIES } from '../../services/currencyService.js';
import { Key, Cpu } from 'lucide-react';

const PROVIDER_OPTIONS = [
  {
    value: 'local',
    label: 'Built-in Hybrid Semantic Parser',
    meta: 'Deterministic, Offline, Zero Key Required',
  },
  {
    value: 'gemini',
    label: 'Google Gemini API',
    meta: 'Live LLM Orchestration',
  },
];

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    resetTrip,
  } = useTravelPlan();

  const [provider, setProvider] = useState(settings.llmProvider || 'local');
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'gemini-1.5-flash');
  const [preferredCurrency, setPreferredCurrency] = useState(settings.preferredCurrency || 'JPY');

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      llmProvider: provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      preferredCurrency,
    });
    setIsSettingsOpen(false);
  };

  const handleResetFactory = () => {
    if (window.confirm('Reset all saved travel plans and restore factory defaults?')) {
      clearSavedState();
      resetTrip();
      setIsSettingsOpen(false);
    }
  };

  // Build currency options for picker
  const currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({
    value: c.code,
    label: c.name,
    meta: c.symbol,
  }));

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      title="Application & AI Settings"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* NLP / LLM Provider */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            AI Reasoning Engine
          </label>
          {/* Bottom Sheet Picker replaces <select> */}
          <BottomSheetPicker
            label="AI Reasoning Engine"
            value={provider}
            onChange={(val) => setProvider(val)}
            options={PROVIDER_OPTIONS}
            placeholder="Select engine…"
          />
          <p className="text-[11px] text-zinc-400 mt-1.5">
            The built-in hybrid semantic parser performs deep natural-language entity extraction with zero external latency.
          </p>
        </div>

        {/* API Key (shown if Gemini selected) */}
        {provider === 'gemini' && (
          <div className="space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in duration-200">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500 font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-500 font-mono min-h-[44px]"
              />
            </div>
          </div>
        )}

        {/* Preferred Currency — Bottom Sheet Picker */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-2">
            Default Display Currency
          </label>
          <BottomSheetPicker
            label="Display Currency"
            value={preferredCurrency}
            onChange={(val) => setPreferredCurrency(val)}
            options={currencyOptions}
            placeholder="Select currency…"
          />
        </div>

        {/* Factory Reset Section */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-zinc-300 font-semibold block">Factory Reset</span>
            <span className="text-[11px] text-zinc-500">Clear saved plan and restart clean.</span>
          </div>
          <button
            type="button"
            onClick={handleResetFactory}
            className="touch-target no-select px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Reset All Data
          </button>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}
