const BATCH_INTERVAL = 5000
let buffer = []
let timer = null

function getVisitorId() {
  let id = localStorage.getItem('skynet-visitor-id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)
    localStorage.setItem('skynet-visitor-id', id)
  }
  return id
}

function flush() {
  if (buffer.length === 0) return
  const events = [...buffer]
  buffer = []

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  }).catch(() => {
    // silently fail - analytics should never break the app
  })
}

function scheduleFlush() {
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    flush()
  }, BATCH_INTERVAL)
}

export function track(eventType, toolSlug = null, metadata = {}) {
  buffer.push({
    visitor_id: getVisitorId(),
    event_type: eventType,
    tool_slug: toolSlug,
    metadata,
  })
  scheduleFlush()
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('beforeunload', flush)
}
