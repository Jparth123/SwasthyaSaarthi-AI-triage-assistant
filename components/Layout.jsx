import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FilePlus, FolderOpen, Bell, PlayCircle,
  Wifi, WifiOff, Heart, ArrowLeft, Settings, Sun, Moon,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Layers, ArrowUp, ArrowDown, Activity, Shield
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

// ---- TAB SET DEFINITIONS ----
export const TAB_SETS = [
  {
    id: 'all',
    label: 'All Tabs',
    shortLabel: 'All',
    icon: '🌟',
    description: 'Complete view of all available sections',
    tabs: [
      { to: '/dashboard', label: 'Home',       badge: null,  icon: LayoutDashboard },
      { to: '/new-case',  label: 'New Case',   badge: '+',   icon: FilePlus, primary: true },
      { to: '/cases',     label: 'Case Records', badge: '12', icon: FolderOpen },
      { to: '/alerts',    label: 'PHC Alerts', badge: '1',   icon: Bell, isAlert: true },
      { to: '/demo',      label: 'Demo Cases', badge: '5',   icon: PlayCircle },
      { to: '/settings',  label: 'Settings',   badge: null,  icon: Settings },
    ]
  },
  {
    id: 'clinical',
    label: 'Clinical & Triage',
    shortLabel: 'Clinical',
    icon: '🩺',
    description: 'ASHA intake, voice diagnosis & test scenarios',
    tabs: [
      { to: '/dashboard', label: 'Triage Hub',  badge: null,  icon: LayoutDashboard },
      { to: '/new-case',  label: 'New Intake',  badge: 'AI',  icon: FilePlus, primary: true },
      { to: '/demo',      label: 'Demo Cases',  badge: '5',   icon: PlayCircle },
    ]
  },
  {
    id: 'records',
    label: 'Records & Alerts',
    shortLabel: 'Records',
    icon: '📋',
    description: 'Case histories, emergency alerts & offline queues',
    tabs: [
      { to: '/cases',     label: 'Case History', badge: '12', icon: FolderOpen },
      { to: '/alerts',    label: 'PHC Alerts',   badge: '1',  icon: Bell, isAlert: true },
    ]
  },
  {
    id: 'system',
    label: 'System & Tools',
    shortLabel: 'System',
    icon: '⚙️',
    description: 'Network sync, ASHA profile & diagnostics',
    tabs: [
      { to: '/settings',  label: 'Settings',   badge: null, icon: Settings },
      { to: '/dashboard', label: 'Overview',   badge: null, icon: LayoutDashboard },
      { to: '/demo',      label: 'Diagnostics', badge: 'Test', icon: PlayCircle },
    ]
  }
]

const ROOT_ROUTES = ['/dashboard', '/cases', '/new-case', '/alerts', '/demo', '/settings']

// Safe pull-to-refresh hook (will not block normal downward scrolling)
function useSafePullToRefresh(mainRef, onRefresh) {
  const startY = useRef(0)
  const isPulling = useRef(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const THRESHOLD = 72

  const onTouchStart = useCallback((e) => {
    if (!mainRef.current || mainRef.current.scrollTop > 5) return
    startY.current = e.touches[0].clientY
    isPulling.current = true
  }, [mainRef])

  const onTouchMove = useCallback((e) => {
    if (!isPulling.current || !mainRef.current || mainRef.current.scrollTop > 0) {
      isPulling.current = false
      setPullDistance(0)
      return
    }
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) {
      const clamped = Math.min(dy * 0.4, 90)
      setPullDistance(clamped)
    }
  }, [mainRef])

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(0)
      try { await onRefresh?.() } catch (_) {}
      setTimeout(() => setRefreshing(false), 700)
    } else {
      setPullDistance(0)
    }
    isPulling.current = false
  }, [pullDistance, refreshing, onRefresh])

  return { pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd }
}

export default function Layout() {
  const { isOffline, toggleOffline, syncMessage } = useApp()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Tab Set State
  const [activeSetId, setActiveSetId] = useState('all')
  const currentSet = TAB_SETS.find(s => s.id === activeSetId) || TAB_SETS[0]

  // Main scroll container ref & state
  const mainScrollRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  // Top tab bar horizontal scroll ref & state
  const topTabsScrollRef = useRef(null)
  const [canScrollTopLeft, setCanScrollTopLeft] = useState(false)
  const [canScrollTopRight, setCanScrollTopRight] = useState(false)

  // Bottom tab bar horizontal scroll ref & state
  const bottomTabsScrollRef = useRef(null)
  const [canScrollBottomLeft, setCanScrollBottomLeft] = useState(false)
  const [canScrollBottomRight, setCanScrollBottomRight] = useState(false)

  const isRoot = ROOT_ROUTES.includes(location.pathname) || location.pathname === '/'
  const isSubPage = !isRoot

  // Page titles
  const routeTitles = {
    '/dashboard': 'Dashboard',
    '/cases': 'Case History',
    '/new-case': 'New Case',
    '/alerts': 'PHC Alerts',
    '/demo': 'Demo Cases',
    '/settings': 'Settings',
  }
  const activeTitle = routeTitles[location.pathname] ||
    (location.pathname.startsWith('/cases/') ? 'Triage Result' :
     location.pathname.startsWith('/processing/') ? 'Processing…' : 'SwasthyaSaarthi')

  // Reset main scroll to top on route change
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname])

  // Track main content vertical scroll
  const handleMainScroll = useCallback(() => {
    const el = mainScrollRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const maxScroll = Math.max(1, scrollHeight - clientHeight)
    const pct = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)))

    setScrollProgress(pct)
    setCanScrollUp(scrollTop > 40)
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 40)
  }, [])

  // Check main scrollability on resize or content change
  useEffect(() => {
    handleMainScroll()
    const el = mainScrollRef.current
    if (!el) return
    const resizeObserver = new ResizeObserver(handleMainScroll)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [handleMainScroll, location.pathname])

  // Scroll main container to top or bottom
  const scrollToMainTop = () => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const scrollToMainBottom = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Update horizontal tab scroll indicators
  const updateTabScrollIndicators = useCallback((ref, setLeft, setRight) => {
    const el = ref.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setLeft(scrollLeft > 5)
    setRight(scrollLeft + clientWidth < scrollWidth - 5)
  }, [])

  const checkTopTabsScroll = useCallback(() => {
    updateTabScrollIndicators(topTabsScrollRef, setCanScrollTopLeft, setCanScrollTopRight)
  }, [updateTabScrollIndicators])

  const checkBottomTabsScroll = useCallback(() => {
    updateTabScrollIndicators(bottomTabsScrollRef, setCanScrollBottomLeft, setCanScrollBottomRight)
  }, [updateTabScrollIndicators])

  useEffect(() => {
    checkTopTabsScroll()
    checkBottomTabsScroll()
  }, [activeSetId, checkTopTabsScroll, checkBottomTabsScroll])

  // Tab horizontal scroll buttons handlers
  const scrollTabs = (ref, direction) => {
    const el = ref.current
    if (!el) return
    const delta = direction === 'left' ? -200 : 200
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Auto-scroll active tab into view in top & bottom strips
  useEffect(() => {
    const autoCenterActiveTab = (ref) => {
      const el = ref.current
      if (!el) return
      const activeEl = el.querySelector('[aria-current="page"], .active-tab')
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
    const timer = setTimeout(() => {
      autoCenterActiveTab(topTabsScrollRef)
      autoCenterActiveTab(bottomTabsScrollRef)
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname, activeSetId])

  // Wheel horizontal scrolling on tab bar
  const handleTabWheel = (e, ref) => {
    if (!ref.current) return
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      ref.current.scrollLeft += e.deltaY * 0.8
    }
  }

  // Cycle next tab set
  const cycleTabSet = () => {
    const currentIndex = TAB_SETS.findIndex(s => s.id === activeSetId)
    const nextIndex = (currentIndex + 1) % TAB_SETS.length
    setActiveSetId(TAB_SETS[nextIndex].id)
  }

  // Safe pull to refresh
  const { pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = useSafePullToRefresh(
    mainScrollRef,
    async () => { /* trigger page refresh if needed */ }
  )

  return (
    <div
      className="flex flex-col w-full h-full min-h-screen overflow-hidden select-none"
      style={{
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        height: '100vh',
        maxHeight: '100dvh',
      }}
    >
      {/* ======================================================
          TOP HEADER
          ====================================================== */}
      <header
        className="shrink-0 flex items-center justify-between gap-3 border-b z-30"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          paddingTop: `calc(var(--safe-top) + 8px)`,
          paddingBottom: '8px',
          paddingLeft: `calc(var(--safe-left) + 16px)`,
          paddingRight: `calc(var(--safe-right) + 16px)`,
          boxShadow: '0 1px 0 var(--border), 0 2px 10px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isSubPage ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #dc0000, #8b0000)',
                boxShadow: '0 2px 8px rgba(220,0,0,0.35)',
              }}
            >
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                {isSubPage ? activeTitle : 'SwasthyaSaarthi'}
              </span>
              {!isSubPage && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20">
                  AI Triage
                </span>
              )}
            </div>
            {!isSubPage && (
              <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                ASHA Clinical Decision Support
              </div>
            )}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Offline Toggle */}
          <button
            onClick={toggleOffline}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOffline
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
            title={isOffline ? 'Offline Mode (Click to go online)' : 'Online Mode'}
          >
            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Sync Message Banner */}
      {syncMessage && (
        <div
          className="shrink-0 text-xs text-center py-1.5 font-semibold flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-500 border-b border-emerald-500/20"
        >
          <Wifi className="w-3.5 h-3.5" />
          {syncMessage}
        </div>
      )}

      {/* ======================================================
          TAB SETS & SCROLLABLE TABS SYSTEM (Interactive Strip)
          ====================================================== */}
      <section
        className="shrink-0 border-b z-20"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* ROW 1: BUTTONS TO VIEW DIFFERENT SETS OF TABS */}
        <div
          className="flex items-center justify-between gap-2 px-3 pt-2 pb-1.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
              <Layers size={13} className="text-red-500" />
              Tab Sets:
            </span>

            {TAB_SETS.map(set => {
              const isActive = set.id === activeSetId
              return (
                <button
                  key={set.id}
                  onClick={() => setActiveSetId(set.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                      : 'bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                  title={set.description}
                >
                  <span>{set.icon}</span>
                  <span>{set.shortLabel}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded-full font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300'
                    }`}
                  >
                    {set.tabs.length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Quick cycle button */}
          <button
            onClick={cycleTabSet}
            className="px-2 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 flex items-center gap-1"
            title="Cycle to next tab set"
          >
            <span className="hidden sm:inline">Next Set</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ROW 2: SCROLLING SYSTEM TO VIEW TABS (Left & Right Buttons + Scroll Strip) */}
        <div className="relative flex items-center px-2 py-1.5">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollTabs(topTabsScrollRef, 'left')}
            disabled={!canScrollTopLeft}
            className={`p-1.5 rounded-lg mr-1.5 transition-all shrink-0 ${
              canScrollTopLeft
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-red-600 hover:text-white cursor-pointer shadow-sm'
                : 'text-neutral-400/40 opacity-40 cursor-default'
            }`}
            aria-label="Scroll tabs left"
            title="Scroll tabs left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Horizontally Scrollable Tab Strip */}
          <div
            ref={topTabsScrollRef}
            onScroll={checkTopTabsScroll}
            onWheel={(e) => handleTabWheel(e, topTabsScrollRef)}
            className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {currentSet.tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                      isActive
                        ? 'active-tab bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/35 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-900/90 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} className={isActive ? 'text-red-600 dark:text-red-400' : 'text-neutral-400'} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            tab.isAlert
                              ? 'bg-red-500 text-white animate-pulse'
                              : isActive
                              ? 'bg-red-600 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollTabs(topTabsScrollRef, 'right')}
            disabled={!canScrollTopRight}
            className={`p-1.5 rounded-lg ml-1.5 transition-all shrink-0 ${
              canScrollTopRight
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-red-600 hover:text-white cursor-pointer shadow-sm'
                : 'text-neutral-400/40 opacity-40 cursor-default'
            }`}
            aria-label="Scroll tabs right"
            title="Scroll tabs right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ======================================================
          MAIN SCROLLABLE CONTENT (Flawless Up/Down Scrolling)
          ====================================================== */}
      <main
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 min-h-0 w-full scroll-content relative"
        style={{
          paddingLeft: `var(--safe-left)`,
          paddingRight: `var(--safe-right)`,
        }}
      >
        {/* Pull-to-refresh Visual Indicator */}
        {(pullDistance > 6 || refreshing) && (
          <div
            className="flex items-center justify-center gap-2 py-2 overflow-hidden transition-all text-xs font-semibold text-neutral-400"
            style={{ height: refreshing ? 44 : pullDistance }}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent ${
                refreshing ? 'animate-spin' : ''
              }`}
              style={{ transform: `rotate(${(pullDistance / 72) * 180}deg)` }}
            />
            <span>{refreshing ? 'Refreshing data…' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}</span>
          </div>
        )}

        {/* Page Inner Container */}
        <div className="p-4 sm:p-6 pb-24 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ======================================================
          FLOATING VERTICAL SCROLL NAVIGATION CONTROLS (Up / Down)
          ====================================================== */}
      <div
        className="fixed right-4 bottom-20 z-40 flex flex-col gap-2 no-select"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Scroll To Top Button */}
        <button
          onClick={scrollToMainTop}
          className={`p-2.5 rounded-full shadow-lg border transition-all duration-200 flex items-center justify-center ${
            canScrollUp
              ? 'bg-neutral-900/90 text-white dark:bg-white/90 dark:text-neutral-900 border-neutral-700 hover:scale-105 active:scale-95 shadow-red-500/20'
              : 'opacity-0 pointer-events-none translate-y-2'
          }`}
          aria-label="Scroll to top"
          title={`Scroll to Top (${scrollProgress}%)`}
        >
          <ArrowUp size={16} />
        </button>

        {/* Scroll To Bottom Button */}
        <button
          onClick={scrollToMainBottom}
          className={`p-2.5 rounded-full shadow-lg border transition-all duration-200 flex items-center justify-center ${
            canScrollDown
              ? 'bg-neutral-900/90 text-white dark:bg-white/90 dark:text-neutral-900 border-neutral-700 hover:scale-105 active:scale-95 shadow-red-500/20'
              : 'opacity-0 pointer-events-none -translate-y-2'
          }`}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <ArrowDown size={16} />
        </button>
      </div>

      {/* ======================================================
          BOTTOM NAVIGATION BAR (Mobile & Quick Access)
          ====================================================== */}
      <nav
        className="shrink-0 border-t z-30 flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          paddingBottom: `calc(var(--safe-bottom) + 4px)`,
          paddingLeft: `var(--safe-left)`,
          paddingRight: `var(--safe-right)`,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-2 py-1">
          {/* Scroll Tabs Left (Bottom) */}
          <button
            onClick={() => scrollTabs(bottomTabsScrollRef, 'left')}
            disabled={!canScrollBottomLeft}
            className={`p-1.5 rounded-lg transition-all ${
              canScrollBottomLeft ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800' : 'opacity-20 pointer-events-none'
            }`}
            aria-label="Scroll bottom tabs left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Horizontally Scrollable Bottom Tabs */}
          <div
            ref={bottomTabsScrollRef}
            onScroll={checkBottomTabsScroll}
            onWheel={(e) => handleTabWheel(e, bottomTabsScrollRef)}
            className="flex-1 flex items-center justify-around gap-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          >
            {currentSet.tabs.map((tab) => {
              const Icon = tab.icon
              const isPrimary = tab.primary
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `nav-item flex-1 min-w-[56px] max-w-[90px] flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isPrimary ? (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #dc0000, #880000)',
                            boxShadow: isActive
                              ? '0 4px 14px rgba(220,0,0,0.5)'
                              : '0 2px 6px rgba(220,0,0,0.3)',
                          }}
                        >
                          <Icon size={20} color="white" />
                        </div>
                      ) : (
                        <div
                          className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                          style={{
                            background: isActive ? 'rgba(220,0,0,0.12)' : 'transparent',
                          }}
                        >
                          <Icon
                            size={18}
                            style={{
                              color: isActive ? 'var(--red-primary)' : 'var(--text-muted)',
                              transition: 'color 0.2s ease',
                            }}
                          />
                          {tab.isAlert && (
                            <span
                              className="absolute top-1 right-1 w-2 h-2 rounded-full pulse-gentle"
                              style={{ background: 'var(--red-primary)' }}
                            />
                          )}
                        </div>
                      )}
                      <span
                        className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-full"
                        style={{
                          color: isActive ? 'var(--red-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {tab.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Scroll Tabs Right (Bottom) */}
          <button
            onClick={() => scrollTabs(bottomTabsScrollRef, 'right')}
            disabled={!canScrollBottomRight}
            className={`p-1.5 rounded-lg transition-all ${
              canScrollBottomRight ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800' : 'opacity-20 pointer-events-none'
            }`}
            aria-label="Scroll bottom tabs right"
          >
            <ChevronRight size={16} />
          </button>

          {/* Quick Tab Set Switcher Button in Bottom Bar */}
          <button
            onClick={cycleTabSet}
            className="p-2 ml-1 rounded-xl bg-neutral-200/70 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold"
            title={`Current set: ${currentSet.label}. Click to switch set.`}
          >
            <Layers size={14} className="text-red-500" />
            <span className="hidden xs:inline">{currentSet.shortLabel}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
