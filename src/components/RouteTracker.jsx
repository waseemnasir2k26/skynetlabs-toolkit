import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { track } from '../lib/analytics'
import { posthog } from '../lib/monitoring'

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    const slug = location.pathname.replace(/^\//, '') || 'home'
    track('page_view', slug)
    if (posthog?.__loaded) {
      posthog.capture('$pageview', { tool_slug: slug, path: location.pathname })
    }
  }, [location.pathname])

  return null
}
