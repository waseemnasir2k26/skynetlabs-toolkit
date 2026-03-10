import { useState, useMemo, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import { useToast } from '../shared/Toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const PLATFORMS = ['LinkedIn', 'Instagram', 'Twitter', 'Blog', 'YouTube', 'Newsletter']

const FUNNEL_STAGES = {
  TOFU: { label: 'Top of Funnel', color: 'var(--info)', short: 'TOFU' },
  MOFU: { label: 'Middle of Funnel', color: 'var(--warning)', short: 'MOFU' },
  BOFU: { label: 'Bottom of Funnel', color: 'var(--accent)', short: 'BOFU' },
}

const CONTENT_TYPES = {
  LinkedIn: ['Text Post', 'Carousel', 'Article', 'Poll', 'Video'],
  Instagram: ['Reel', 'Carousel', 'Story', 'Static Post', 'Live'],
  Twitter: ['Thread', 'Single Tweet', 'Poll', 'Space'],
  Blog: ['How-To Guide', 'Case Study', 'List Post', 'Opinion Piece', 'Tutorial'],
  YouTube: ['Tutorial', 'Vlog', 'Interview', 'Review', 'Short'],
  Newsletter: ['Deep Dive', 'Curated Links', 'Case Study', 'Tips & Tricks', 'Behind the Scenes'],
}

const HOOKS_TEMPLATES = [
  'The #1 mistake {niche} professionals make with {topic}',
  'I {action} {topic} for {time} - here\'s what happened',
  'Stop doing {topic} wrong. Here\'s the right way.',
  '{number} {topic} tips that actually work in {year}',
  'Why most {target_client} fail at {topic} (and how to fix it)',
  'The {topic} framework I use with every client',
  'Unpopular opinion: {topic} is overrated. Here\'s what to do instead.',
  'How I helped a {target_client} {result} using {topic}',
  '{topic} in {year}: What\'s changed and what hasn\'t',
  'Your {topic} strategy is broken. Let me show you why.',
  'I analyzed {number} {niche} accounts. Here\'s what the top 1% do differently with {topic}.',
  'The simple {topic} system that saves me {number} hours/week',
  '{target_client}? You need to know this about {topic}.',
  'How to master {topic} without {common_objection}',
  'What I wish I knew about {topic} when I started in {niche}',
]

const REPURPOSE_MAP = {
  Blog: ['LinkedIn Article', 'Twitter Thread', 'Newsletter Deep Dive', 'Instagram Carousel', 'YouTube Tutorial'],
  YouTube: ['Blog Post', 'LinkedIn Carousel', 'Instagram Reels (clips)', 'Twitter Thread', 'Newsletter Feature'],
  LinkedIn: ['Twitter Thread', 'Blog Expansion', 'Newsletter Snippet', 'Instagram Post'],
  Newsletter: ['LinkedIn Post', 'Blog Post', 'Twitter Thread'],
  Instagram: ['LinkedIn Post', 'Twitter Post', 'Pinterest Pin'],
  Twitter: ['LinkedIn Post', 'Instagram Story', 'Newsletter Snippet'],
}

function generateCalendar(niche, topics, targetClient, platforms, frequency) {
  const calendar = []
  const funnelOrder = ['TOFU', 'TOFU', 'MOFU', 'BOFU']
  const year = new Date().getFullYear()
  const actions = ['built', 'tested', 'analyzed', 'implemented', 'optimized']
  const times = ['30 days', '6 months', '1 year', '90 days']
  const numbers = ['5', '7', '10', '3', '12']
  const results = ['2x revenue', 'cut costs 40%', 'grow 300%', 'save 10hrs/week', 'double conversions']
  const objections = ['spending a fortune', 'years of experience', 'a huge team', 'expensive tools']

  let hookIdx = 0

  for (let week = 1; week <= 13; week++) {
    platforms.forEach((platform) => {
      const postsThisWeek = frequency[platform] || 1
      for (let p = 0; p < postsThisWeek; p++) {
        const topicIdx = (week + p) % topics.length
        const topic = topics[topicIdx]
        const funnelStage = funnelOrder[(week - 1) % funnelOrder.length]
        const contentTypes = CONTENT_TYPES[platform] || ['Post']
        const contentType = contentTypes[(week + p) % contentTypes.length]

        let hook = HOOKS_TEMPLATES[hookIdx % HOOKS_TEMPLATES.length]
        hook = hook
          .replace(/{niche}/g, niche)
          .replace(/{topic}/g, topic)
          .replace(/{target_client}/g, targetClient)
          .replace(/{year}/g, String(year))
          .replace(/{action}/g, actions[hookIdx % actions.length])
          .replace(/{time}/g, times[hookIdx % times.length])
          .replace(/{number}/g, numbers[hookIdx % numbers.length])
          .replace(/{result}/g, results[hookIdx % results.length])
          .replace(/{common_objection}/g, objections[hookIdx % objections.length])

        hookIdx++

        calendar.push({
          id: `w${week}-${platform}-${p}`,
          week,
          platform,
          contentType,
          topic,
          hook,
          funnelStage,
          status: 'Planned',
        })
      }
    })
  }

  return calendar
}

function generatePillars(topics, niche) {
  const pillars = [
    { name: `${topics[0] || niche} Fundamentals`, description: `Educational content that breaks down core ${topics[0] || niche} concepts for your audience.`, topics: topics.slice(0, 2) },
    { name: 'Client Success Stories', description: `Case studies and results that prove your expertise in ${niche}.`, topics: ['Before/After', 'Process Reveals', 'Testimonials'] },
    { name: 'Industry Insights', description: `Hot takes, trends, and opinions that position you as a thought leader in ${niche}.`, topics: ['Trends', 'Predictions', 'Opinion'] },
    { name: 'Behind the Scenes', description: 'Personal brand content showing your process, tools, and day-to-day work.', topics: ['Tools', 'Workflow', 'Lessons Learned'] },
  ]
  if (topics.length > 2) {
    pillars.push({ name: `Advanced ${topics[2]}`, description: `Deep dives into ${topics[2]} for your most engaged followers.`, topics: topics.slice(2, 4) })
  }
  return pillars
}

export default function App() {
  const [niche, setNiche] = useState('')
  const [topicInput, setTopicInput] = useState('')
  const [topics, setTopics] = useState([])
  const [targetClient, setTargetClient] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [frequency, setFrequency] = useState({})
  const [generated, setGenerated] = useState(false)
  const [calendar, setCalendar] = useState([])
  const [filterPlatform, setFilterPlatform] = useState('All')
  const [filterWeek, setFilterWeek] = useState('All')
  const [filterFunnel, setFilterFunnel] = useState('All')
  const [statuses, setStatuses] = useState({})
  const exportRef = useRef(null)
  const toast = useToast()

  const addTopic = () => {
    const t = topicInput.trim()
    if (t && topics.length < 5 && !topics.includes(t)) {
      setTopics((prev) => [...prev, t])
      setTopicInput('')
    }
  }
  const removeTopic = (t) => setTopics((prev) => prev.filter((x) => x !== t))

  const togglePlatform = (p) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p)
      return [...prev, p]
    })
    if (!frequency[p]) setFrequency((prev) => ({ ...prev, [p]: 2 }))
  }

  const updateFrequency = (platform, val) => setFrequency((prev) => ({ ...prev, [platform]: Number(val) }))

  const handleGenerate = () => {
    if (!niche || topics.length === 0 || !targetClient || selectedPlatforms.length === 0) return
    const cal = generateCalendar(niche, topics, targetClient, selectedPlatforms, frequency)
    setCalendar(cal)
    setGenerated(true)
    setStatuses({})
  }

  const pillars = useMemo(() => {
    if (!generated) return []
    return generatePillars(topics, niche)
  }, [generated, topics, niche])

  const filteredCalendar = useMemo(() => {
    return calendar.filter((item) => {
      if (filterPlatform !== 'All' && item.platform !== filterPlatform) return false
      if (filterWeek !== 'All' && item.week !== Number(filterWeek)) return false
      if (filterFunnel !== 'All' && item.funnelStage !== filterFunnel) return false
      return true
    })
  }, [calendar, filterPlatform, filterWeek, filterFunnel])

  const weeklyBreakdown = useMemo(() => {
    if (!generated) return []
    const weeks = {}
    calendar.forEach((item) => {
      if (!weeks[item.week]) weeks[item.week] = { week: item.week, items: [], platforms: new Set() }
      weeks[item.week].items.push(item)
      weeks[item.week].platforms.add(item.platform)
    })
    return Object.values(weeks).sort((a, b) => a.week - b.week)
  }, [calendar, generated])

  const updateStatus = (id, status) => setStatuses((prev) => ({ ...prev, [id]: status }))
  const getStatus = (id) => statuses[id] || 'Planned'

  const handleExportCSV = () => {
    const header = 'Week,Platform,Content Type,Topic,Hook/Headline,Funnel Stage,Status'
    const rows = calendar.map((item) =>
      `${item.week},"${item.platform}","${item.contentType}","${item.topic}","${item.hook.replace(/"/g, '""')}","${FUNNEL_STAGES[item.funnelStage].label}","${getStatus(item.id)}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content-calendar-90-day.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = async () => {
    const el = exportRef.current
    if (!el) return
    const orig = { overflow: el.style.overflow, height: el.style.height, maxHeight: el.style.maxHeight }
    el.style.overflow = 'visible'
    el.style.height = 'auto'
    el.style.maxHeight = 'none'
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#f4f5f7' : '#050507' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ratio = pw / canvas.width
      const totalH = canvas.height * ratio
      let pos = 0
      while (pos < totalH) {
        if (pos > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -pos, pw, totalH)
        pos += ph
      }
      pdf.save('content-strategy-90-day.pdf')
      if (toast) toast('Content plan exported as PDF!', 'success')
    } finally {
      el.style.overflow = orig.overflow
      el.style.height = orig.height
      el.style.maxHeight = orig.maxHeight
    }
  }

  const canGenerate = niche && topics.length > 0 && targetClient && selectedPlatforms.length > 0

  return (
    <ToolLayout
      title="90-Day Content Strategy Planner"
      description="Generate a complete 90-day content calendar with content pillars, hooks, and repurposing maps tailored to your niche."
    >
      {/* Input Form */}
      <ResultCard title="Strategy Setup" icon="🎯" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm mb-2 block" style={{ color: "var(--text-muted)" }}>Your Niche / Industry *</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., Digital Marketing, SaaS, Real Estate"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block" style={{ color: "var(--text-muted)" }}>Target Client Type *</label>
            <input
              type="text"
              value={targetClient}
              onChange={(e) => setTargetClient(e.target.value)}
              placeholder="e.g., Small business owners, Startup founders"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
            />
          </div>
        </div>

        {/* Topics */}
        <div className="mt-4">
          <label className="text-sm mb-2 block" style={{ color: "var(--text-muted)" }}>Expertise Topics (3-5) *</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              placeholder="Type a topic and press Enter"
              className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
            />
            <button onClick={addTopic} disabled={topics.length >= 5} className="px-4 py-2 text-sm disabled:opacity-40 rounded-lg transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft)", color: "var(--accent)" }}>
                {t}
                <button onClick={() => removeTopic(t)} className="ml-1" style={{ color: "var(--accent)" }}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="mt-4">
          <label className="text-sm mb-2 block" style={{ color: "var(--text-muted)" }}>Platforms *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className="px-3 py-2 text-sm rounded-lg transition-all"
                style={selectedPlatforms.includes(p)
                  ? { border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' }
                  : { border: '1px solid var(--border)', color: 'var(--text-muted)' }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        {selectedPlatforms.length > 0 && (
          <div className="mt-4">
            <label className="text-sm mb-2 block" style={{ color: "var(--text-muted)" }}>Posts per Week</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {selectedPlatforms.map((p) => (
                <div key={p}>
                  <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>{p}</label>
                  <select
                    value={frequency[p] || 2}
                    onChange={(e) => updateFrequency(p, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                  >
                    {[1, 2, 3, 4, 5, 7].map((n) => <option key={n} value={n}>{n}x/week</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed font-medium rounded-lg transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
          >
            Generate 90-Day Strategy
          </button>
        </div>
      </ResultCard>

      {generated && (
        <div ref={exportRef}>
          {/* Strategy Overview */}
          <ResultCard title="Strategy Overview" icon="📋" className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg p-4 text-center" style={{ background: "var(--bg-elevated)" }}>
                <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{calendar.length}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Total Content Pieces</div>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: "var(--bg-elevated)" }}>
                <div className="text-2xl font-bold" style={{ color: "var(--info)" }}>{selectedPlatforms.length}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Platforms</div>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: "var(--bg-elevated)" }}>
                <div className="text-2xl font-bold" style={{ color: "var(--warning)" }}>{pillars.length}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Content Pillars</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your {niche} content strategy targets <span style={{ color: "var(--text-heading)" }}>{targetClient}</span> across {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} with {calendar.length} pieces of content over 13 weeks. Content is distributed across funnel stages to attract, nurture, and convert.
            </p>
          </ResultCard>

          {/* Content Pillars */}
          <ResultCard title="Content Pillars" icon="🏛" className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillars.map((pillar, i) => (
                <div key={i} className="rounded-lg p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--text-heading)" }}>{pillar.name}</h4>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{pillar.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {pillar.topics.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Filters */}
          <ResultCard title="90-Day Calendar" icon="📅" className="mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Platform</label>
                <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}>
                  <option value="All">All Platforms</option>
                  {selectedPlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Week</label>
                <select value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)} className="px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}>
                  <option value="All">All Weeks</option>
                  {Array.from({ length: 13 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Funnel Stage</label>
                <select value={filterFunnel} onChange={(e) => setFilterFunnel(e.target.value)} className="px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}>
                  <option value="All">All Stages</option>
                  {Object.entries(FUNNEL_STAGES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            </div>

            {/* Calendar Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Week</th>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Platform</th>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Type</th>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Topic</th>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Hook / Headline</th>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Funnel</th>
                    <th className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalendar.slice(0, 100).map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-2 px-3" style={{ color: "var(--text-body)" }}>{item.week}</td>
                      <td className="py-2 px-3" style={{ color: "var(--text-body)" }}>{item.platform}</td>
                      <td className="py-2 px-3" style={{ color: "var(--text-body)" }}>{item.contentType}</td>
                      <td className="py-2 px-3" style={{ color: "var(--text-heading)" }}>{item.topic}</td>
                      <td className="py-2 px-3 max-w-xs truncate" style={{ color: "var(--text-body)" }} title={item.hook}>{item.hook}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${FUNNEL_STAGES[item.funnelStage].color}20`, color: FUNNEL_STAGES[item.funnelStage].color }}>
                          {FUNNEL_STAGES[item.funnelStage].short}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={getStatus(item.id)}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className="px-2 py-1 rounded text-xs focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                        >
                          <option value="Planned">Planned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                          <option value="Skipped">Skipped</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCalendar.length > 100 && (
                <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>Showing first 100 of {filteredCalendar.length} entries. Use filters to narrow down.</p>
              )}
            </div>
          </ResultCard>

          {/* Weekly Breakdown */}
          <ResultCard title="Weekly Breakdown" icon="📆" className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {weeklyBreakdown.map((w) => (
                <div key={w.week} className="rounded-lg p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-heading)" }}>Week {w.week}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{w.items.length} posts</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...w.platforms].map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Repurposing Map */}
          <ResultCard title="Repurposing Map" icon="🔄" className="mb-8">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Maximize each piece of content by repurposing across platforms.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlatforms.map((platform) => (
                <div key={platform} className="rounded-lg p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--text-heading)" }}>{platform} Content</h4>
                  <div className="space-y-1">
                    {(REPURPOSE_MAP[platform] || []).map((target, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--accent)" }}>&#8594;</span>
                        <span>{target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Export Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Calendar CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Strategy PDF
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
