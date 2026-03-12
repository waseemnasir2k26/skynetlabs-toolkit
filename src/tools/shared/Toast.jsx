import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const typeStyles = {
  success: { color: 'var(--success)', bg: 'var(--success-soft)' },
  error: { color: 'var(--danger)', bg: 'var(--danger-soft)' },
  info: { color: 'var(--info)', bg: 'var(--info-soft)' },
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const style = typeStyles[toast.type] || typeStyles.info

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(100%)' : 'translateX(0)',
      }}
    >
      <span style={{ color: style.color }}>{icons[toast.type] || icons.info}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{toast.message}</span>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
