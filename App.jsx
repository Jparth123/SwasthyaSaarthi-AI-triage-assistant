import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'

// Lazy-loaded pages
const Dashboard   = lazy(() => import('./pages/Dashboard.jsx'))
const NewCase     = lazy(() => import('./pages/NewCase.jsx'))
const Processing  = lazy(() => import('./pages/Processing.jsx'))
const TriageResult = lazy(() => import('./pages/TriageResult.jsx'))
const Cases       = lazy(() => import('./pages/Cases.jsx'))
const PHCAlerts   = lazy(() => import('./pages/PHCAlerts.jsx'))
const DemoCases   = lazy(() => import('./pages/DemoCases.jsx'))
const Settings    = lazy(() => import('./pages/Settings.jsx'))

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ minHeight: '50vh' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-9 h-9 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: 'var(--red-primary)', borderTopColor: 'transparent' }}
        />
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="new-case" element={<NewCase />} />
              <Route path="processing/:caseId" element={<Processing />} />
              <Route path="cases" element={<Cases />} />
              <Route path="cases/:caseId" element={<TriageResult />} />
              <Route path="alerts" element={<PHCAlerts />} />
              <Route path="demo" element={<DemoCases />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}
