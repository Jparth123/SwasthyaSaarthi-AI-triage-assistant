import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderOpen, X, Filter, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

import { listCases } from '../services/api.js'
import { TriageBadge } from '../components/TriageComponents.jsx'

const FILTERS = ['ALL', 'EMERGENCY', 'URGENT', 'ROUTINE', 'HUMAN_REVIEW']
const FILTER_LABELS = {
  ALL: 'All',
  EMERGENCY: 'Emergency',
  URGENT: 'Urgent',
  ROUTINE: 'Routine',
  HUMAN_REVIEW: 'Pending Review',
}

// Fallback initial seeded cases matching Section 17 exactly:
// C-1021 | P-102 | 10:21 | Emergency | PHC Alert
// C-1022 | P-103 | 10:43 | Urgent    | Pending
// C-1023 | P-104 | 11:02 | Routine   | Reviewed
const BASELINE_CASES = [
  { id: 1, case_code: 'C-1021', patient_id: 'P-102', village: 'Rampur', time: '10:21', urgency: 'EMERGENCY', status: 'PHC Alert' },
  { id: 2, case_code: 'C-1022', patient_id: 'P-103', village: 'Sitapur', time: '10:43', urgency: 'URGENT', status: 'Pending' },
  { id: 3, case_code: 'C-1023', patient_id: 'P-104', village: 'Karanpur', time: '11:02', urgency: 'ROUTINE', status: 'Reviewed' },
  { id: 4, case_code: 'C-1024', patient_id: 'P-1042', village: 'Demo Village', time: '09:15', urgency: 'EMERGENCY', status: 'PHC Alert' },
  { id: 5, case_code: 'C-1025', patient_id: 'P-105', village: 'Bhojpur', time: '09:40', urgency: 'URGENT', status: 'Pending' },
  { id: 6, case_code: 'C-1026', patient_id: 'P-106', village: 'Anandpur', time: '09:55', urgency: 'ROUTINE', status: 'Reviewed' },
  { id: 7, case_code: 'C-1027', patient_id: 'P-107', village: 'Rampur', time: '10:05', urgency: 'URGENT', status: 'Pending' },
  { id: 8, case_code: 'C-1028', patient_id: 'P-108', village: 'Sitapur', time: '10:30', urgency: 'ROUTINE', status: 'Reviewed' },
  { id: 9, case_code: 'C-1029', patient_id: 'P-109', village: 'Karanpur', time: '10:50', urgency: 'URGENT', status: 'Pending' },
  { id: 10, case_code: 'C-1030', patient_id: 'P-110', village: 'Bhojpur', time: '11:15', urgency: 'ROUTINE', status: 'Reviewed' },
  { id: 11, case_code: 'C-1031', patient_id: 'P-111', village: 'Anandpur', time: '11:30', urgency: 'ROUTINE', status: 'Pending' },
  { id: 12, case_code: 'C-1032', patient_id: 'P-112', village: 'Demo Village', time: '11:45', urgency: 'ROUTINE', status: 'Reviewed' },
]

export default function Cases() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listCases(filter === 'ALL' ? null : filter)
      .then(r => {
        if (r.data && r.data.length > 0) {
          const mapped = r.data.map(c => {
            const dateObj = c.created_at ? new Date(c.created_at) : null
            const timeStr = dateObj ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '10:21'
            return {
              id: c.id,
              case_code: `C-${1020 + c.id}`,
              patient_id: c.patient_id,
              village: c.village || 'Demo Village',
              time: timeStr,
              urgency: c.triage?.urgency || 'ROUTINE',
              status: c.triage?.urgency === 'EMERGENCY' ? 'PHC Alert' : (c.status === 'analyzed' ? 'Pending' : 'Reviewed'),
            }
          })
          setCases(mapped)
        } else {
          setCases(BASELINE_CASES)
        }
      })
      .catch(() => setCases(BASELINE_CASES))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = cases.filter(c => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'HUMAN_REVIEW' ? c.status === 'Pending' : c.urgency === filter)
    const matchesSearch =
      !search ||
      c.case_code.toLowerCase().includes(search.toLowerCase()) ||
      c.patient_id.toLowerCase().includes(search.toLowerCase()) ||
      c.village.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Case History
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Recorded triage entries and PHC referral statuses
        </p>
        <div className="red-accent-line mt-2" />
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
        <input
          type="text"
          placeholder="Search by Case ID, patient or village…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-11 pr-10 w-full"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Tabs with Scrolling Controls */}
      <div className="flex items-center gap-1.5 no-select">
        <button
          onClick={() => {
            const el = document.getElementById('cases-filter-scroll')
            if (el) el.scrollBy({ left: -140, behavior: 'smooth' })
          }}
          className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
          aria-label="Scroll filter tabs left"
          title="Scroll filters left"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          id="cases-filter-scroll"
          className="flex-1 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {FILTERS.map(f => {
            const isActive = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
                style={{
                  background: isActive ? 'var(--red-primary)' : 'var(--bg-elevated)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${isActive ? 'var(--red-primary)' : 'var(--border)'}`,
                  boxShadow: isActive ? '0 2px 8px rgba(220,0,0,0.35)' : 'none',
                }}
              >
                {FILTER_LABELS[f]}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => {
            const el = document.getElementById('cases-filter-scroll')
            if (el) el.scrollBy({ left: 140, behavior: 'smooth' })
          }}
          className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
          aria-label="Scroll filter tabs right"
          title="Scroll filters right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Case History Table (Section 17 exact format:
          Case ID | Patient | Time | Urgency | Status
          C-1021  | P-102   | 10:21| Emergency | PHC Alert
          C-1022  | P-103   | 10:43| Urgent    | Pending
          C-1023  | P-104   | 11:02| Routine   | Reviewed
      ) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-0 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full premium-table">
            <thead>
              <tr>
                <th className="text-left pl-5">Case ID</th>
                <th className="text-left">Patient</th>
                <th className="text-left">Village</th>
                <th className="text-left">Time</th>
                <th className="text-left">Urgency</th>
                <th className="text-left pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c.id || idx}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="cursor-pointer hover:bg-neutral-900/40 transition-colors"
                >
                  <td className="pl-5 font-mono font-bold text-xs" style={{ color: 'var(--red-light)' }}>
                    {c.case_code}
                  </td>
                  <td className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {c.patient_id}
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {c.village}
                  </td>
                  <td className="font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {c.time}
                  </td>
                  <td>
                    <TriageBadge urgency={c.urgency} />
                  </td>
                  <td className="pr-5">
                    <span
                      className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        background: c.status === 'PHC Alert'
                          ? 'rgba(220,0,0,0.15)'
                          : c.status === 'Pending'
                            ? 'rgba(249,115,22,0.12)'
                            : 'rgba(34,197,94,0.12)',
                        color: c.status === 'PHC Alert'
                          ? '#ff4444'
                          : c.status === 'Pending'
                            ? '#f97316'
                            : '#22c55e',
                        border: `1px solid ${c.status === 'PHC Alert' ? 'rgba(220,0,0,0.3)' : 'var(--border)'}`,
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
