import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  User, LogOut, Trash2, Sun, Moon, Monitor, Shield,
  ChevronRight, AlertTriangle, X, Check, Info, Heart
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] }
  }),
}

// Typed-confirmation delete dialog
function DeleteAccountDialog({ open, onClose, onConfirm }) {
  const [typed, setTyped] = useState('')
  const CONFIRM_PHRASE = 'DELETE MY ACCOUNT'
  const isReady = typed === CONFIRM_PHRASE

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl overflow-hidden max-w-md mx-auto"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(220,0,0,0.3)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Red top accent */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #dc0000, #7a0000)' }} />

            <div className="p-6 space-y-5">
              {/* Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(220,0,0,0.12)', border: '1px solid rgba(220,0,0,0.25)' }}>
                  <Trash2 size={22} style={{ color: '#dc0000' }} />
                </div>
                <div>
                  <h2 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
                    Delete Account
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto touch-target rounded-xl shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Consequences */}
              <div className="rounded-xl p-4 space-y-2"
                style={{ background: 'rgba(220,0,0,0.06)', border: '1px solid rgba(220,0,0,0.15)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#dc0000' }}>
                  What will be deleted:
                </div>
                {[
                  'All your patient case records',
                  'All triage results and AI analysis history',
                  'All PHC alerts and notifications',
                  'Your ASHA worker profile and session data',
                  'This action is permanent and irreversible',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <AlertTriangle size={12} style={{ color: '#dc0000', flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Typed confirmation */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2"
                  style={{ color: 'var(--text-muted)' }}>
                  Type <span className="font-mono" style={{ color: '#dc0000' }}>{CONFIRM_PHRASE}</span> to confirm
                </label>
                <input
                  type="text"
                  value={typed}
                  onChange={e => setTyped(e.target.value.toUpperCase())}
                  placeholder={CONFIRM_PHRASE}
                  className="input-field w-full font-mono text-sm"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  autoComplete="off"
                  spellCheck={false}
                />
                {typed && !isReady && (
                  <p className="text-xs mt-1" style={{ color: '#f97316' }}>
                    Phrase doesn't match — keep typing
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => { if (isReady) onConfirm() }}
                  disabled={!isReady}
                  className="btn-danger flex-1"
                  style={{ opacity: isReady ? 1 : 0.4, cursor: isReady ? 'pointer' : 'not-allowed' }}
                >
                  <Trash2 size={14} /> Delete Forever
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SettingRow({ icon: Icon, iconColor = '#dc0000', title, subtitle, onClick, rightElement, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors touch-target rounded-xl"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: danger ? 'rgba(220,0,0,0.10)' : `${iconColor}18`,
          border: `1px solid ${danger ? 'rgba(220,0,0,0.2)' : iconColor + '30'}`,
        }}
      >
        <Icon size={18} style={{ color: danger ? '#dc0000' : iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: danger ? '#ff4444' : 'var(--text-primary)' }}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
        )}
      </div>
      {rightElement || (onClick && (
        <ChevronRight size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
      ))}
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loggedOut, setLoggedOut] = useState(false)

  const handleLogout = () => {
    setLoggedOut(true)
    setTimeout(() => {
      setLoggedOut(false)
      navigate('/dashboard')
    }, 2000)
  }

  const handleDeleteConfirm = () => {
    setDeleteOpen(false)
    // In a real app: call delete API, clear tokens, redirect
    setTimeout(() => {
      alert('Account deletion simulated. In a real app, all data would be permanently removed.')
      navigate('/dashboard')
    }, 300)
  }

  const themes = [
    { value: 'system', icon: Monitor, label: 'System' },
    { value: 'light',  icon: Sun,     label: 'Light' },
    { value: 'dark',   icon: Moon,    label: 'Dark' },
  ]

  return (
    <>
      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Account & app preferences
          </p>
          <div className="red-accent-line mt-2" />
        </motion.div>

        {/* Profile Card */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="card">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, #dc0000, #7a0000)',
                boxShadow: '0 4px 16px rgba(220,0,0,0.35)',
              }}
            >
              AW
            </div>
            <div>
              <div className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                ASHA Worker
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Demo Session</div>
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-bold mt-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(220,0,0,0.10)',
                  color: 'var(--red-primary)',
                  border: '1px solid rgba(220,0,0,0.2)',
                }}
              >
                <Heart size={9} fill="currentColor" /> SwasthyaSaarthi v0.1
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="card">
          <div className="section-header mb-4">
            <div className="section-header-icon"><Sun size={16} /></div>
            Appearance
          </div>
          <div className="flex gap-2">
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all touch-target no-select"
                style={{
                  background: theme === value ? 'rgba(220,0,0,0.10)' : 'var(--bg-elevated)',
                  border: `1px solid ${theme === value ? 'rgba(220,0,0,0.35)' : 'var(--border)'}`,
                }}
              >
                <Icon
                  size={20}
                  style={{ color: theme === value ? 'var(--red-primary)' : 'var(--text-muted)' }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: theme === value ? 'var(--red-primary)' : 'var(--text-muted)' }}
                >
                  {label}
                </span>
                {theme === value && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red-primary)' }} />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="card overflow-hidden p-0">
          <div className="px-5 pt-4 pb-2">
            <div className="section-header">
              <div className="section-header-icon"><Shield size={16} /></div>
              Account
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <SettingRow
              icon={User}
              iconColor="#6366f1"
              title="Worker Profile"
              subtitle="ASHA Worker · Demo Session · Rampur Block"
            />
            <SettingRow
              icon={LogOut}
              iconColor="#f97316"
              title="Sign Out"
              subtitle="End current session"
              onClick={handleLogout}
              rightElement={
                loggedOut ? (
                  <Check size={16} style={{ color: '#22c55e' }} />
                ) : undefined
              }
            />
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="card overflow-hidden p-0"
          style={{ border: '1px solid rgba(220,0,0,0.2)' }}>
          <div className="px-5 pt-4 pb-2">
            <div className="section-header" style={{ color: '#dc0000' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(220,0,0,0.12)', border: '1px solid rgba(220,0,0,0.2)' }}>
                <AlertTriangle size={16} style={{ color: '#dc0000' }} />
              </div>
              Danger Zone
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(220,0,0,0.1)' }}>
            <SettingRow
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete all data and records"
              onClick={() => setDeleteOpen(true)}
              danger
            />
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <Info size={14} style={{ color: 'var(--text-faint)', flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              <strong style={{ color: 'var(--text-muted)' }}>SwasthyaSaarthi v0.1 — Prototype</strong><br />
              This is a demonstration prototype. Not a certified medical device.
              Not for clinical use. All AI triage results require human clinical validation.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
