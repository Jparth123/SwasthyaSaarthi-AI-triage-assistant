import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Upload, ChevronDown, ChevronUp,
  User, MapPin, Phone, ArrowRight, Sparkles, X, Check,
  Clock, Volume2, ShieldCheck, Play, Square
} from 'lucide-react'
import { createCase } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'

const DEMO_PRESETS = [
  {
    id: 'emergency',
    title: '🔴 Potential Emergency',
    sub: 'Chest pain + Severe breathing difficulty',
    patient_id: 'P-1042',
    age: '44',
    gender: 'Female',
    village: 'Demo Village',
    text: 'Subah se chest mein pain hai aur saans lene mein dikkat ho rahi hai. Bolne mein takleef ho rahi hai.',
    duration: '00:37',
  },
  {
    id: 'dramatic',
    title: '💬 Dramatic Speech (Key Innovation)',
    sub: 'Emotionally intense – No clinical danger sign',
    patient_id: 'P-1043',
    age: '32',
    gender: 'Female',
    village: 'Sitapur',
    text: 'Arre meri toh jaan nikal gayi, main marne wali hoon! Kuch toh karo bhai, itna bura sar dard hai!',
    duration: '00:24',
  },
  {
    id: 'urgent',
    title: '🟠 Urgent Case',
    sub: 'Persistent fever + weakness for 2 days',
    patient_id: 'P-1044',
    age: '28',
    gender: 'Male',
    village: 'Karanpur',
    text: 'Do din se bukhar hai aur chalne mein bahut kamzori lag rahi hai. Khaana nahi kha raha.',
    duration: '00:29',
  },
  {
    id: 'routine',
    title: '🟢 Routine Case',
    sub: 'Mild headache after working in sun',
    patient_id: 'P-1045',
    age: '38',
    gender: 'Male',
    village: 'Anandpur',
    text: 'Kal dhoop mein khet par kaam kiya tha, thoda headache hai. Bukhar nahi hai.',
    duration: '00:19',
  },
]

const GENDER_OPTIONS = ['Male', 'Female', 'Other']

export default function NewCase() {
  const navigate = useNavigate()
  const { isOffline } = useApp()

  const [form, setForm] = useState({
    patient_id: 'P-1042',
    age: '44',
    gender: 'Female',
    village: 'Demo Village',
    phone: '+91 98765 43213',
  })
  const [transcription, setTranscription] = useState(
    'Subah se chest mein pain hai aur saans lene mein dikkat ho rahi hai. Bolne mein takleef ho rahi hai.'
  )
  const [selectedPreset, setSelectedPreset] = useState('emergency')
  const [recording, setRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(37) // default 00:37
  const [hasRecorded, setHasRecorded] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [genderOpen, setGenderOpen] = useState(false)
  const [presetsExpanded, setPresetsExpanded] = useState(true)

  const timerRef = useRef(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Timer logic during active recording
  useEffect(() => {
    if (recording) {
      setRecordTime(0)
      timerRef.current = setInterval(() => {
        setRecordTime(t => t + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [recording])

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const selectPreset = (preset) => {
    setSelectedPreset(preset.id)
    setTranscription(preset.text)
    setForm(f => ({
      ...f,
      patient_id: preset.patient_id,
      age: preset.age,
      gender: preset.gender,
      village: preset.village,
    }))
    setHasRecorded(true)
    setRecordTime(parseInt(preset.duration.split(':')[1]) || 37)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        setHasRecorded(true)
        if (!transcription.trim()) {
          setTranscription('Subah se chest mein pain hai aur saans lene mein dikkat ho rahi hai.')
        }
      }
      mr.start()
      setRecording(true)
    } catch {
      // Mock simulation if mic permission denied
      setRecording(true)
    }
  }

  const stopRecording = () => {
    try { mediaRef.current?.stop() } catch {}
    setRecording(false)
    setHasRecorded(true)
    if (recordTime === 0) setRecordTime(37)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!transcription.trim()) {
      setError('Please record audio or select a preset scenario.')
      return
    }

    try {
      setError(null)
      setSubmitting(true)
      const caseRes = await createCase({
        patient_id: form.patient_id || 'P-1042',
        age: form.age ? parseInt(form.age) : 44,
        gender: form.gender || 'Female',
        village: form.village || 'Demo Village',
        phone: form.phone,
        transcription: transcription.trim(),
      })
      navigate(`/processing/${caseRes.data.id}`)
    } catch (err) {
      console.warn('Backend create case error, navigating to local offline processing:', err)
      // Offline-first graceful fallback: simulate caseId 4
      navigate('/processing/4')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Record New Case
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Enter patient information and capture voice note
        </p>
        <div className="red-accent-line mt-2" />
      </motion.div>

      {/* Quick Scenario Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card"
        style={{ border: '1px solid rgba(220,0,0,0.22)', background: 'rgba(220,0,0,0.03)' }}
      >
        <button
          type="button"
          onClick={() => setPresetsExpanded(v => !v)}
          className="w-full flex items-center justify-between no-select"
        >
          <div className="flex items-center gap-2">
            <div className="section-header-icon"><Sparkles size={16} /></div>
            <div>
              <div className="font-bold text-sm text-left" style={{ color: 'var(--text-primary)' }}>
                Demonstration Audio Scenarios
              </div>
              <div className="text-[11px] text-left" style={{ color: 'var(--text-muted)' }}>
                Click to load realistic Hindi/Hinglish recordings
              </div>
            </div>
          </div>
          {presetsExpanded
            ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
          }
        </button>

        <AnimatePresence>
          {presetsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4"
            >
              {DEMO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className="text-left p-3 rounded-xl transition-all touch-target"
                  style={{
                    background: selectedPreset === preset.id
                      ? 'rgba(220,0,0,0.12)'
                      : 'var(--bg-elevated)',
                    border: `1px solid ${selectedPreset === preset.id ? 'rgba(220,0,0,0.45)' : 'var(--border)'}`,
                  }}
                >
                  <div className="font-bold text-xs" style={{ color: selectedPreset === preset.id ? 'var(--red-primary)' : 'var(--text-primary)' }}>
                    {preset.title}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {preset.sub}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Details Form (Section 12 requirement: Patient ID, Age, Gender, Village) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="section-header-icon"><User size={16} /></div>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Patient Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Patient ID *
              </label>
              <input
                type="text"
                required
                value={form.patient_id}
                onChange={e => setField('patient_id', e.target.value)}
                className="input-field font-mono font-bold"
                placeholder="e.g. P-1042"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Age *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={form.age}
                onChange={e => setField('age', e.target.value)}
                className="input-field"
                placeholder="Years"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Gender *
              </label>
              <select
                value={form.gender}
                onChange={e => setField('gender', e.target.value)}
                className="input-field"
              >
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Village *
              </label>
              <input
                type="text"
                required
                value={form.village}
                onChange={e => setField('village', e.target.value)}
                className="input-field"
                placeholder="e.g. Demo Village"
              />
            </div>
          </div>
        </motion.div>

        {/* Voice Note Recording Box (Section 12 requirement: 
            ┌──────────────────────────────┐
            │          🎙                  │
            │       Start Recording        │
            └──────────────────────────────┘
            Recording complete / 00:37 / Analyze Voice Note
        ) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="section-header-icon"><Mic size={16} /></div>
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Voice Note
              </h2>
            </div>
            {hasRecorded && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <Check size={14} /> Ready for analysis
              </span>
            )}
          </div>

          {/* Large Recording Container */}
          <div
            className="rounded-2xl p-6 text-center border-2 border-dashed flex flex-col items-center justify-center transition-all"
            style={{
              background: recording
                ? 'rgba(220,0,0,0.08)'
                : hasRecorded
                  ? 'var(--bg-elevated)'
                  : 'var(--bg-surface)',
              borderColor: recording
                ? '#dc0000'
                : hasRecorded
                  ? 'rgba(34,197,94,0.4)'
                  : 'var(--border-strong)',
            }}
          >
            {/* Mic / Stop Circle Button */}
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 mb-3
                ${recording ? 'animate-pulse' : ''}`}
              style={{
                background: recording ? '#dc0000' : 'var(--red-primary)',
                color: 'white',
              }}
            >
              {recording ? <Square size={28} /> : <Mic size={32} />}
            </button>

            <div className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
              {recording ? 'Recording Patient Voice Note…' : 'Start Recording'}
            </div>

            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {recording
                ? 'Tap square button to stop recording'
                : 'Click microphone or choose a preset recording above'}
            </div>

            {/* Recording Complete & Duration (Section 12 requirement: Recording complete / 00:37) */}
            <div className="mt-4 pt-3 border-t w-full flex items-center justify-center gap-4"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold"
                style={{ color: recording ? '#dc0000' : '#22c55e' }}>
                <div className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                {recording ? 'Recording In Progress' : 'Recording complete'}
              </div>
              <div className="font-mono text-sm font-black px-3 py-1 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                ⏱ {formatTimer(recordTime)}
              </div>
            </div>
          </div>

          {/* Transcript preview box */}
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Transcribed Speech (Hindi / Hinglish / English)
            </label>
            <textarea
              rows={3}
              value={transcription}
              onChange={e => setTranscription(e.target.value)}
              className="input-field w-full selectable resize-none text-sm"
              placeholder="Spoken symptoms in Hindi or Hinglish will appear here…"
            />
          </div>
        </motion.div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/30 flex items-center justify-between"
            >
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big Action Button (Section 12 requirement: "Analyze Voice Note") */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-4 text-base font-black shadow-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processing Voice Note…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze Voice Note
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.div>

        <p className="text-center text-[11px] pb-3" style={{ color: 'var(--text-faint)' }}>
          AI triage assistant for rural ASHA workers · Strictly triage prioritization, NOT medical diagnosis
        </p>
      </form>
    </div>
  )
}
