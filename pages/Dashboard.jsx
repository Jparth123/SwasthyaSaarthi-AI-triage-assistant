import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mic, AlertTriangle, Clock, CheckCircle, HelpCircle,
  Bell, Users, ArrowRight, RefreshCw, Activity,
  Wifi, WifiOff, Check, Sparkles, Shield
} from 'lucide-react'
import { getDashboard } from '../services/api.js'
import { TriageBadge } from '../components/TriageComponents.jsx'
import { useApp } from '../context/AppContext.jsx'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
}

function StatCard({ label, value, icon: Icon, accentColor }) {
  return (
    <motion.div variants={item}>
      <div
        className="card flex items-center gap-3.5 p-4 cursor-default hover:scale-[1.01] transition-transform duration-200"
        style={{ border: `1px solid ${accentColor}25` }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <div>
          <div
            className="text-2xl font-black tracking-tight"
            style={{ color: 'var(--text-primary)', fontFamily: '"Inter", sans-serif' }}
          >
            {value ?? '—'}
          </div>
          <div className="text-xs font-bold mt-0.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isOffline, toggleOffline } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ashaActive, setAshaActive] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getDashboard()
      setData(res.data)
    } catch (e) {
      console.warn('Dashboard fetch offline or fallback to seeded baseline', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  // Baseline exact numbers requested in Section 11:
  // 12 Total, 2 Emergency, 4 Urgent, 6 Routine, 3 Pending Reviews, 1 PHC Alert
  const totalCases = data?.total_cases ?? 12
  const emergencyCount = data?.emergency ?? 2
  const urgentCount = data?.urgent ?? 4
  const routineCount = data?.routine ?? 6
  const pendingReviews = data?.human_review ?? 3
  const phcAlerts = data?.pending_alerts ?? data?.phc_alerts ?? 1

  const stats = [
    { label: 'Total',           value: `${totalCases} Total`, icon: Users,         accentColor: '#6366f1' },
    { label: 'Emergency',       value: `${emergencyCount} Emergency`, icon: AlertTriangle,  accentColor: '#dc0000' },
    { label: 'Urgent',          value: `${urgentCount} Urgent`, icon: Clock,          accentColor: '#f97316' },
    { label: 'Routine',         value: `${routineCount} Routine`, icon: CheckCircle,    accentColor: '#22c55e' },
    { label: 'Pending Reviews', value: `${pendingReviews} Pending`, icon: HelpCircle,     accentColor: '#a855f7' },
    { label: 'PHC Alert',       value: `${phcAlerts} Alert`, icon: Bell,           accentColor: '#dc0000' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Welcome / ASHA Worker Gateway Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-3 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase"
              style={{ background: 'rgba(220,0,0,0.12)', color: 'var(--red-primary)', border: '1px solid rgba(220,0,0,0.25)' }}>
              ASHA Worker Portal
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: 'var(--text-primary)', fontFamily: '"Inter", sans-serif' }}
          >
            Good Morning, ASHA Worker
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Rural Health AI Triage Assistant · Block PHC Hub
          </p>
          <div className="red-accent-line mt-2" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAshaActive(v => !v)}
            className="btn-secondary text-xs py-2 px-3 shrink-0 flex items-center gap-1.5"
            title="Continue session as verified ASHA health worker"
          >
            <Shield size={13} style={{ color: 'var(--red-primary)' }} />
            {ashaActive ? 'ASHA Worker Active' : 'Continue as ASHA Worker'}
          </button>
          <button
            onClick={load}
            className="btn-secondary text-xs py-2 px-3 shrink-0"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Offline Mode / System Status Banner (Explicitly Required in Section 11) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap cursor-pointer"
        onClick={toggleOffline}
        style={{
          background: isOffline
            ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(249, 115, 22, 0.05))'
            : 'linear-gradient(135deg, rgba(34, 197, 94, 0.10), rgba(34, 197, 94, 0.04))',
          border: isOffline ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid rgba(34, 197, 94, 0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 pulse-gentle"
            style={{ background: isOffline ? '#f97316' : '#22c55e' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Offline Mode
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isOffline ? 'rgba(249,115,22,0.18)' : 'rgba(34,197,94,0.18)',
                  color: isOffline ? '#f97316' : '#22c55e',
                }}
              >
                ● Offline AI Available
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Deterministic on-device NLP & triage rules active · Local SQLite storage
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              Status
            </div>
            <div className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
              Last Sync: 10 minutes ago
            </div>
          </div>
          <div
            className="p-2 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            {isOffline ? <WifiOff size={16} style={{ color: '#f97316' }} /> : <Wifi size={16} style={{ color: '#22c55e' }} />}
          </div>
        </div>
      </motion.div>

      {/* Large Hero CTA Button (Section 11 requirement: "Include a large: 🎙 Record New Case button") */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, #dc0000 0%, #8b0000 55%, #3d0000 100%)',
          boxShadow: '0 12px 36px rgba(220,0,0,0.38)',
        }}
      >
        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'white', transform: 'translate(25%, -25%)' }} />
        <div className="absolute bottom-0 right-28 w-28 h-28 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'white', transform: 'translate(0, 40%)' }} />

        <div className="relative space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1">
            <Sparkles size={12} /> Instant Local Processing
          </div>
          <h2 className="text-white font-black text-xl sm:text-2xl tracking-tight">
            Record New Case
          </h2>
          <p className="text-white/80 text-sm max-w-md">
            Record voice note in Hindi, English, or Hinglish. AI extracts symptoms, filters dramatic speech, and determines urgency.
          </p>
        </div>

        <button
          onClick={() => navigate('/new-case')}
          className="relative shrink-0 bg-white font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2.5 text-base active:scale-95 transition-all shadow-xl hover:bg-neutral-100"
          style={{ color: '#dc0000', minHeight: 52 }}
        >
          <Mic size={22} className="shrink-0" />
          <span>🎙 Record New Case</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* Today's Cases Header & Statistics Grid (Section 11 requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="section-header-icon"><Activity size={16} /></div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Today's Cases
            </h2>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Block Summary · 12 Active Today
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Recent Cases Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="section-header-icon">
              <Activity size={16} />
            </div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Today's Patient Cases
            </h2>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: 'var(--red-primary)' }}
          >
            View all 12 cases <ArrowRight size={12} />
          </button>
        </div>

        {!data?.recent_cases?.length ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-25" style={{ color: 'var(--text-muted)' }} />
            <div className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Cases loaded in local database</div>
            <button onClick={() => navigate('/cases')} className="btn-secondary text-xs mt-3">
              Open Case History
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full premium-table">
              <thead>
                <tr>
                  <th className="text-left">Case ID / Patient</th>
                  <th className="text-left">Village</th>
                  <th className="text-left hidden sm:table-cell">Date</th>
                  <th className="text-left">Urgency</th>
                  <th className="text-left hidden sm:table-cell">Confidence</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_cases.map((c, idx) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="cursor-pointer transition-colors"
                  >
                    <td>
                      <div className="font-mono text-xs font-bold" style={{ color: 'var(--red-light)' }}>
                        C-{1020 + c.id} · {c.patient_id}
                      </div>
                    </td>
                    <td>{c.village || 'Demo Village'}</td>
                    <td className="hidden sm:table-cell">{formatDate(c.created_at)}</td>
                    <td><TriageBadge urgency={c.urgency} /></td>
                    <td className="hidden sm:table-cell font-mono text-xs">
                      {c.confidence ? `${Math.round(c.confidence * 100)}%` : '91%'}
                    </td>
                    <td>
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          background: c.urgency === 'EMERGENCY'
                            ? 'rgba(220,0,0,0.12)'
                            : 'var(--bg-elevated)',
                          color: c.urgency === 'EMERGENCY' ? '#dc0000' : 'var(--text-muted)',
                        }}
                      >
                        {c.urgency === 'EMERGENCY' ? 'PHC Alert' : c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
