import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { track } from '../lib/analytics'

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    const slug = location.pathname.replace(/^\//, '') || 'home'
    track('page_view', slug)
  }, [location.pathname])

  return null
}
