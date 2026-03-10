import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

const CAMPAIGN_GOALS = ['Lead Generation', 'Sales / Revenue', 'Brand Awareness', 'App Installs', 'Community Building', 'Product Launch']
const DURATIONS = ['2 weeks', '30 days', '60 days', '90 days']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
const PRESENCE_OPTIONS = ['Website', 'Instagram', 'LinkedIn', 'Facebook', 'YouTube', 'TikTok', 'Email List', 'None']

const CHANNEL_COLORS = ['#13b973', '#0ed4e6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

const CHANNEL_DATA = {
  Website: { label: 'Website / SEO', minBudget: 0.15, priority: 8, type: 'owned' },
  Instagram: { label: 'Instagram', minBudget: 0.12, priority: 7, type: 'social' },
  LinkedIn: { label: 'LinkedIn', minBudget: 0.10, priority: 7, type: 'social' },
  Facebook: { label: 'Facebook Ads', minBudget: 0.15, priority: 8, type: 'paid' },
  YouTube: { label: 'YouTube', minBudget: 0.10, priority: 6, type: 'social' },
  TikTok: { label: 'TikTok', minBudget: 0.08, priority: 5, type: 'social' },
  'Email List': { label: 'Email Marketing', minBudget: 0.10, priority: 9, type: 'owned' },
  'Google Ads': { label: 'Google Ads', minBudget: 0.20, priority: 9, type: 'paid' },
}

const GOAL_WEIGHTS = {
  'Lead Generation': { paid: 1.3, social: 0.8, owned: 1.2 },
  'Sales / Revenue': { paid: 1.5, social: 0.7, owned: 1.0 },
  'Brand Awareness': { paid: 0.8, social: 1.4, owned: 0.9 },
  'App Installs': { paid: 1.4, social: 1.0, owned: 0.7 },
  'Community Building': { paid: 0.6, social: 1.5, owned: 1.1 },
  'Product Launch': { paid: 1.2, social: 1.1, owned: 1.0 },
}

const CONTENT_TYPES = {
  'Lead Generation': ['Case study post', 'Client testimonial', 'Free resource promo', 'How-to guide', 'Behind the scenes', 'FAQ carousel', 'Industry insight'],
  'Sales / Revenue': ['Product showcase', 'Limited-time offer', 'Customer success story', 'Comparison post', 'Unboxing/demo', 'Social proof', 'Flash sale countdown'],
  'Brand Awareness': ['Brand story', 'Team spotlight', 'Industry trend analysis', 'Meme/relatable content', 'Collaboration post', 'Value-driven tip', 'Milestone celebration'],
  'App Installs': ['App feature highlight', 'User testimonial', 'Tutorial video', 'Before/after', 'Quick tip', 'App update announcement', 'UGC repost'],
  'Community Building': ['Poll/question', 'Member spotlight', 'Discussion prompt', 'Challenge launch', 'Live Q&A promo', 'Community win', 'Weekly roundup'],
  'Product Launch': ['Teaser/countdown', 'Feature reveal', 'Founder story', 'Beta user feedback', 'Launch day post', 'Press/media mention', 'FAQ thread'],
}

const FUNNEL_STAGES = [
  { stage: 'Awareness', icon: '👁️', color: 'var(--info)', bg: 'var(--info-soft)', borderColor: 'var(--info)' },
  { stage: 'Interest', icon: '💡', color: 'var(--warning)', bg: 'var(--warning-soft)', borderColor: 'var(--warning)' },
  { stage: 'Consideration', icon: '🤔', color: 'var(--text-muted)', bg: 'var(--bg-elevated)', borderColor: 'var(--border)' },
  { stage: 'Conversion', icon: '🎯', color: 'var(--accent)', bg: 'var(--accent-soft)', borderColor: 'var(--accent)' },
]

function generateStrategy(form) {
  const { serviceName, businessDesc, goal, audience, budget, currency, duration, presence } = form
  const budgetNum = parseFloat(budget) || 0
  const goalWeights = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS['Lead Generation']

  // Determine active channels
  const activeChannels = []
  const hasPresence = presence.filter(p => p !== 'None')

  // Always include Google Ads for paid goals
  if (goalWeights.paid > 1.0) {
    activeChannels.push({ ...CHANNEL_DATA['Google Ads'], key: 'Google Ads' })
  }

  hasPresence.forEach(p => {
    if (CHANNEL_DATA[p]) {
      activeChannels.push({ ...CHANNEL_DATA[p], key: p })
    }
  })

  // If no presence, add defaults
  if (activeChannels.length === 0) {
    activeChannels.push(
      { ...CHANNEL_DATA.Website, key: 'Website' },
      { ...CHANNEL_DATA.Facebook, key: 'Facebook' },
      { ...CHANNEL_DATA['Email List'], key: 'Email List' },
    )
  }

  // Calculate budget allocation
  let totalWeight = 0
  const channelAllocations = activeChannels.map(ch => {
    const weight = ch.priority * (goalWeights[ch.type] || 1.0)
    totalWeight += weight
    return { ...ch, weight }
  })

  const budgetAllocation = channelAllocations.map((ch, i) => {
    const pct = Math.round((ch.weight / totalWeight) * 100)
    const amount = Math.round((ch.weight / totalWeight) * budgetNum)
    return {
      name: ch.label,
      key: ch.key,
      percentage: pct,
      amount,
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    }
  })

  // Normalize percentages to 100
  const totalPct = budgetAllocation.reduce((s, b) => s + b.percentage, 0)
  if (totalPct !== 100 && budgetAllocation.length > 0) {
    budgetAllocation[0].percentage += (100 - totalPct)
  }

  // Pie chart data
  const pieData = budgetAllocation.map(b => ({ name: b.name, value: b.percentage }))

  // Executive Summary
  const durationDays = duration.includes('2 weeks') ? 14 : parseInt(duration)
  const executiveSummary = `This ${duration} ${goal.toLowerCase()} campaign for ${serviceName} targets ${audience.substring(0, 80)} with a ${currency} ${budgetNum.toLocaleString()} monthly budget. The strategy leverages ${budgetAllocation.map(b => b.name).join(', ')} to maximize ${goal === 'Brand Awareness' ? 'reach and visibility' : goal === 'Sales / Revenue' ? 'revenue and ROAS' : goal === 'Community Building' ? 'engagement and community growth' : 'qualified leads and conversions'}. ${businessDesc ? businessDesc.substring(0, 100) + '.' : ''}`

  // Funnel Map
  const funnelMap = FUNNEL_STAGES.map(f => {
    const tactics = {
      Awareness: [`Social media content on ${hasPresence.filter(p => ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube'].includes(p)).slice(0, 2).join(' & ') || 'key platforms'}`, `SEO-optimized blog content about ${serviceName}`, `${goal === 'Brand Awareness' ? 'Reach-optimized' : 'Targeted'} paid ads`, 'Industry thought leadership'],
      Interest: [`Educational content about ${serviceName}`, 'Retargeting website visitors', 'Email nurture sequence', `Free resource/lead magnet about ${audience.split(' ').slice(0, 3).join(' ')}`],
      Consideration: ['Case studies & testimonials', `${serviceName} comparison content`, 'Personalized email follow-ups', 'Free consultation/demo offer'],
      Conversion: [`Clear CTA: ${goal === 'Sales / Revenue' ? 'Purchase now' : goal === 'Lead Generation' ? 'Book a call' : 'Sign up'}`, 'Limited-time offer or bonus', 'Simplified checkout/signup', 'Post-conversion thank you flow'],
    }
    return { ...f, tactics: tactics[f.stage] || [] }
  })

  // 30-Day Content Calendar
  const contentTypes = CONTENT_TYPES[goal] || CONTENT_TYPES['Lead Generation']
  const calendar = []
  const startDate = new Date()
  const calendarDays = Math.min(durationDays, 30)

  for (let day = 0; day < calendarDays; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)
    const dayOfWeek = date.getDay()

    // Post on weekdays + some weekends
    if (dayOfWeek === 0) continue // Skip Sundays

    const contentIndex = day % contentTypes.length
    const channelIndex = day % Math.max(hasPresence.length, 1)
    const channel = hasPresence[channelIndex] || 'Website'

    calendar.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      type: contentTypes[contentIndex],
      channel,
      topic: `${contentTypes[contentIndex]} about ${serviceName} for ${audience.split(' ').slice(0, 3).join(' ')}`,
      time: dayOfWeek === 6 ? '11:00 AM' : channel === 'LinkedIn' ? '8:30 AM' : channel === 'Instagram' ? '12:00 PM' : channel === 'TikTok' ? '7:00 PM' : '10:00 AM',
    })
  }

  // KPI Dashboard Template
  const kpis = {
    'Lead Generation': [
      { metric: 'Total Leads', target: `${Math.round(budgetNum / 15)}-${Math.round(budgetNum / 8)}`, frequency: 'Weekly' },
      { metric: 'Cost Per Lead', target: `${currency} ${Math.round(budgetNum / (Math.round(budgetNum / 10) || 1))}-${Math.round(budgetNum / (Math.round(budgetNum / 20) || 1))}`, frequency: 'Weekly' },
      { metric: 'Lead-to-Customer Rate', target: '15-25%', frequency: 'Monthly' },
      { metric: 'Website Traffic', target: `${Math.round(budgetNum * 2)}+ visits`, frequency: 'Weekly' },
      { metric: 'Email Open Rate', target: '25-35%', frequency: 'Per Send' },
      { metric: 'Social Engagement Rate', target: '3-6%', frequency: 'Weekly' },
    ],
    'Sales / Revenue': [
      { metric: 'Revenue', target: `${currency} ${Math.round(budgetNum * 3)}-${Math.round(budgetNum * 5)}`, frequency: 'Monthly' },
      { metric: 'ROAS', target: '3x-5x', frequency: 'Weekly' },
      { metric: 'Conversion Rate', target: '2-5%', frequency: 'Weekly' },
      { metric: 'Average Order Value', target: 'Track baseline', frequency: 'Weekly' },
      { metric: 'Cart Abandonment Rate', target: '< 70%', frequency: 'Weekly' },
      { metric: 'Customer Acquisition Cost', target: `< ${currency} ${Math.round(budgetNum * 0.15)}`, frequency: 'Monthly' },
    ],
    'Brand Awareness': [
      { metric: 'Total Reach', target: `${Math.round(budgetNum * 10)}+`, frequency: 'Weekly' },
      { metric: 'Impressions', target: `${Math.round(budgetNum * 30)}+`, frequency: 'Weekly' },
      { metric: 'Follower Growth', target: '10-20% increase', frequency: 'Monthly' },
      { metric: 'Brand Mentions', target: 'Track baseline', frequency: 'Weekly' },
      { metric: 'Share of Voice', target: 'Track baseline', frequency: 'Monthly' },
      { metric: 'Engagement Rate', target: '3-8%', frequency: 'Weekly' },
    ],
  }

  const kpiData = kpis[goal] || kpis['Lead Generation']

  // Week 1 Quick Wins
  const quickWins = [
    `Audit and optimize your ${hasPresence[0] || 'website'} profile/bio for ${serviceName}`,
    `Create 3-5 pieces of ${contentTypes[0].toLowerCase()} content ready to post`,
    `Set up ${budgetAllocation[0]?.name || 'Google Ads'} campaign with ${currency} ${Math.round(budgetNum * 0.15)} test budget`,
    `Build a simple landing page focused on ${goal === 'Lead Generation' ? 'lead capture' : goal === 'Sales / Revenue' ? 'product conversion' : 'email signup'}`,
    `Write and schedule first week of content (${Math.min(5, calendarDays)} posts)`,
    `Install analytics tracking (Google Analytics, ${hasPresence.includes('Facebook') ? 'Meta Pixel' : 'conversion tracking'})`,
    `Set up email automation: welcome sequence + ${goal === 'Sales / Revenue' ? 'abandoned cart' : 'nurture'} flow`,
    `Research and save 10-15 competitor posts for content inspiration`,
  ]

  return { executiveSummary, budgetAllocation, pieData, funnelMap, calendar, kpiData, quickWins, durationDays }
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="border rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
        <p className="font-medium" style={{ color: 'var(--text-heading)' }}>{payload[0].name}</p>
        <p className="" style={{ color: 'var(--accent)' }}>{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function App() {
  const [form, setForm] = useState({
    serviceName: '',
    businessDesc: '',
    goal: CAMPAIGN_GOALS[0],
    audience: '',
    budget: '',
    currency: 'USD',
    duration: '30 days',
    presence: [],
  })
  const [results, setResults] = useState(null)

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const togglePresence = (p) => {
    if (p === 'None') {
      updateForm('presence', form.presence.includes('None') ? [] : ['None'])
      return
    }
    const filtered = form.presence.filter(x => x !== 'None')
    updateForm('presence', filtered.includes(p) ? filtered.filter(x => x !== p) : [...filtered, p])
  }

  const isValid = form.serviceName.trim() && form.audience.trim() && parseFloat(form.budget) > 0 && form.presence.length > 0

  const handleGenerate = () => {
    if (!isValid) return
    setResults(generateStrategy(form))
  }

  const handleReset = () => {
    setForm({ serviceName: '', businessDesc: '', goal: CAMPAIGN_GOALS[0], audience: '', budget: '', currency: 'USD', duration: '30 days', presence: [] })
    setResults(null)
  }

  const getAllText = () => {
    if (!results) return ''
    let t = `=== CAMPAIGN STRATEGY: ${form.serviceName} ===\n\n`
    t += `${results.executiveSummary}\n\n`
    t += '--- BUDGET ALLOCATION ---\n'
    results.budgetAllocation.forEach(b => { t += `${b.name}: ${b.percentage}% (${form.currency} ${b.amount.toLocaleString()})\n` })
    t += '\n--- FUNNEL MAP ---\n'
    results.funnelMap.forEach(f => { t += `${f.stage}: ${f.tactics.join('; ')}\n` })
    t += '\n--- CONTENT CALENDAR (30-Day) ---\n'
    results.calendar.forEach(c => { t += `${c.date} | ${c.channel} | ${c.type} | ${c.time}\n` })
    t += '\n--- KPIs ---\n'
    results.kpiData.forEach(k => { t += `${k.metric}: ${k.target} (${k.frequency})\n` })
    t += '\n--- WEEK 1 QUICK WINS ---\n'
    results.quickWins.forEach((w, i) => { t += `${i + 1}. ${w}\n` })
    return t
  }

  return (
    <ToolLayout
      title="Marketing Campaign Strategy Builder"
      description="Build a complete marketing campaign strategy with channel recommendations, budget allocation, content calendar, and KPI tracking."
    >
      {!results ? (
        <div className="max-w-3xl mx-auto">
          <ResultCard title="Campaign Setup" icon="📊">
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Service / Product Name *</label>
                  <input type="text" value={form.serviceName} onChange={e => updateForm('serviceName', e.target.value)}
                    placeholder="e.g., AI Automation Services"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Campaign Goal</label>
                  <select value={form.goal} onChange={e => updateForm('goal', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}>
                    {CAMPAIGN_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Business Description</label>
                <input type="text" value={form.businessDesc} onChange={e => updateForm('businessDesc', e.target.value)}
                  placeholder="Brief description of your business..."
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Target Audience *</label>
                <textarea value={form.audience} onChange={e => updateForm('audience', e.target.value)} rows={3}
                  placeholder="Describe your ideal customer: demographics, interests, pain points..."
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Monthly Budget *</label>
                  <div className="flex gap-2">
                    <select value={form.currency} onChange={e => updateForm('currency', e.target.value)}
                      className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none w-24" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" value={form.budget} onChange={e => updateForm('budget', e.target.value)}
                      placeholder="5000" min="0" step="100"
                      className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Duration</label>
                  <select value={form.duration} onChange={e => updateForm('duration', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Current Online Presence * (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {PRESENCE_OPTIONS.map(p => (
                    <button key={p} onClick={() => togglePresence(p)}
                      className="px-3 py-1.5 rounded-lg text-sm transition-colors border" style={form.presence.includes(p) ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!isValid}
                className="w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
                Build Strategy
              </button>
            </div>
          </ResultCard>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)' }}>&larr; Start Over</button>
            <CopyButton text={getAllText()} label="Copy All" />
          </div>

          {/* Executive Summary */}
          <ResultCard title="Executive Summary" icon="📋">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{results.executiveSummary}</p>
          </ResultCard>

          {/* Channel Recommendation + Pie Chart */}
          <ResultCard title="Channel Recommendation & Budget Allocation" icon="📊">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {results.pieData.map((entry, i) => (
                        <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="text-xs" style={{ color: 'var(--text-body)' }}>{value}</span>}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {results.budgetAllocation.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg px-4 py-2.5 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-sm" style={{ color: 'var(--text-body)' }}>{b.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-heading)' }}>{form.currency} {b.amount.toLocaleString()}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>({b.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResultCard>

          {/* Funnel Map */}
          <ResultCard title="Funnel Map" icon="🔻">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.funnelMap.map((f, i) => (
                <div key={i} className="relative rounded-xl p-4 border" style={{ background: f.bg, borderColor: f.borderColor }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{f.icon}</span>
                    <h4 className="font-semibold text-sm" style={{ color: f.color }}>{f.stage}</h4>
                  </div>
                  {i < 3 && <div className="hidden lg:block absolute right-0 top-1/2" style={{ color: 'var(--text-muted)' }}>{'\u2192'}</div>}
                  <ul className="space-y-1.5">
                    {f.tactics.map((t, j) => (
                      <li key={j} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-body)' }}>
                        <span className="mt-0.5" style={{ color: f.color }}>{'\u2022'}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Content Calendar */}
          <ResultCard title="30-Day Content Calendar" icon="📅">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Channel</th>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Content Type</th>
                    <th className="py-2 px-3 font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Topic</th>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.calendar.map((c, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 px-3 whitespace-nowrap" style={{ color: 'var(--text-body)' }}>{c.date}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{c.channel}</span>
                      </td>
                      <td className="py-2 px-3" style={{ color: 'var(--text-heading)' }}>{c.type}</td>
                      <td className="py-2 px-3 text-xs hidden sm:table-cell max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.topic}</td>
                      <td className="py-2 px-3 whitespace-nowrap" style={{ color: 'var(--text-body)' }}>{c.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultCard>

          {/* Budget Allocation Table */}
          <ResultCard title="Budget Allocation Breakdown" icon="💰">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Channel</th>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Monthly</th>
                    <th className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>% of Budget</th>
                    <th className="py-2 px-3 font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{form.duration} Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.budgetAllocation.map((b, i) => {
                    const months = results.durationDays / 30
                    return (
                      <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <td className="py-2 px-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                          {b.name}
                        </td>
                        <td className="py-2 px-3" style={{ color: 'var(--text-body)' }}>{form.currency} {b.amount.toLocaleString()}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full max-w-24" style={{ background: 'var(--bg-elevated)' }}>
                              <div className="h-2 rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: b.color }} />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--text-body)' }}>{b.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 hidden sm:table-cell" style={{ color: 'var(--text-body)' }}>{form.currency} {Math.round(b.amount * months).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                  <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-2 px-3 font-medium" style={{ color: 'var(--text-heading)' }}>Total</td>
                    <td className="py-2 px-3 font-medium" style={{ color: 'var(--accent)' }}>{form.currency} {parseFloat(form.budget).toLocaleString()}</td>
                    <td className="py-2 px-3 font-medium" style={{ color: 'var(--accent)' }}>100%</td>
                    <td className="py-2 px-3 font-medium hidden sm:table-cell" style={{ color: 'var(--accent)' }}>{form.currency} {Math.round(parseFloat(form.budget) * results.durationDays / 30).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ResultCard>

          {/* KPI Dashboard */}
          <ResultCard title="KPI Dashboard Template" icon="📈">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.kpiData.map((k, i) => (
                <div key={i} className="rounded-lg p-4 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k.frequency}</p>
                  <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--text-heading)' }}>{k.metric}</h4>
                  <p className="font-semibold" style={{ color: 'var(--accent)' }}>{k.target}</p>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Week 1 Quick Wins */}
          <ResultCard title="Week 1 Quick Wins" icon="🚀">
            <div className="space-y-2">
              {results.quickWins.map((w, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg px-4 py-3 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{i + 1}</span>
                  <p className="text-sm" style={{ color: 'var(--text-body)' }}>{w}</p>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
