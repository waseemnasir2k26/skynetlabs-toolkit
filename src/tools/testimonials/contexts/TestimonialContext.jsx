import { createContext, useContext, useState, useCallback } from 'react'
import {
  getTestimonials,
  addTestimonial as addT,
  updateTestimonial as updateT,
  deleteTestimonial as deleteT,
  getSettings,
  saveSettings as saveS,
} from '../utils/storage'

const TestimonialContext = createContext()

export function TestimonialProvider({ children }) {
  const [testimonials, setTestimonials] = useState(() => getTestimonials())
  const [settings, setSettings] = useState(() => getSettings())

  const refresh = useCallback(() => {
    setTestimonials(getTestimonials())
    setSettings(getSettings())
  }, [])

  const addTestimonial = useCallback((data) => {
    const t = addT(data)
    setTestimonials(getTestimonials())
    return t
  }, [])

  const updateTestimonial = useCallback((id, updates) => {
    const t = updateT(id, updates)
    setTestimonials(getTestimonials())
    return t
  }, [])

  const deleteTestimonial = useCallback((id) => {
    deleteT(id)
    setTestimonials(getTestimonials())
  }, [])

  const updateSettings = useCallback((newSettings) => {
    const merged = { ...settings, ...newSettings }
    saveS(merged)
    setSettings(merged)
  }, [settings])

  const approvedTestimonials = testimonials.filter(t => t.status === 'approved')
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending')
  const starredTestimonials = testimonials.filter(t => t.starred)

  const stats = {
    total: testimonials.length,
    approved: approvedTestimonials.length,
    pending: pendingTestimonials.length,
    rejected: testimonials.filter(t => t.status === 'rejected').length,
    starred: starredTestimonials.length,
    averageRating: testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
      : 0,
  }

  return (
    <TestimonialContext.Provider value={{
      testimonials,
      settings,
      stats,
      approvedTestimonials,
      pendingTestimonials,
      starredTestimonials,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      updateSettings,
      refresh,
    }}>
      {children}
    </TestimonialContext.Provider>
  )
}

export function useTestimonials() {
  const context = useContext(TestimonialContext)
  if (!context) {
    throw new Error('useTestimonials must be used within TestimonialProvider')
  }
  return context
}
