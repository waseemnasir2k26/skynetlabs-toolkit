import { useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'skynetlabs-session'
const HEARTBEAT_KEY = 'skynetlabs-heartbeats'
const BASE_COUNT = 38
const HEARTBEAT_INTERVAL = 15000 // 15 seconds
const SESSION_TTL = 60000 // 60 seconds — session considered active if heartbeat within this window

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function getTimeMultiplier() {
  const hour = new Date().getHours()
  // More visitors during business hours (9am-6pm), fewer at night
  if (hour >= 9 && hour <= 12) return 1.4
  if (hour >= 13 && hour <= 17) return 1.6
  if (hour >= 18 && hour <= 21) return 1.2
  if (hour >= 6 && hour <= 8) return 0.8
  return 0.5
}

function getDayMultiplier() {
  const day = new Date().getDay()
  // Weekdays more traffic than weekends
  if (day === 0 || day === 6) return 0.7
  if (day === 1 || day === 5) return 1.0
  return 1.2 // Tue-Thu peak
}

export default function LiveUsers({ className = '' }) {
  const [count, setCount] = useState(BASE_COUNT)
  const [pulse, setPulse] = useState(false)

  const updateHeartbeat = useCallback(() => {
    const sessionId = getSessionId()
    const now = Date.now()

    try {
      const raw = localStorage.getItem(HEARTBEAT_KEY)
      const beats = raw ? JSON.parse(raw) : {}

      // Register this session
      beats[sessionId] = now

      // Clean expired sessions
      const active = {}
      Object.entries(beats).forEach(([id, ts]) => {
        if (now - ts < SESSION_TTL) {
          active[id] = ts
        }
      })

      localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(active))

      // Count active local sessions
      const localSessions = Object.keys(active).length

      // Calculate realistic visitor estimate
      const timeMult = getTimeMultiplier()
      const dayMult = getDayMultiplier()
      const variance = Math.floor(Math.random() * 5) - 2 // -2 to +2
      const estimated = Math.max(0, Math.round(BASE_COUNT * timeMult * dayMult) + variance + localSessions)

      return estimated
    } catch {
      return BASE_COUNT
    }
  }, [])

  useEffect(() => {
    // Initial count
    const initial = updateHeartbeat()
    setCount(initial)

    // Heartbeat interval
    const interval = setInterval(() => {
      const newCount = updateHeartbeat()
      setCount(prev => {
        if (prev !== newCount) {
          setPulse(true)
          setTimeout(() => setPulse(false), 600)
        }
        return newCount
      })
    }, HEARTBEAT_INTERVAL)

    // Clean up on unmount
    return () => {
      clearInterval(interval)
      try {
        const sessionId = getSessionId()
        const raw = localStorage.getItem(HEARTBEAT_KEY)
        if (raw) {
          const beats = JSON.parse(raw)
          delete beats[sessionId]
          localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(beats))
        }
      } catch {
        // ignore
      }
    }
  }, [updateHeartbeat])

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
      style={{
        background: 'var(--success-soft)',
        color: 'var(--success)',
        border: '1px solid var(--success-soft)',
      }}
    >
      <span
        className="relative flex h-2 w-2"
      >
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: 'var(--success)' }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: 'var(--success)' }}
        />
      </span>
      <span
        className="tabular-nums transition-all duration-300"
        style={{
          transform: pulse ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {count}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>live now</span>
    </div>
  )
}
