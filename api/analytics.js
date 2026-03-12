const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Auth check
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    const range = req.query.range || '7d'
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7

    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceISO = since.toISOString()

    const supaFetch = async (query) => {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      })
      return resp.json()
    }

    // Total visitors (unique visitor_ids)
    const allEvents = await supaFetch(
      `events?select=visitor_id,event_type,tool_slug,created_at,country,user_agent&created_at=gte.${sinceISO}&order=created_at.asc`
    )

    const uniqueVisitors = new Set(allEvents.map(e => e.visitor_id)).size
    const toolUses = allEvents.filter(e => e.event_type === 'tool_use').length
    const pageViews = allEvents.filter(e => e.event_type === 'page_view').length

    // Tool popularity
    const toolCounts = {}
    allEvents.forEach(e => {
      if (e.tool_slug && e.event_type === 'page_view') {
        toolCounts[e.tool_slug] = (toolCounts[e.tool_slug] || 0) + 1
      }
    })
    const topTools = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([slug, count]) => ({ slug, count }))

    // Views over time (group by date)
    const viewsByDate = {}
    allEvents.forEach(e => {
      const date = e.created_at.split('T')[0]
      viewsByDate[date] = (viewsByDate[date] || 0) + 1
    })
    const timeline = Object.entries(viewsByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))

    // Country breakdown
    const countryCounts = {}
    allEvents.forEach(e => {
      const c = e.country || 'unknown'
      countryCounts[c] = (countryCounts[c] || 0) + 1
    })
    const countries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    // Device breakdown (simple UA parsing)
    let mobile = 0, desktop = 0, tablet = 0
    allEvents.forEach(e => {
      const ua = (e.user_agent || '').toLowerCase()
      if (/tablet|ipad/i.test(ua)) tablet++
      else if (/mobile|android|iphone/i.test(ua)) mobile++
      else desktop++
    })

    // Event type breakdown
    const eventTypes = {}
    allEvents.forEach(e => {
      eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1
    })

    return res.status(200).json({
      range,
      totalVisitors: uniqueVisitors,
      pageViews,
      toolUses,
      totalEvents: allEvents.length,
      topTool: topTools[0]?.slug || 'N/A',
      topTools,
      timeline,
      countries,
      devices: { mobile, desktop, tablet },
      eventTypes,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
