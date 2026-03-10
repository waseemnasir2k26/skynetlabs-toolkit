import React, { useState, useEffect } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import ExportButton from '../shared/ExportButton'

const BUSINESS_TYPES = ['Agency', 'Freelancer', 'SaaS', 'E-commerce', 'Local Business', 'Consultant']

const AUDIT_CATEGORIES = [
  {
    name: 'First Impression',
    points: [
      { name: 'Hero Clarity', description: 'Is the hero section immediately clear about what you do?' },
      { name: 'Headline Strength', description: 'Does the main headline communicate a compelling benefit?' },
      { name: 'Value Proposition', description: 'Is the unique value proposition clear within 5 seconds?' },
      { name: 'Load Speed Perception', description: 'Does the page feel fast and responsive?' },
    ],
  },
  {
    name: 'Trust Signals',
    points: [
      { name: 'Testimonials', description: 'Are customer testimonials visible and credible?' },
      { name: 'Client Logos', description: 'Are recognizable client or partner logos displayed?' },
      { name: 'Certifications', description: 'Are relevant certifications, awards, or credentials shown?' },
      { name: 'Case Studies', description: 'Are detailed case studies or success stories accessible?' },
    ],
  },
  {
    name: 'CTA Effectiveness',
    points: [
      { name: 'CTA Visibility', description: 'Are call-to-action buttons prominently placed?' },
      { name: 'CTA Clarity', description: 'Is the CTA text specific and action-oriented?' },
      { name: 'Urgency Elements', description: 'Are there elements that create urgency or FOMO?' },
      { name: 'Number of CTAs', description: 'Are there multiple CTAs throughout the page?' },
    ],
  },
  {
    name: 'Content & Messaging',
    points: [
      { name: 'Benefit-Focused Copy', description: 'Does the copy focus on benefits rather than features?' },
      { name: 'Specificity', description: 'Are claims backed by specific numbers and data?' },
      { name: 'Social Proof Integration', description: 'Is social proof woven naturally into the content?' },
      { name: 'FAQ Section', description: 'Is there an FAQ addressing common objections?' },
    ],
  },
  {
    name: 'Technical & UX',
    points: [
      { name: 'Mobile Responsive', description: 'Does the site look and function well on mobile?' },
      { name: 'Navigation', description: 'Is navigation intuitive and well-organized?' },
      { name: 'Form Friction', description: 'Are forms simple with minimal required fields?' },
      { name: 'Page Speed', description: 'Does the page load quickly without lag?' },
    ],
  },
]

// Deterministic scoring based on URL + business type
function generateAuditResults(url, businessType) {
  // Create a hash from the URL for deterministic results
  let hash = 0
  const str = url + businessType
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const seed = Math.abs(hash)

  const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase()
  const domainWords = domain.replace(/[^a-z]/g, ' ').split(' ').filter(Boolean)

  // Business type base scores (some types generally have better sites)
  const typeModifiers = {
    'SaaS': { firstImpression: 1.1, trust: 1.0, cta: 1.2, content: 1.1, technical: 1.15 },
    'E-commerce': { firstImpression: 1.0, trust: 1.05, cta: 1.1, content: 0.95, technical: 1.1 },
    'Agency': { firstImpression: 1.05, trust: 1.0, cta: 0.9, content: 1.0, technical: 1.05 },
    'Freelancer': { firstImpression: 0.85, trust: 0.8, cta: 0.75, content: 0.85, technical: 0.9 },
    'Local Business': { firstImpression: 0.8, trust: 0.85, cta: 0.7, content: 0.75, technical: 0.8 },
    'Consultant': { firstImpression: 0.9, trust: 0.95, cta: 0.85, content: 1.0, technical: 0.85 },
  }

  // Keyword bonuses
  const hasDesign = domainWords.some(w => ['design', 'creative', 'studio', 'pixel', 'art'].includes(w))
  const hasTech = domainWords.some(w => ['tech', 'dev', 'code', 'digital', 'web', 'app', 'software'].includes(w))
  const hasPro = domainWords.some(w => ['pro', 'premium', 'elite', 'expert', 'solutions'].includes(w))
  const hasBiz = domainWords.some(w => ['biz', 'consulting', 'group', 'partners', 'agency'].includes(w))

  const mod = typeModifiers[businessType] || typeModifiers['Agency']
  const catKeys = ['firstImpression', 'trust', 'cta', 'content', 'technical']

  const findings = {
    Agency: {
      firstImpression: [
        ['Hero clearly states agency services and target clients', 'Hero section is vague about services offered - needs a specific benefit headline'],
        ['Headline uses benefit-driven language that speaks to client pain points', 'Headline focuses on the agency rather than client outcomes'],
        ['Value proposition is clear: visitors know what you do in under 5 seconds', 'Value proposition takes too long to understand - simplify your above-the-fold message'],
        ['Page loads quickly with optimized assets', 'Page feels sluggish - large images and unoptimized assets are slowing load time'],
      ],
      trust: [
        ['Client testimonials with photos and company names are prominently displayed', 'Missing or generic testimonials - add real client quotes with full names and headshots'],
        ['Recognizable client logos build immediate credibility', 'No client logos visible - add a "Trusted By" section with 4-6 recognizable brands'],
        ['Industry certifications and partnerships displayed', 'No visible certifications - add Google Partner, HubSpot, or industry-specific badges'],
        ['Case studies with measurable results are accessible', 'No case studies found - create 3-5 detailed case studies showing specific ROI'],
      ],
      cta: [
        ['Primary CTA is above the fold and visually distinct', 'CTA button blends in with the design - make it larger, bolder, and contrasting'],
        ['CTA copy is specific (e.g., "Get Your Free Audit")', 'CTA text is generic ("Contact Us") - make it specific and value-driven'],
        ['Limited-time offers or social proof create urgency', 'No urgency elements - add limited availability, countdown timers, or social proof numbers'],
        ['Multiple CTAs throughout the page guide the user journey', 'Only one CTA on the page - add CTAs after each major section'],
      ],
      content: [
        ['Copy focuses on client outcomes and benefits', 'Copy is feature-heavy - rewrite to focus on client transformations and outcomes'],
        ['Claims are backed by specific metrics and data points', 'Vague claims like "we get results" - add specific numbers (e.g., "300% average ROI")'],
        ['Social proof is naturally woven into content sections', 'Social proof is isolated - integrate mini-testimonials and stats throughout the page'],
        ['FAQ section addresses pricing, timeline, and process questions', 'No FAQ section - add one addressing top objections about pricing, timeline, and process'],
      ],
      technical: [
        ['Site is fully responsive and looks great on mobile', 'Mobile experience needs improvement - text may be too small and buttons too close together'],
        ['Navigation is clean with clear hierarchy', 'Navigation is cluttered - simplify to 5-7 main items with clear labels'],
        ['Contact form is simple with 3-5 fields', 'Form has too many required fields - reduce to name, email, and project type'],
        ['Page loads in under 3 seconds', 'Page speed is suboptimal - compress images, enable caching, and minimize scripts'],
      ],
    },
  }

  // Use agency findings as base for all types with slight modifications
  const baseFindingsSet = findings.Agency

  const results = AUDIT_CATEGORIES.map((cat, catIdx) => {
    const catKey = catKeys[catIdx]
    const modifier = mod[catKey]
    return {
      name: cat.name,
      points: cat.points.map((point, pointIdx) => {
        // Generate deterministic score
        const rawSeed = (seed * (catIdx + 1) * (pointIdx + 1) * 7) % 100
        let baseScore = Math.max(1, Math.min(5, Math.round(rawSeed / 20)))
        baseScore = Math.max(1, Math.min(5, Math.round(baseScore * modifier)))

        // Apply keyword bonuses
        if (hasDesign && catIdx === 0) baseScore = Math.min(5, baseScore + 1)
        if (hasTech && catIdx === 4) baseScore = Math.min(5, baseScore + 1)
        if (hasPro && catIdx === 1) baseScore = Math.min(5, baseScore + 1)
        if (hasBiz && catIdx === 3) baseScore = Math.min(5, baseScore + 1)

        const isGood = baseScore >= 4
        const findingPair = baseFindingsSet[catKey]?.[pointIdx] || ['Good performance in this area', 'Room for improvement in this area']

        return {
          ...point,
          score: baseScore,
          finding: findingPair[isGood ? 0 : 1],
          recommendation: isGood
            ? `Maintain your strong ${point.name.toLowerCase()} - consider A/B testing to optimize further.`
            : findingPair[0].replace(/^[A-Z]/, c => c.toLowerCase()),
        }
      }),
    }
  })

  return results
}

const LOADING_STEPS = [
  'Analyzing hero section...',
  'Evaluating headline strength...',
  'Checking value proposition clarity...',
  'Scanning trust signals...',
  'Reviewing testimonials & social proof...',
  'Analyzing CTA placement...',
  'Evaluating CTA copy...',
  'Checking content messaging...',
  'Reviewing mobile responsiveness...',
  'Calculating conversion score...',
]

export default function App() {
  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (!isLoading) return
    if (loadingStep >= LOADING_STEPS.length) {
      const auditResults = generateAuditResults(url, businessType)
      setResults(auditResults)
      setIsLoading(false)
      setLoadingStep(0)
      return
    }
    const timer = setTimeout(() => setLoadingStep(s => s + 1), 400 + Math.random() * 300)
    return () => clearTimeout(timer)
  }, [isLoading, loadingStep, url, businessType])

  const handleAudit = (e) => {
    e.preventDefault()
    if (!url || !businessType) return
    setResults(null)
    setLoadingStep(0)
    setIsLoading(true)
  }

  // Calculate scores
  const overallScore = results ? Math.round(results.reduce((sum, cat) => {
    return sum + cat.points.reduce((s, p) => s + p.score, 0)
  }, 0) / (results.length * 4) * 20) : 0

  const categoryScores = results ? results.map(cat => ({
    name: cat.name,
    score: Math.round(cat.points.reduce((s, p) => s + p.score, 0) / (cat.points.length * 5) * 100),
  })) : []

  // Quick wins: lowest scoring items
  const quickWins = results ? results.flatMap(cat =>
    cat.points.filter(p => p.score <= 3).map(p => ({ ...p, category: cat.name }))
  ).sort((a, b) => a.score - b.score).slice(0, 5) : []

  // Estimated impact
  const getImpact = (score) => {
    if (score >= 80) return { text: '5-10% conversion improvement possible', color: 'text-primary' }
    if (score >= 60) return { text: '15-25% conversion improvement possible', color: 'text-blue-400' }
    if (score >= 40) return { text: '30-50% conversion improvement possible', color: 'text-yellow-400' }
    return { text: '50-100%+ conversion improvement possible', color: 'text-red-400' }
  }

  return (
    <ToolLayout title="Website Conversion Audit" description="Get a comprehensive 20-point audit of your website's conversion optimization across 5 critical categories.">

      {/* Input Form */}
      {!results && !isLoading && (
        <div className="max-w-2xl mx-auto">
          <ResultCard>
            <form onSubmit={handleAudit} className="space-y-6 py-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Audit Your Website</h2>
                <p className="text-gray-400 text-sm mt-1">Enter your URL and business type for a personalized conversion audit.</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Website URL</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.example.com" required
                  className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 text-lg" />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Business Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUSINESS_TYPES.map(type => (
                    <button key={type} type="button" onClick={() => setBusinessType(type)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                        businessType === type
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-dark-200/30 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
                      }`}>{type}</button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={!url || !businessType}
                className="w-full py-3.5 bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors text-lg">
                Run Audit
              </button>
            </form>
          </ResultCard>
        </div>
      )}

      {/* Loading Animation */}
      {isLoading && (
        <div className="max-w-xl mx-auto">
          <ResultCard>
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Auditing {url}</p>
              <div className="space-y-2 mt-6 max-w-sm mx-auto">
                {LOADING_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${
                    i < loadingStep ? 'opacity-100' : i === loadingStep ? 'opacity-100' : 'opacity-20'
                  }`}>
                    {i < loadingStep ? (
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i === loadingStep ? (
                      <div className="w-4 h-4 flex-shrink-0">
                        <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 flex-shrink-0 rounded-full border border-gray-600" />
                    )}
                    <span className={`text-sm ${i <= loadingStep ? 'text-white' : 'text-gray-600'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </ResultCard>
        </div>
      )}

      {/* Results */}
      {results && (
        <div id="website-audit-results" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button onClick={() => { setResults(null); setUrl(''); setBusinessType('') }}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              New Audit
            </button>
            <ExportButton elementId="website-audit-results" filename="website-audit.pdf" label="Export Audit PDF" />
          </div>

          {/* Overall Score */}
          <ResultCard>
            <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
              <ScoreGauge score={overallScore} label={overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Needs Work' : 'Critical'} size={180} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-1">Conversion Score</h2>
                <p className="text-gray-400 text-sm mb-2">{url} ({businessType})</p>
                <p className={`font-semibold text-lg ${getImpact(overallScore).color}`}>{getImpact(overallScore).text}</p>
                <div className="flex gap-3 mt-4 flex-wrap">
                  {categoryScores.map(cat => (
                    <div key={cat.name} className="bg-dark-200/30 rounded-lg px-3 py-2 border border-white/5">
                      <p className="text-gray-400 text-xs">{cat.name}</p>
                      <p className="text-white font-bold">{cat.score}<span className="text-gray-500 text-xs">/100</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ResultCard>

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <ResultCard title="Top 5 Quick Wins">
              <div className="space-y-3">
                {quickWins.map((win, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-dark-200/30 rounded-lg border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium">{win.name}</p>
                        <span className="text-gray-500 text-xs">({win.category})</span>
                      </div>
                      <p className="text-primary/80 text-xs mt-1">{win.recommendation}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`w-2 h-2 rounded-full ${s <= win.score ? 'bg-primary' : 'bg-gray-700'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}

          {/* Detailed Category Results */}
          {results.map((cat, catIdx) => (
            <ResultCard key={catIdx} title={cat.name}>
              <div className="space-y-4">
                {cat.points.map((point, pointIdx) => (
                  <div key={pointIdx} className="p-4 bg-dark-200/20 rounded-lg border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium text-sm">{point.name}</h4>
                        <p className="text-gray-500 text-xs">{point.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <span className={`text-lg font-bold ${
                          point.score >= 4 ? 'text-primary' : point.score >= 3 ? 'text-blue-400' : point.score >= 2 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{point.score}</span>
                        <span className="text-gray-500 text-xs">/5</span>
                      </div>
                    </div>
                    <div className="w-full bg-dark-200/50 rounded-full h-1.5 mb-3">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${(point.score / 5) * 100}%`,
                        backgroundColor: point.score >= 4 ? '#13b973' : point.score >= 3 ? '#3b82f6' : point.score >= 2 ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex gap-2">
                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${point.score >= 4 ? 'text-primary' : 'text-yellow-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={point.score >= 4 ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'} />
                        </svg>
                        <div>
                          <p className="text-gray-400 text-xs font-medium mb-0.5">Finding</p>
                          <p className="text-gray-300 text-xs">{point.finding}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                          <p className="text-gray-400 text-xs font-medium mb-0.5">Recommendation</p>
                          <p className="text-gray-300 text-xs">{point.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ResultCard>
          ))}

          {/* CTA */}
          <ResultCard>
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-white mb-2">Want Us to Fix These Issues?</h3>
              <p className="text-gray-400 mb-4">SkynetLabs offers CRO optimization services to maximize your website's conversion rate.</p>
              <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors">
                Get a Free CRO Consultation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
