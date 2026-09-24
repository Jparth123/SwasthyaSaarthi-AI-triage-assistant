import React from 'react'
import { AlertTriangle, Clock, CheckCircle, HelpCircle } from 'lucide-react'

export function TriageBadge({ urgency }) {
  if (!urgency) return <span className="badge-pending">Pending</span>
  switch (urgency) {
    case 'EMERGENCY':   return <span className="badge-emergency"><AlertTriangle size={10} />Emergency</span>
    case 'URGENT':      return <span className="badge-urgent"><Clock size={10} />Urgent</span>
    case 'ROUTINE':     return <span className="badge-routine"><CheckCircle size={10} />Routine</span>
    case 'HUMAN_REVIEW':return <span className="badge-review"><HelpCircle size={10} />Review</span>
    default:            return <span className="badge-pending">{urgency}</span>
  }
}

export function UrgencyBanner({ urgency }) {
  const configs = {
    EMERGENCY: {
      gradient: 'linear-gradient(135deg, #dc0000 0%, #7a0000 100%)',
      text: 'POTENTIAL EMERGENCY',
      sub: 'Immediate human clinical assessment required',
      icon: '🚨',
      glow: '0 8px 32px rgba(220,0,0,0.45)',
    },
    URGENT: {
      gradient: 'linear-gradient(135deg, #ea580c 0%, #92400e 100%)',
      text: 'URGENT',
      sub: 'Prompt clinical assessment recommended',
      icon: '⚠️',
      glow: '0 8px 32px rgba(234,88,12,0.35)',
    },
    ROUTINE: {
      gradient: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
      text: 'ROUTINE',
      sub: 'No strong emergency indicators detected',
      icon: '✅',
      glow: '0 8px 32px rgba(22,163,74,0.3)',
    },
    HUMAN_REVIEW: {
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b0764 100%)',
      text: 'HUMAN REVIEW NEEDED',
      sub: 'Insufficient or ambiguous clinical information',
      icon: '👁️',
      glow: '0 8px 32px rgba(124,58,237,0.3)',
    },
  }
  const cfg = configs[urgency] || configs['HUMAN_REVIEW']

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-center"
      style={{
        background: cfg.gradient,
        boxShadow: cfg.glow,
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'white' }} />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
        style={{ background: 'white' }} />
      <div className="relative">
        <div className="text-4xl mb-2">{cfg.icon}</div>
        <div className="text-2xl font-black tracking-wide text-white">{cfg.text}</div>
        <div className="text-sm text-white/80 mt-1">{cfg.sub}</div>
      </div>
    </div>
  )
}

export function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100)
  const color = pct >= 80 ? '#dc0000' : pct >= 60 ? '#f97316' : '#22c55e'
  const bgColor = pct >= 80
    ? 'rgba(220,0,0,0.12)'
    : pct >= 60
      ? 'rgba(249,115,22,0.12)'
      : 'rgba(34,197,94,0.12)'

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Confidence Score</span>
        <span className="font-black" style={{ color }}>{pct}%</span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      <div className="mt-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        {pct >= 80 ? 'High confidence — AI is very certain'
          : pct >= 60 ? 'Moderate confidence — clinical review recommended'
          : 'Low confidence — human review required'}
      </div>
    </div>
  )
}
