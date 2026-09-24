import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [isOffline, setIsOffline] = useState(false)
  const [queuedAlerts, setQueuedAlerts] = useState([])
  const [syncMessage, setSyncMessage] = useState(null)

  const toggleOffline = () => {
    if (isOffline) {
      // Coming back online — sync queued alerts
      setIsOffline(false)
      if (queuedAlerts.length > 0) {
        setSyncMessage(`${queuedAlerts.length} alert(s) synced to PHC system.`)
        setTimeout(() => setSyncMessage(null), 4000)
        setQueuedAlerts([])
      }
    } else {
      setIsOffline(true)
    }
  }

  const queueAlert = (alertId) => {
    setQueuedAlerts(prev => [...prev, alertId])
  }

  return (
    <AppContext.Provider value={{
      isOffline,
      toggleOffline,
      queuedAlerts,
      queueAlert,
      syncMessage,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
