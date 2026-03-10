import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

const CAMPAIGN_GOALS = ['Lead Generation', 'Sales', 'Brand Awareness', 'App Installs', 'Events']
const PLATFORMS = ['Meta', 'Instagram', 'Google', 'LinkedIn', 'TikTok', 'YouTube', 'X/Twitter']
const BUDGET_RANGES = ['Under $500', '$500-$2K', '$2K-$5K', '$5K-$10K', '$10K+']
const TONES = ['Professional', 'Casual', 'Urgent', 'Inspirational', 'Educational', 'Bold']

const TABS = ['Strategy', 'Ad Angles', 'Ad Copy', 'Visual Direction', 'Audience', 'A/B Testing']

const GOAL_STRATEGIES = {
  'Lead Generation': {
    objective: 'Capture qualified leads through compelling offers and clear value propositions',
    kpi: ['Cost Per Lead (CPL)', 'Lead Quality Score', 'Conversion Rate', 'Form Completion Rate'],
    funnel: 'Lead magnet or free consultation offer with nurture email sequence',
  },
  'Sales': {
    objective: 'Drive direct purchases and revenue through persuasive product-focused campaigns',
    kpi: ['Return on Ad Spend (ROAS)', 'Cost Per Acquisition (CPA)', 'Average Order Value', 'Revenue'],
    funnel: 'Product showcase with urgency/scarcity triggers and retargeting',
  },
  'Brand Awareness': {
    objective: 'Maximize reach and brand recall among target demographics',
    kpi: ['Reach', 'Impressions', 'Brand Recall Lift', 'Video Views', 'Share of Voice'],
    funnel: 'Top-of-funnel content with frequency optimization and engagement tracking',
  },
  'App Installs': {
    objective: 'Drive app downloads and initial engagement through targeted mobile campaigns',
    kpi: ['Cost Per Install (CPI)', 'Install Rate', 'Day-1 Retention', 'In-App Actions'],
    funnel: 'App demo video with one-click install CTA and onboarding flow',
  },
  'Events': {
    objective: 'Maximize event registrations and attendance through countdown-driven campaigns',
    kpi: ['Cost Per Registration', 'Registration Rate', 'Attendance Rate', 'Post-Event Engagement'],
    funnel: 'Event teaser content with countdown urgency and social proof',
  },
}

const TONE_HOOKS = {
  Professional: ['Industry data shows', 'Leading organizations trust', 'The proven approach to', 'Research confirms that', 'Smart businesses already'],
  Casual: ['So you want to', 'Here\'s the deal:', 'Stop scrolling if you', 'Real talk:', 'We get it.'],
  Urgent: ['Don\'t miss out:', 'Time is running out.', 'Last chance to', 'Act now before', 'Limited spots available:'],
  Inspirational: ['Imagine a world where', 'What if you could', 'Your potential is', 'The future belongs to', 'Dream bigger.'],
  Educational: ['Did you know?', 'The #1 mistake in', '3 things every', 'Here\'s what most miss:', 'The truth about'],
  Bold: ['We\'re changing the game.', 'Forget everything you know.', 'This isn\'t your average', 'Warning:', 'Unpopular opinion:'],
}

const EMOTIONAL_TRIGGERS = {
  Professional: ['trust', 'credibility', 'confidence', 'authority', 'reliability'],
  Casual: ['relatability', 'humor', 'curiosity', 'FOMO', 'belonging'],
  Urgent: ['scarcity', 'fear of missing out', 'time pressure', 'loss aversion', 'urgency'],
  Inspirational: ['aspiration', 'hope', 'transformation', 'purpose', 'empowerment'],
  Educational: ['curiosity', 'self-improvement', 'insight', 'expertise', 'revelation'],
  Bold: ['disruption', 'confidence', 'rebellion', 'exclusivity', 'shock value'],
}

const PLATFORM_SPECS = {
  Meta: { headline: 40, primary: 125, description: 30, cta: 20 },
  Instagram: { headline: 40, primary: 125, description: 30, cta: 20 },
  Google: { headline: 30, description: 90, cta: 15 },
  LinkedIn: { intro: 150, headline: 70, description: 100, cta: 20 },
  TikTok: { text: 100, headline: 40, cta: 20 },
  YouTube: { headline: 100, description: 200, cta: 20 },
  'X/Twitter': { text: 280, headline: 50, cta: 20 },
}

function generateBrief(form) {
  const { businessName, businessDesc, service, audience, goal, platforms, budget, tone } = form
  const goalData = GOAL_STRATEGIES[goal]
  const hooks = TONE_HOOKS[tone]
  const triggers = EMOTIONAL_TRIGGERS[tone]

  // Campaign Strategy
  const strategy = {
    objective: goalData.objective,
    overview: `This campaign for ${businessName} will leverage ${platforms.join(', ')} to ${goal.toLowerCase()} for ${service}. Targeting ${audience.substring(0, 100)}, the campaign uses a ${tone.toLowerCase()} tone to connect with the audience's core motivations. Budget: ${budget}.`,
    kpis: goalData.kpi,
    funnel: goalData.funnel,
    timeline: budget.includes('Under') || budget.includes('500-')
      ? 'Phase 1 (Week 1-2): Launch & Test. Phase 2 (Week 3-4): Optimize winners.'
      : 'Phase 1 (Week 1): Launch & A/B test. Phase 2 (Week 2-3): Scale winners. Phase 3 (Week 4): Retarget & optimize.',
  }

  // 5 Ad Angles
  const angles = [
    {
      name: 'Problem-Solution',
      hook: `${hooks[0]} — ${audience.split(' ')[0] || 'people'} are struggling with [pain point]. ${businessName} solves this with ${service}.`,
      why: 'Directly addresses the audience\'s pain point and positions your service as the clear solution.',
      trigger: triggers[0],
    },
    {
      name: 'Social Proof',
      hook: `${hooks[1]} — See why hundreds of ${audience.substring(0, 40)} choose ${businessName} for ${service}.`,
      why: 'Leverages the bandwagon effect and builds trust through implied testimonials.',
      trigger: triggers[1],
    },
    {
      name: 'Transformation',
      hook: `${hooks[3]} — From stuck to scaling: how ${service} transforms ${audience.substring(0, 40)}.`,
      why: 'Paints a vivid before/after picture that the audience can see themselves in.',
      trigger: triggers[2],
    },
    {
      name: 'Authority',
      hook: `${hooks[4]} — ${businessName} is the go-to for ${service}. Here's what makes us different.`,
      why: 'Establishes expertise and market leadership positioning.',
      trigger: triggers[3],
    },
    {
      name: 'Curiosity Gap',
      hook: `${hooks[2]} — The one thing about ${service} that ${audience.substring(0, 30)} need to know.`,
      why: 'Creates an information gap that compels clicks to learn the answer.',
      trigger: triggers[4],
    },
  ]

  // Ad Copy Variations per platform
  const adCopy = {}
  platforms.forEach(platform => {
    const specs = PLATFORM_SPECS[platform] || PLATFORM_SPECS.Meta
    const headlines = [
      truncate(`${businessName}: ${service} That Delivers`, specs.headline || 40),
      truncate(`${goal === 'Sales' ? 'Get' : goal === 'Lead Generation' ? 'Unlock' : 'Discover'} ${service} by ${businessName}`, specs.headline || 40),
      truncate(`${tone === 'Urgent' ? 'Limited Time: ' : tone === 'Bold' ? 'Game-Changing ' : ''}${service} for ${audience.split(' ').slice(0, 3).join(' ')}`, specs.headline || 40),
    ]
    const primaryTexts = [
      truncate(`${hooks[0]} ${audience.substring(0, 40)} are choosing ${businessName} for ${service}. ${goal === 'Lead Generation' ? 'Get your free consultation today.' : goal === 'Sales' ? 'Shop now and see the difference.' : 'Learn what makes us different.'}`, specs.primary || specs.intro || specs.text || 125),
      truncate(`${businessDesc ? businessDesc.substring(0, 60) + '. ' : ''}We help ${audience.substring(0, 40)} with expert ${service}. ${tone === 'Urgent' ? 'Don\'t wait — ' : ''}See results that matter.`, specs.primary || specs.intro || specs.text || 125),
      truncate(`${hooks[4]} ${service} from ${businessName}. Built for ${audience.substring(0, 30)}. ${goal === 'Events' ? 'Reserve your spot.' : goal === 'App Installs' ? 'Download free.' : 'Start today.'}`, specs.primary || specs.intro || specs.text || 125),
    ]
    const ctas = [
      truncate(goal === 'Lead Generation' ? 'Get Free Quote' : goal === 'Sales' ? 'Shop Now' : goal === 'App Installs' ? 'Install Free' : goal === 'Events' ? 'Register Now' : 'Learn More', specs.cta || 20),
      truncate(goal === 'Lead Generation' ? 'Book a Call' : goal === 'Sales' ? 'Buy Now' : goal === 'App Installs' ? 'Download App' : goal === 'Events' ? 'Save My Seat' : 'Get Started', specs.cta || 20),
      truncate(goal === 'Lead Generation' ? 'Claim Offer' : goal === 'Sales' ? 'Order Today' : goal === 'App Installs' ? 'Try It Free' : goal === 'Events' ? 'Join Us' : 'See More', specs.cta || 20),
    ]
    adCopy[platform] = { headlines, primaryTexts, ctas, specs }
  })

  // Visual Direction
  const visual = {
    style: tone === 'Professional' ? 'Clean, minimal design with brand colors. Use high-quality photography and data visualizations.' :
      tone === 'Casual' ? 'Bright, lifestyle-focused imagery. UGC-style content with authentic, relatable visuals.' :
      tone === 'Urgent' ? 'Bold contrasting colors. Countdown timers, badges, and starburst elements. Red/orange accents.' :
      tone === 'Inspirational' ? 'Aspirational imagery with warm tones. Hero shots showing transformation and success.' :
      tone === 'Educational' ? 'Infographic-style layouts. Charts, diagrams, and step-by-step visual sequences.' :
      'High-contrast, rule-breaking layouts. Large typography, unexpected color combinations, and disruptive compositions.',
    formats: platforms.map(p => {
      if (p === 'Instagram' || p === 'TikTok') return `${p}: 1080x1080 (feed), 1080x1920 (stories/reels)`
      if (p === 'Meta') return `${p}: 1080x1080 (feed), 1200x628 (link ads)`
      if (p === 'LinkedIn') return `${p}: 1200x627 (feed), 1080x1080 (carousel)`
      if (p === 'Google') return `${p}: 1200x628, 300x250, 728x90 (display)`
      if (p === 'YouTube') return `${p}: 1920x1080 (video), 300x250 (companion)`
      return `${p}: 1200x675 (standard)`
    }),
    doList: ['Use consistent brand colors', 'Include clear CTA button', 'Show real people when possible', 'A/B test creative variations'],
    dontList: ['Avoid text-heavy images (< 20% text)', 'Skip stock photo cliches', 'Don\'t use low-resolution assets', 'Avoid cluttered compositions'],
  }

  // Audience Targeting
  const audienceTargeting = {
    primary: `Core Audience: ${audience}`,
    demographics: `Based on ${service} in the ${goal.toLowerCase()} context, focus on decision-makers and end-users within your target demographic.`,
    interests: [
      `${service}-related topics and competitors`,
      `${goal === 'Sales' ? 'Online shopping and deal-seeking' : goal === 'Lead Generation' ? 'Professional development and business growth' : 'Industry news and trends'}`,
      `Tools and platforms related to ${service}`,
      `Complementary services and products`,
    ],
    retargeting: [
      'Website visitors (last 30 days)',
      'Video viewers (50%+ watched)',
      'Engagement audiences (post likes, saves, shares)',
      'Lookalike audiences from existing customers',
    ],
    exclusions: ['Existing customers (unless upsell)', 'Competitors\' employees', 'Irrelevant geographies'],
  }

  // A/B Testing Plan
  const abTesting = {
    tests: [
      { variable: 'Headlines', control: 'Problem-focused headline', variant: 'Benefit-focused headline', metric: 'CTR', duration: '7 days' },
      { variable: 'Creative', control: 'Static image', variant: 'Video/carousel', metric: 'Engagement Rate', duration: '7 days' },
      { variable: 'CTA', control: adCopy[platforms[0]]?.ctas[0] || 'Learn More', variant: adCopy[platforms[0]]?.ctas[1] || 'Get Started', metric: 'Conversion Rate', duration: '5 days' },
      { variable: 'Audience', control: 'Broad targeting', variant: 'Lookalike audience', metric: 'CPA / CPL', duration: '10 days' },
      { variable: 'Landing Page', control: 'Long-form page', variant: 'Short-form page', metric: 'Bounce Rate & CVR', duration: '14 days' },
    ],
    rules: [
      'Run each test for at least 5-7 days before declaring a winner',
      'Ensure at least 100 conversions per variant for statistical significance',
      'Test one variable at a time for clean results',
      `Allocate 10-20% of ${budget} budget for testing`,
      'Document all findings for future campaign optimization',
    ],
  }

  return { strategy, angles, adCopy, visual, audienceTargeting, abTesting }
}

function truncate(text, maxLen) {
  return text.length <= maxLen ? text : text.substring(0, maxLen - 1) + '\u2026'
}

export default function App() {
  const [form, setForm] = useState({
    businessName: '',
    businessDesc: '',
    service: '',
    audience: '',
    goal: CAMPAIGN_GOALS[0],
    platforms: [],
    budget: BUDGET_RANGES[1],
    tone: TONES[0],
  })
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const togglePlatform = (p) => {
    updateForm('platforms', form.platforms.includes(p) ? form.platforms.filter(x => x !== p) : [...form.platforms, p])
  }

  const isValid = form.businessName.trim() && form.service.trim() && form.audience.trim() && form.platforms.length > 0

  const handleGenerate = () => {
    if (!isValid) return
    setResults(generateBrief(form))
    setActiveTab(0)
  }

  const handleReset = () => {
    setForm({ businessName: '', businessDesc: '', service: '', audience: '', goal: CAMPAIGN_GOALS[0], platforms: [], budget: BUDGET_RANGES[1], tone: TONES[0] })
    setResults(null)
  }

  const getAllText = () => {
    if (!results) return ''
    const r = results
    let t = `=== AD CREATIVE BRIEF: ${form.businessName} ===\n\n`
    t += `Campaign Goal: ${form.goal}\nPlatforms: ${form.platforms.join(', ')}\nBudget: ${form.budget}\nTone: ${form.tone}\n\n`
    t += `--- STRATEGY ---\n${r.strategy.overview}\nKPIs: ${r.strategy.kpis.join(', ')}\n\n`
    t += `--- AD ANGLES ---\n`
    r.angles.forEach((a, i) => { t += `${i + 1}. ${a.name}: ${a.hook}\n   Trigger: ${a.trigger}\n\n` })
    t += `--- AD COPY ---\n`
    Object.entries(r.adCopy).forEach(([plat, data]) => {
      t += `\n[${plat}]\nHeadlines:\n${data.headlines.map((h, i) => `  ${i + 1}. ${h} (${h.length} chars)`).join('\n')}\nPrimary Text:\n${data.primaryTexts.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}\nCTAs:\n${data.ctas.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n`
    })
    return t
  }

  return (
    <ToolLayout
      title="AI Ad Creative Brief Generator"
      description="Generate comprehensive ad creative briefs with campaign strategy, ad angles, copy variations, visual direction, and testing plans."
    >
      {!results ? (
        <div className="max-w-3xl mx-auto">
          <ResultCard title="Campaign Details" icon="📋">
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Business Name *</label>
                  <input type="text" value={form.businessName} onChange={e => updateForm('businessName', e.target.value)}
                    placeholder="Your business name" className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Service / Product *</label>
                  <input type="text" value={form.service} onChange={e => updateForm('service', e.target.value)}
                    placeholder="What you're promoting" className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Business Description</label>
                <input type="text" value={form.businessDesc} onChange={e => updateForm('businessDesc', e.target.value)}
                  placeholder="Brief description of your business" className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Target Audience *</label>
                <textarea value={form.audience} onChange={e => updateForm('audience', e.target.value)} rows={3}
                  placeholder="Describe your ideal customer: demographics, interests, pain points..."
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Campaign Goal</label>
                  <select value={form.goal} onChange={e => updateForm('goal', e.target.value)}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                    {CAMPAIGN_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Budget Range</label>
                  <select value={form.budget} onChange={e => updateForm('budget', e.target.value)}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                    {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Platforms * (select at least one)</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${form.platforms.includes(p) ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-300/50 text-gray-400 border border-white/5 hover:text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button key={t} onClick={() => updateForm('tone', t)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${form.tone === t ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-300/50 text-gray-400 border border-white/5 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!isValid}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Generate Brief
              </button>
            </div>
          </ResultCard>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={handleReset} className="px-4 py-2 bg-dark-200/50 text-gray-300 rounded-lg text-sm hover:bg-dark-300 transition-colors">&larr; Start Over</button>
            <CopyButton text={getAllText()} label="Copy All" />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-dark-200/30 rounded-xl p-1 border border-white/5">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === i ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Strategy Tab */}
          {activeTab === 0 && (
            <ResultCard title="Campaign Strategy" icon="🎯">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-1">Objective</h4>
                  <p className="text-gray-300">{results.strategy.objective}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Overview</h4>
                  <p className="text-gray-300">{results.strategy.overview}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">KPIs</h4>
                  <div className="flex flex-wrap gap-2">{results.strategy.kpis.map(k => <span key={k} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">{k}</span>)}</div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Funnel Strategy</h4>
                  <p className="text-gray-300">{results.strategy.funnel}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Timeline</h4>
                  <p className="text-gray-300">{results.strategy.timeline}</p>
                </div>
              </div>
            </ResultCard>
          )}

          {/* Ad Angles Tab */}
          {activeTab === 1 && (
            <ResultCard title="5 Ad Angles" icon="💡">
              <div className="space-y-4">
                {results.angles.map((a, i) => (
                  <div key={i} className="bg-dark-200/30 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-primary font-medium">{i + 1}. {a.name}</h4>
                      <CopyButton text={`${a.name}\n${a.hook}`} label="" />
                    </div>
                    <p className="text-white text-sm mb-2">{a.hook}</p>
                    <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300">Why it works:</span> {a.why}</p>
                    <p className="text-gray-400 text-xs"><span className="text-gray-300">Emotional trigger:</span> <span className="text-primary">{a.trigger}</span></p>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}

          {/* Ad Copy Tab */}
          {activeTab === 2 && (
            <div className="space-y-6">
              {Object.entries(results.adCopy).map(([platform, data]) => (
                <ResultCard key={platform} title={`${platform} Ad Copy`} icon="📝">
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">Headlines</h4>
                        <span className="text-gray-500 text-xs">Max: {data.specs.headline || '40'} chars</span>
                      </div>
                      {data.headlines.map((h, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-gray-300">{i + 1}. {h}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs ${h.length <= (data.specs.headline || 40) ? 'text-green-400' : 'text-red-400'}`}>
                              {h.length} chars {h.length <= (data.specs.headline || 40) ? '\u2705' : '\u274C'}
                            </span>
                            <CopyButton text={h} label="" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Primary Text</h4>
                      {data.primaryTexts.map((p, i) => (
                        <div key={i} className="bg-dark-200/30 rounded-lg p-3 mb-2 border border-white/5">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-gray-300 text-sm">{p}</p>
                            <CopyButton text={p} label="" className="shrink-0" />
                          </div>
                          <span className="text-gray-500 text-xs mt-1 block">{p.length} chars</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">CTAs</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.ctas.map((c, i) => (
                          <div key={i} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
                            <span className="text-primary text-sm">{c}</span>
                            <CopyButton text={c} label="" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ResultCard>
              ))}
            </div>
          )}

          {/* Visual Direction Tab */}
          {activeTab === 3 && (
            <ResultCard title="Visual Direction" icon="🎨">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-1">Creative Style</h4>
                  <p className="text-gray-300">{results.visual.style}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Asset Sizes</h4>
                  <div className="space-y-1">{results.visual.formats.map((f, i) => <p key={i} className="text-gray-300 text-xs bg-dark-200/30 rounded px-3 py-1.5">{f}</p>)}</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">Do</h4>
                    {results.visual.doList.map((d, i) => <p key={i} className="text-gray-300 text-sm flex items-start gap-2 mb-1"><span className="text-green-400">+</span> {d}</p>)}
                  </div>
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Don't</h4>
                    {results.visual.dontList.map((d, i) => <p key={i} className="text-gray-300 text-sm flex items-start gap-2 mb-1"><span className="text-red-400">-</span> {d}</p>)}
                  </div>
                </div>
              </div>
            </ResultCard>
          )}

          {/* Audience Tab */}
          {activeTab === 4 && (
            <ResultCard title="Audience Targeting" icon="👥">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-1">Primary Audience</h4>
                  <p className="text-gray-300">{results.audienceTargeting.primary}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Demographics</h4>
                  <p className="text-gray-300">{results.audienceTargeting.demographics}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Interest Targeting</h4>
                  {results.audienceTargeting.interests.map((int, i) => <p key={i} className="text-gray-300 flex items-start gap-2 mb-1"><span className="text-primary">+</span> {int}</p>)}
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Retargeting Audiences</h4>
                  {results.audienceTargeting.retargeting.map((r, i) => <p key={i} className="text-gray-300 flex items-start gap-2 mb-1"><span className="text-primary">+</span> {r}</p>)}
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Exclusions</h4>
                  {results.audienceTargeting.exclusions.map((e, i) => <p key={i} className="text-gray-300 flex items-start gap-2 mb-1"><span className="text-red-400">-</span> {e}</p>)}
                </div>
              </div>
            </ResultCard>
          )}

          {/* A/B Testing Tab */}
          {activeTab === 5 && (
            <ResultCard title="A/B Testing Plan" icon="🧪">
              <div className="space-y-4 text-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2 px-3 text-gray-400 font-medium">Variable</th>
                        <th className="py-2 px-3 text-gray-400 font-medium">Control (A)</th>
                        <th className="py-2 px-3 text-gray-400 font-medium">Variant (B)</th>
                        <th className="py-2 px-3 text-gray-400 font-medium">Metric</th>
                        <th className="py-2 px-3 text-gray-400 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.abTesting.tests.map((test, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 px-3 text-primary">{test.variable}</td>
                          <td className="py-2 px-3 text-gray-300">{test.control}</td>
                          <td className="py-2 px-3 text-gray-300">{test.variant}</td>
                          <td className="py-2 px-3 text-gray-300">{test.metric}</td>
                          <td className="py-2 px-3 text-gray-300">{test.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Testing Rules</h4>
                  {results.abTesting.rules.map((r, i) => <p key={i} className="text-gray-300 flex items-start gap-2 mb-1"><span className="text-primary">{i + 1}.</span> {r}</p>)}
                </div>
              </div>
            </ResultCard>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
