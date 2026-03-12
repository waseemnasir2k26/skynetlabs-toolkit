const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    const { events } = req.body
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events array required' })
    }

    const country = req.headers['x-vercel-ip-country'] || 'unknown'
    const userAgent = req.headers['user-agent'] || ''

    const rows = events.map(e => ({
      visitor_id: e.visitor_id || 'anon',
      event_type: e.event_type || 'page_view',
      tool_slug: e.tool_slug || null,
      metadata: e.metadata || {},
      user_agent: userAgent,
      country,
    }))

    const response = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Supabase insert failed:', text)
      return res.status(500).json({ error: 'Insert failed' })
    }

    return res.status(200).json({ ok: true, inserted: rows.length })
  } catch (err) {
    console.error('Track error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
