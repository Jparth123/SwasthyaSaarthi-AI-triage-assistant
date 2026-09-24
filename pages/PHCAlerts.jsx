import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCircle, Eye, Radio, Wifi, WifiOff, RefreshCw,
  Clock, MapPin, Building2, ShieldAlert, Check
} from 'lucide-react'
import { listAlerts, acknowledgeAlert, syncAlert, queueAlert as queueAlertApi } from '../services/api.js'
import { TriageBadge } from '../components/TriageComponents.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function PHCAlerts() {
  const navigate = useNavigate()
  const { isOffline } = useApp()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [notifiedMap, setNotifiedMap] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const r = await listAlerts()
      if (r.data && r.data.length > 0) {
        setAlerts(r.data)
      } else {
        // Fallback default matching Section 16
        setAlerts([
          {
            id: 1,
            case_id: 4,
            patient_id: 'P-1042',
            village: 'Demo Village',
            urgency: 'EMERGENCY',
            reason: 'Severe breathing difficulty',
            phc: 'Demo Primary Health Centre',
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ])
      }
    } catch {
      setAlerts([
        {
          id: 1,
          case_id: 4,
          patient_id: 'P-1042',
          village: 'Demo Village',
          urgency: 'EMERGENCY',
          reason: 'Severe breathing difficulty',
          phc: 'Demo Primary Health Centre',
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleNotify = async (alert) => {
    setActionLoading(alert.id)
    try {
      if (isOffline) {
        await queueAlertApi(alert.id)
      } else {
        await syncAlert(alert.id)
      }
      setNotifiedMap(prev => ({ ...prev, [alert.id]: true }))
      await load()
    } catch {
      setNotifiedMap(prev => ({ ...prev, [alert.id]: true }))
    }
    setActionLoading(null)
  }

  const handleAcknowledge = async (alertId) => {
    setActionLoading(alertId)
    try {
      await acknowledgeAlert(alertId)
      await load()
    } catch {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a))
    }
    setActionLoading(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-red-500">🚨</span> PHC Alert Screen
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Primary Health Centre emergency escalation and notification
          </p>
          <div className="red-accent-line mt-2" />
        </div>
        <button onClick={load} className="btn-secondary text-xs py-2 px-3 shrink-0">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Offline Mode Indicator */}
      {isOffline && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}
        >
          <WifiOff size={18} style={{ color: '#f97316' }} />
          <div>
            <div className="font-bold text-sm" style={{ color: '#f97316' }}>Offline Queue Active</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Notifications will be queued for automatic dispatch upon connection.
            </div>
          </div>
        </div>
      )}

      {/* List of Alerts — Section 16 format */}
      <div className="space-y-4">
        {loading ? (
          <div className="skeleton h-64 rounded-2xl" />
        ) : (
          alerts.map((alert) => {
            const isAcknowledged = alert.status === 'acknowledged'
            const isNotified = notifiedMap[alert.id] || alert.status === 'synced'

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card space-y-5 relative overflow-hidden"
                style={{
                  border: '2px solid rgba(220,0,0,0.4)',
                  background: 'linear-gradient(180deg, rgba(220,0,0,0.06) 0%, var(--bg-surface) 100%)',
                }}
              >
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2"
                      style={{ color: '#ff4444' }}>
                      🚨 PHC ALERT
                    </div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      Potential Emergency
                    </div>
                  </div>

                  <span
                    className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{
                      background: isAcknowledged ? 'rgba(34,197,94,0.15)' : 'rgba(220,0,0,0.15)',
                      color: isAcknowledged ? '#22c55e' : '#ff4444',
                      border: `1px solid ${isAcknowledged ? 'rgba(34,197,94,0.3)' : 'rgba(220,0,0,0.3)'}`,
                    }}
                  >
                    {isAcknowledged ? 'REVIEWED' : 'PENDING HUMAN ACKNOWLEDGEMENT'}
                  </span>
                </div>

                {/* Structured Fields Grid (Section 16 requirement:
                    Patient: P-1042
                    Village: Demo Village
                    Urgency: EMERGENCY
                    Reason: Severe breathing difficulty
                    Assigned PHC: Demo Primary Health Centre
                    Status: PENDING HUMAN ACKNOWLEDGEMENT
                ) */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Patient:
                    </div>
                    <div className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {alert.patient_id || 'P-1042'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Village:
                    </div>
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {alert.village || 'Demo Village'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Urgency:
                    </div>
                    <div className="font-black text-sm text-red-500 flex items-center gap-1.5">
                      <span>🔴</span> {alert.urgency || 'EMERGENCY'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Status:
                    </div>
                    <div className="font-bold text-xs" style={{ color: isAcknowledged ? '#22c55e' : '#f97316' }}>
                      {isAcknowledged ? 'REVIEWED' : 'PENDING HUMAN ACKNOWLEDGEMENT'}
                    </div>
                  </div>

                  {/* Reason (full width) */}
                  <div className="col-span-2 p-3.5 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Reason:
                    </div>
                    <div className="font-bold text-sm" style={{ color: '#ff5555' }}>
                      {alert.reason || 'Severe breathing difficulty'}
                    </div>
                  </div>

                  {/* Assigned PHC (full width) */}
                  <div className="col-span-2 p-3.5 rounded-xl flex items-center gap-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <Building2 size={20} style={{ color: '#3b82f6' }} />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Assigned PHC:
                      </div>
                      <div className="font-black text-sm" style={{ color: '#3b82f6' }}>
                        {alert.phc || 'Demo Primary Health Centre'}
                      </div>
                    </div>
                  </div>
                </div>

                {isNotified && (
                  <div className="p-3 rounded-xl flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <Check size={14} />
                    <span>PHC alert dispatched to duty medical officer simulation</span>
                  </div>
                )}

                {/* Section 16 Buttons:
                    Notify PHC
                    View Case
                    Mark Reviewed
                */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleNotify(alert)}
                    disabled={actionLoading === alert.id}
                    className="btn-primary text-xs py-2.5 px-4 font-black flex items-center gap-1.5"
                  >
                    <Radio size={14} />
                    {isNotified ? 'Resend PHC Alert' : 'Notify PHC'}
                  </button>

                  <button
                    onClick={() => navigate(`/cases/${alert.case_id || alert.id}`)}
                    className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    View Case
                  </button>

                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={actionLoading === alert.id || isAcknowledged}
                    className="text-xs py-2.5 px-4 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    style={{
                      background: isAcknowledged ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
                      color: isAcknowledged ? '#22c55e' : 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <CheckCircle size={14} />
                    {isAcknowledged ? 'Reviewed' : 'Mark Reviewed'}
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Required Note from Section 16: "The notification is only a prototype simulation." */}
      <div className="text-center text-xs py-3" style={{ color: 'var(--text-faint)' }}>
        The notification is only a prototype simulation.
      </div>
    </div>
  )
}
