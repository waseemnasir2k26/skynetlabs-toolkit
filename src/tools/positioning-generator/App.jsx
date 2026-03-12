import { useState } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

const SERVICE_OPTIONS = [
  'Web Design', 'Web Development', 'SEO', 'PPC/Ads', 'Social Media Marketing',
  'Content Marketing', 'Email Marketing', 'Branding', 'Video Production',
  'AI Automation', 'Copywriting', 'Graphic Design', 'App Development',
  'Consulting', 'E-commerce', 'CRM Setup', 'Analytics', 'PR',
]

const PRICE_RANGES = [
  'Budget ($500-$2K/project)',
  'Mid-Range ($2K-$10K/project)',
  'Premium ($10K-$50K/project)',
  'Enterprise ($50K+/project)',
]

const POSITIONING_FRAMEWORKS = {
  'Budget': {
    angle: 'accessible expertise',
    valueProps: ['affordable without sacrificing quality', 'transparent pricing', 'fast turnaround', 'no hidden fees'],
    tone: 'approachable and efficient',
  },
  'Mid-Range': {
    angle: 'best value for serious growth',
    valueProps: ['proven ROI', 'dedicated support', 'scalable solutions', 'data-driven approach'],
    tone: 'professional and results-focused',
  },
  'Premium': {
    angle: 'elite, white-glove service',
    valueProps: ['bespoke strategy', 'senior-level talent only', 'guaranteed results', 'priority support'],
    tone: 'authoritative and exclusive',
  },
  'Enterprise': {
    angle: 'transformation partner',
    valueProps: ['enterprise-grade security', 'cross-department integration', 'C-suite strategic advisory', 'dedicated account team'],
    tone: 'strategic and visionary',
  },
}

const NICHE_KEYWORDS = {
  'saas': { pain: 'churn and CAC', desire: 'scalable growth and retention', market: 'competitive SaaS landscape' },
  'ecommerce': { pain: 'cart abandonment and ad costs', desire: 'higher AOV and repeat purchases', market: 'crowded online retail space' },
  'real estate': { pain: 'lead quality and market fluctuations', desire: 'consistent qualified leads', market: 'competitive real estate market' },
  'healthcare': { pain: 'patient acquisition and compliance', desire: 'trusted patient relationships', market: 'regulated healthcare industry' },
  'legal': { pain: 'client acquisition costs', desire: 'high-value case leads', market: 'competitive legal services market' },
  'fitness': { pain: 'member retention and seasonality', desire: 'year-round membership growth', market: 'saturated fitness industry' },
  'restaurant': { pain: 'foot traffic and online reviews', desire: 'full tables and loyal customers', market: 'competitive dining scene' },
  'coaching': { pain: 'credibility and lead generation', desire: 'authority positioning and premium clients', market: 'growing coaching industry' },
  'agency': { pain: 'client retention and differentiation', desire: 'predictable revenue and referrals', market: 'crowded agency landscape' },
  'startup': { pain: 'limited budget and brand awareness', desire: 'rapid growth and market validation', market: 'fast-moving startup ecosystem' },
  'default': { pain: 'visibility and lead generation', desire: 'sustainable business growth', market: 'competitive marketplace' },
}

function detectNiche(text) {
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(NICHE_KEYWORDS)) {
    if (key !== 'default' && lower.includes(key)) return val
  }
  return NICHE_KEYWORDS.default
}

function getPriceKey(priceRange) {
  if (priceRange.includes('Budget')) return 'Budget'
  if (priceRange.includes('Mid-Range')) return 'Mid-Range'
  if (priceRange.includes('Premium')) return 'Premium'
  return 'Enterprise'
}

function generatePositioning(form) {
  const { services, niche, priceRange, skills, competitors } = form
  const nicheData = detectNiche(niche)
  const priceKey = getPriceKey(priceRange)
  const framework = POSITIONING_FRAMEWORKS[priceKey]
  const serviceList = services.join(', ')
  const competitorList = competitors.filter(c => c.trim())

  // Market Positioning Analysis
  const marketAnalysis = {
    overview: `In the ${nicheData.market}, businesses struggle with ${nicheData.pain}. Your combination of ${serviceList} positions you as a ${framework.angle} provider that delivers ${nicheData.desire}. With a ${framework.tone} brand voice, you can carve out a distinct position that resonates with ${niche || 'your target audience'}.`,
    opportunity: `Most providers in this space offer generic solutions. By leading with ${services[0] || 'your core service'} and backing it with ${services[1] || 'complementary expertise'}, you create an integrated offering that competitors can't easily replicate.`,
    threat: competitorList.length > 0
      ? `Competitors like ${competitorList.join(', ')} may have brand recognition, but they likely lack your specific combination of ${skills ? 'skills (' + skills.substring(0, 60) + ')' : 'unique expertise'} and focused ${niche} specialization.`
      : `Generic providers may undercut on price, but they cannot match your specialized focus on ${niche || 'this niche'} combined with ${framework.angle}.`,
  }

  // Differentiation Points
  const diffPoints = [
    {
      title: `${niche}-Specialized ${services[0] || 'Solutions'}`,
      desc: `Unlike generalist agencies, every strategy is built specifically for the ${nicheData.market}. We understand ${nicheData.pain} and design solutions that directly address these challenges.`,
    },
    {
      title: `Integrated ${services.slice(0, 2).join(' + ')} Approach`,
      desc: `Most providers silo their services. We combine ${serviceList} into a unified growth engine, eliminating the gaps that cost businesses time and money.`,
    },
    {
      title: `${priceKey === 'Budget' ? 'Transparent' : priceKey === 'Enterprise' ? 'Strategic' : 'Results-Driven'} Partnership Model`,
      desc: `We operate as ${framework.angle}, providing ${framework.valueProps[1]} and ${framework.valueProps[2]}. ${skills ? 'Our team brings ' + skills.substring(0, 80) + '.' : ''}`,
    },
    {
      title: 'Proven Process, Measurable Outcomes',
      desc: `Every engagement follows our tested framework: Audit, Strategize, Execute, Optimize. We track real metrics that matter to ${niche || 'your industry'}: ${nicheData.desire}.`,
    },
    {
      title: `${priceKey}-Tier Value Without Compromise`,
      desc: `${framework.valueProps[0].charAt(0).toUpperCase() + framework.valueProps[0].slice(1)}, with ${framework.valueProps[3]}. We deliver ${framework.angle} that ${niche || 'businesses'} deserve.`,
    },
  ]

  // Messaging Framework
  const oneLiner = `We help ${niche || 'businesses'} achieve ${nicheData.desire} through expert ${services[0] || 'digital strategy'}${services.length > 1 ? ' and ' + services[1] : ''}.`

  const elevatorPitch = `${niche ? niche.charAt(0).toUpperCase() + niche.slice(1) + ' businesses' : 'Businesses'} struggle with ${nicheData.pain}. We solve this by combining ${serviceList} into a ${framework.tone} approach that delivers ${nicheData.desire}. ${skills ? 'With ' + skills.substring(0, 60) + ', w' : 'W'}e provide ${framework.angle} that our clients can count on — ${framework.valueProps[0]} and ${framework.valueProps[2]}.`

  const positioningStatement = `For ${niche || 'growth-minded businesses'} who need ${nicheData.desire}, we are the ${framework.angle} provider of ${serviceList} that delivers ${framework.valueProps[1]}. Unlike ${competitorList.length > 0 ? competitorList[0] : 'generic agencies'}, we offer ${framework.valueProps[2]} backed by deep ${niche || 'industry'} expertise.`

  // Why Choose Us
  const whyChooseUs = [
    `Deep ${niche || 'Industry'} Expertise: We don't just know ${services[0] || 'marketing'} — we know ${niche || 'your industry'}. Every strategy is tailored to the specific challenges of ${nicheData.market}.`,
    `Full-Stack Capability: From ${services[0] || 'strategy'} to ${services[services.length - 1] || 'execution'}, one team handles everything. No finger-pointing between vendors.`,
    `${framework.valueProps[0].charAt(0).toUpperCase() + framework.valueProps[0].slice(1)}: What you see is what you get. ${priceKey === 'Budget' ? 'No surprise invoices.' : priceKey === 'Enterprise' ? 'Strategic investment in your growth.' : 'Fair pricing for premium results.'}`,
    `${framework.valueProps[2].charAt(0).toUpperCase() + framework.valueProps[2].slice(1)}: We don't just set it and forget it. Continuous optimization ensures your investment keeps compounding.`,
    `${skills ? 'Unique Skills: ' + skills.substring(0, 120) : 'Dedicated Partnership: We limit our client roster to ensure every partner gets the attention they deserve.'}`,
  ]

  // Gaps to Exploit
  const gaps = [
    {
      gap: 'Niche Specialization Gap',
      detail: `Most competitors serve everyone. By owning the "${niche || 'your niche'}" space, you become the obvious choice for ${niche || 'industry-specific'} businesses seeking ${nicheData.desire}.`,
    },
    {
      gap: 'Service Integration Gap',
      detail: `Competitors typically offer ${services[0] || 'one service'} OR ${services[1] || 'another'}, but rarely both together seamlessly. Your integrated approach eliminates the coordination tax clients pay.`,
    },
    {
      gap: 'Communication Gap',
      detail: `Many agencies are notorious for poor communication. Position yourself with ${framework.valueProps[3]} and proactive reporting to win clients burned by unresponsive providers.`,
    },
    {
      gap: competitorList.length > 0
        ? `Competitor Weakness: ${competitorList[0]}`
        : 'Price-to-Value Gap',
      detail: competitorList.length > 0
        ? `Research ${competitorList[0]}'s reviews and case studies. Their weaknesses in ${niche || 'this market'} are your opportunities. Focus messaging on what they lack.`
        : `${priceKey === 'Budget' ? 'Premium agencies overcharge for basic services. Position your pricing as smart and efficient.' : 'Budget providers cut corners. Your ' + priceKey.toLowerCase() + ' positioning signals quality and commitment.'}`,
    },
  ]

  return { marketAnalysis, diffPoints, messaging: { oneLiner, elevatorPitch, positioningStatement }, whyChooseUs, gaps }
}

export default function App() {
  const [form, setForm] = useLocalStorage('skynet-positioning-form', {
    services: [],
    niche: '',
    priceRange: PRICE_RANGES[1],
    skills: '',
    competitors: ['', '', ''],
  })
  const [serviceInput, setServiceInput] = useState('')
  const [results, setResults] = useLocalStorage('skynet-positioning-results', null)

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const addService = (svc) => {
    if (svc && !form.services.includes(svc)) {
      updateForm('services', [...form.services, svc])
    }
    setServiceInput('')
  }

  const removeService = (svc) => {
    updateForm('services', form.services.filter(s => s !== svc))
  }

  const handleGenerate = () => {
    if (form.services.length === 0 || !form.niche.trim()) return
    setResults(generatePositioning(form))
  }

  const handleReset = () => {
    setForm({ services: [], niche: '', priceRange: PRICE_RANGES[1], skills: '', competitors: ['', '', ''] })
    setResults(null)
    setServiceInput('')
  }

  const getAllText = () => {
    if (!results) return ''
    const r = results
    let text = '=== MARKET POSITIONING ANALYSIS ===\n\n'
    text += r.marketAnalysis.overview + '\n\n' + r.marketAnalysis.opportunity + '\n\n' + r.marketAnalysis.threat + '\n\n'
    text += '=== DIFFERENTIATION POINTS ===\n\n'
    r.diffPoints.forEach((d, i) => { text += `${i + 1}. ${d.title}\n${d.desc}\n\n` })
    text += '=== MESSAGING FRAMEWORK ===\n\n'
    text += `One-Liner: ${r.messaging.oneLiner}\n\nElevator Pitch: ${r.messaging.elevatorPitch}\n\nPositioning Statement: ${r.messaging.positioningStatement}\n\n`
    text += '=== WHY CHOOSE US ===\n\n'
    r.whyChooseUs.forEach((w, i) => { text += `${i + 1}. ${w}\n\n` })
    text += '=== GAPS TO EXPLOIT ===\n\n'
    r.gaps.forEach(g => { text += `${g.gap}: ${g.detail}\n\n` })
    return text
  }

  return (
    <ToolLayout
      title="AI Competitive Positioning Generator"
      description="Generate a complete competitive positioning strategy for your business. Discover your unique advantages and craft compelling messaging."
    >
      {!results ? (
        <div className="max-w-3xl mx-auto">
          <ResultCard title="Business Details" icon="🎯">
            {/* Services */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Services You Offer *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.services.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    {s}
                    <button onClick={() => removeService(s)} className="ml-1">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={e => setServiceInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(serviceInput.trim()) } }}
                  placeholder="Type a service or select below..."
                  className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                />
                <button onClick={() => addService(serviceInput.trim())} className="px-4 py-2.5 rounded-lg text-sm transition-colors" style={{ background: 'var(--bg-page)', color: 'var(--text-body)' }}>Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SERVICE_OPTIONS.filter(s => !form.services.includes(s)).map(s => (
                  <button key={s} onClick={() => addService(s)} className="px-2.5 py-1 rounded-md text-xs transition-colors" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Target Niche */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Target Niche / Industry *</label>
              <input
                type="text"
                value={form.niche}
                onChange={e => updateForm('niche', e.target.value)}
                placeholder="e.g., SaaS startups, local restaurants, real estate agents..."
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
              />
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Price Range</label>
              <select
                value={form.priceRange}
                onChange={e => updateForm('priceRange', e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
              >
                {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Unique Skills */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Unique Skills / Experience</label>
              <textarea
                value={form.skills}
                onChange={e => updateForm('skills', e.target.value)}
                rows={3}
                placeholder="e.g., 10 years in fintech, Google certified, former CMO, proprietary AI tools..."
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
              />
            </div>

            {/* Competitors */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>Competitor Names (optional, up to 3)</label>
              <div className="space-y-2">
                {form.competitors.map((c, i) => (
                  <input
                    key={i}
                    type="text"
                    value={c}
                    onChange={e => {
                      const updated = [...form.competitors]
                      updated[i] = e.target.value
                      updateForm('competitors', updated)
                    }}
                    placeholder={`Competitor ${i + 1}`}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={form.services.length === 0 || !form.niche.trim()}
              className="w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
            >
              Generate Positioning
            </button>
          </ResultCard>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)' }}>
              &larr; Start Over
            </button>
            <CopyButton text={getAllText()} label="Copy All" />
          </div>

          {/* Market Analysis */}
          <ResultCard title="Market Positioning Analysis" icon="🔍">
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              <div>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-heading)' }}>Overview</h4>
                <p>{results.marketAnalysis.overview}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-heading)' }}>Opportunity</h4>
                <p>{results.marketAnalysis.opportunity}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-heading)' }}>Competitive Landscape</h4>
                <p>{results.marketAnalysis.threat}</p>
              </div>
            </div>
          </ResultCard>

          {/* Differentiation Points */}
          <ResultCard title="Unique Differentiation Points" icon="💎">
            <div className="space-y-4">
              {results.diffPoints.map((d, i) => (
                <div key={i} className="rounded-lg p-4 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium mb-1" style={{ color: 'var(--accent)' }}>{i + 1}. {d.title}</h4>
                      <p className="text-sm" style={{ color: 'var(--text-body)' }}>{d.desc}</p>
                    </div>
                    <CopyButton text={`${d.title}\n${d.desc}`} label="" className="shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Messaging Framework */}
          <ResultCard title="Messaging Framework" icon="📝">
            <div className="space-y-5">
              {[
                { label: 'One-Liner', text: results.messaging.oneLiner },
                { label: 'Elevator Pitch', text: results.messaging.elevatorPitch },
                { label: 'Positioning Statement', text: results.messaging.positioningStatement },
              ].map((m, i) => (
                <div key={i} className="rounded-lg p-4 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium" style={{ color: 'var(--text-heading)' }}>{m.label}</h4>
                    <CopyButton text={m.text} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{m.text}</p>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Why Choose Us */}
          <ResultCard title='"Why Choose Us" Copy' icon="🏆">
            <div className="space-y-3">
              {results.whyChooseUs.map((w, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-4 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <span className="font-bold mt-0.5" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                  <p className="text-sm flex-1" style={{ color: 'var(--text-body)' }}>{w}</p>
                  <CopyButton text={w} label="" className="shrink-0" />
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Gaps to Exploit */}
          <ResultCard title="Competitive Gaps to Exploit" icon="🎯">
            <div className="grid sm:grid-cols-2 gap-4">
              {results.gaps.map((g, i) => (
                <div key={i} className="rounded-lg p-4 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--accent)' }}>{g.gap}</h4>
                  <p className="text-sm" style={{ color: 'var(--text-body)' }}>{g.detail}</p>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
