import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayCircle, ArrowRight, CheckCircle, Loader, Sparkles, Zap } from 'lucide-react'
import { runDemoCase } from '../services/api.js'

const DEMO_CASES = [
  {
    type: 'emergency',
    title: 'Emergency',
    emoji: '🚨',
    subtitle: 'Breathing Difficulty Case',
    description: 'Saans lene mein bahut dikkat ho rahi hai, bol bhi nahi paa raha hoon…',
    expected: 'EMERGENCY',
    accent: '#dc0000',
    accentBg: 'rgba(220,0,0,0.08)',
    accentBorder: 'rgba(220,0,0,0.25)',
    features: ['Respiratory danger rule fires', 'High confidence ~90%', 'PHC alert generated'],
  },
  {
    type: 'dramatic',
    title: 'Dramatic Speech',
    emoji: '💬',
    subtitle: 'Emotional Language — No Clinical Emergency',
    description: 'Arre meri toh jaan nikal gayi, bahut bura lag raha hai yaar…',
    expected: 'ROUTINE / REVIEW',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.25)',
    features: ['Emotional intensity detected', 'No clinical danger sign', 'NOT emergency'],
  },
  {
    type: 'urgent',
    title: 'Urgent Case',
    emoji: '⚠️',
    subtitle: 'Persistent Fever + Weakness',
    description: 'Do din se bukhar hai aur weakness badh rahi hai…',
    expected: 'URGENT',
    accent: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    accentBorder: 'rgba(249,115,22,0.25)',
    features: ['Persistent fever detected', 'Increasing weakness', 'Prompt assessment needed'],
  },
  {
    type: 'ambiguous',
    title: 'Ambiguous Dialect',
    emoji: '❓',
    subtitle: 'Noisy / Incomplete Speech',
    description: 'Woh... kuch... lagta hai... nahi pata... ajeeb sa…',
    expected: 'HUMAN REVIEW',
    accent: '#a855f7',
    accentBg: 'rgba(168,85,247,0.08)',
    accentBorder: 'rgba(168,85,247,0.25)',
    features: ['Insufficient clinical info', 'Low confidence', 'Human review required'],
  },
  {
    type: 'routine',
    title: 'Routine Case',
    emoji: '✅',
    subtitle: 'Mild Headache — No Emergency',
    description: 'Thoda headache hai kal se, fever nahi hai…',
    expected: 'ROUTINE',
    accent: '#22c55e',
    accentBg: 'rgba(34,197,94,0.08)',
    accentBorder: 'rgba(34,197,94,0.25)',
    features: ['No danger signs', 'Low severity symptoms', 'Routine visit recommended'],
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

export default function DemoCases() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [results, setResults] = useState({})

  const runDemo = async (type) => {
    setLoading(type)
    try {
      const r = await runDemoCase(type)
      setResults(prev => ({ ...prev, [type]: r.data }))
      setTimeout(() => navigate(`/cases/${r.data.id}`), 700)
    } catch {
      alert('Failed to run demo case. Is the backend running?\n\nStart it with: uvicorn main:app --reload')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles size={22} style={{ color: 'var(--red-primary)' }} />
          Demo Cases
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          One-click AI triage demos for hackathon presentation
        </p>
        <div className="red-accent-line mt-2" />
      </motion.div>

      {/* Key demo callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, #dc0000 0%, #7a0000 60%, #400000 100%)',
          boxShadow: '0 8px 32px rgba(220,0,0,0.35)',
        }}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="relative flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <div className="font-black text-white text-base">⭐ Key Demonstration</div>
            <div className="text-white/80 text-sm mt-1">
              Run <strong className="text-white">Emergency</strong> then{' '}
              <strong className="text-white">Dramatic Speech</strong> to show the critical differentiator:
              the system distinguishes genuine clinical danger from emotionally intense language.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Demo cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {DEMO_CASES.map(demo => {
          const isLoading = loading === demo.type
          const result = results[demo.type]

          return (
            <motion.div
              key={demo.type}
              variants={item}
              className="card relative overflow-hidden"
              style={{
                borderLeft: `3px solid ${demo.accent}`,
              }}
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 left-0 w-20 h-full opacity-[0.04] pointer-events-none"
                style={{ background: demo.accent }} />

              <div className="relative flex items-start gap-4">
                {/* Left emoji/icon */}
                <div
                  className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: demo.accentBg, border: `1px solid ${demo.accentBorder}` }}
                >
                  {demo.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                        {demo.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {demo.subtitle}
                      </p>
                    </div>

                    {/* Run button */}
                    <button
                      onClick={() => runDemo(demo.type)}
                      disabled={!!loading}
                      className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 touch-target no-select"
                      style={{
                        background: result ? 'rgba(34,197,94,0.12)' : demo.accentBg,
                        color: result ? '#22c55e' : demo.accent,
                        border: `1.5px solid ${result ? 'rgba(34,197,94,0.3)' : demo.accentBorder}`,
                        boxShadow: isLoading ? `0 0 16px ${demo.accent}40` : 'none',
                      }}
                    >
                      {isLoading ? (
                        <Loader size={16} className="animate-spin" />
                      ) : result ? (
                        <CheckCircle size={16} />
                      ) : (
                        <PlayCircle size={16} />
                      )}
                      <span>{isLoading ? 'Running…' : result ? 'Done!' : 'Run'}</span>
                    </button>
                  </div>

                  {/* Transcript preview */}
                  <div
                    className="mt-3 rounded-xl px-3 py-2.5"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
                      Sample Transcript
                    </div>
                    <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                      "{demo.description}"
                    </p>
                  </div>

                  {/* Feature tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {demo.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Expected result + view link */}
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs">
                      <span style={{ color: 'var(--text-faint)' }}>Expected: </span>
                      <span className="font-black" style={{ color: demo.accent }}>{demo.expected}</span>
                    </div>
                    {result && (
                      <button
                        onClick={() => navigate(`/cases/${result.id}`)}
                        className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                        style={{ color: '#22c55e' }}
                      >
                        View Result <ArrowRight size={11} />
                      </button>
                    )}
                  </div>

                  {/* Result summary */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 flex items-center gap-2 text-sm font-bold"
                      style={{ borderTop: '1px solid var(--border)', color: '#22c55e' }}
                    >
                      <CheckCircle size={14} />
                      Triage: <strong>{result.triage?.urgency}</strong>
                      · {Math.round((result.triage?.confidence || 0) * 100)}% confidence
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="text-center text-[11px] py-2" style={{ color: 'var(--text-faint)' }}>
        All demo cases use deterministic rules — no live AI or external API required
      </div>
    </div>
  )
}
