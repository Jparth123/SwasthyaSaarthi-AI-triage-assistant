import React, { useState } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { generateMarkdownItinerary, downloadFile } from '../../services/persistenceService.js';
import { Download, Copy, Printer, Check } from 'lucide-react';

export default function ExportModal() {
  const { isExportOpen, setIsExportOpen, state } = useTravelPlan();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('markdown'); // 'markdown' | 'json'

  const mdContent = generateMarkdownItinerary(state);
  const jsonContent = JSON.stringify(state, null, 2);

  const handleCopy = () => {
    const textToCopy = activeTab === 'markdown' ? mdContent : jsonContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeTab === 'markdown') {
      downloadFile(mdContent, `${state.trip.id || 'itinerary'}.md`, 'text/markdown');
    } else {
      downloadFile(jsonContent, `${state.trip.id || 'itinerary'}.json`, 'application/json');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isExportOpen}
      onClose={() => setIsExportOpen(false)}
      title="Export & Share Itinerary"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Tab selector */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'markdown'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Markdown Document
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                activeTab === 'json'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Canonical JSON State
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Itinerary"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Code / Text Preview */}
        <div className="relative rounded-2xl bg-[#0C0E17] border border-white/10 p-4 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-300 select-all">
          <pre className="whitespace-pre-wrap">
            {activeTab === 'markdown' ? mdContent : jsonContent}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
