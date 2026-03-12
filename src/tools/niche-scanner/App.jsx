import { useState } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import CopyButton from '../shared/CopyButton'

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)', multiplier: 0.6 },
  { value: 'intermediate', label: 'Intermediate (2-5 years)', multiplier: 1.0 },
  { value: 'expert', label: 'Expert (5+ years)', multiplier: 1.5 },
]

const NICHE_DATABASE = {
  // High-demand tech niches
  'ai': { demand: 95, baseRate: [100, 250], competition: 45, growth: 95, category: 'tech' },
  'artificial intelligence': { demand: 95, baseRate: [100, 250], competition: 45, growth: 95, category: 'tech' },
  'machine learning': { demand: 92, baseRate: [110, 260], competition: 40, growth: 93, category: 'tech' },
  'saas': { demand: 88, baseRate: [90, 220], competition: 55, growth: 85, category: 'tech' },
  'software as a service': { demand: 88, baseRate: [90, 220], competition: 55, growth: 85, category: 'tech' },
  'automation': { demand: 85, baseRate: [80, 200], competition: 50, growth: 88, category: 'tech' },
  'chatbot': { demand: 80, baseRate: [70, 180], competition: 55, growth: 82, category: 'tech' },
  'blockchain': { demand: 60, baseRate: [100, 250], competition: 35, growth: 45, category: 'tech' },
  'crypto': { demand: 55, baseRate: [90, 230], competition: 40, growth: 40, category: 'tech' },
  'cybersecurity': { demand: 90, baseRate: [100, 240], competition: 35, growth: 90, category: 'tech' },
  'cloud': { demand: 85, baseRate: [90, 210], competition: 50, growth: 80, category: 'tech' },
  'devops': { demand: 82, baseRate: [95, 220], competition: 40, growth: 78, category: 'tech' },
  'data science': { demand: 85, baseRate: [90, 230], competition: 50, growth: 82, category: 'tech' },
  'data analytics': { demand: 80, baseRate: [75, 190], competition: 55, growth: 78, category: 'tech' },

  // Web & mobile
  'web development': { demand: 75, baseRate: [60, 180], competition: 75, growth: 60, category: 'web' },
  'web design': { demand: 70, baseRate: [50, 150], competition: 80, growth: 55, category: 'web' },
  'react': { demand: 82, baseRate: [70, 200], competition: 60, growth: 70, category: 'web' },
  'nextjs': { demand: 80, baseRate: [75, 210], competition: 45, growth: 75, category: 'web' },
  'wordpress': { demand: 65, baseRate: [40, 120], competition: 90, growth: 35, category: 'web' },
  'shopify': { demand: 72, baseRate: [50, 150], competition: 70, growth: 60, category: 'web' },
  'mobile app': { demand: 78, baseRate: [70, 200], competition: 65, growth: 65, category: 'web' },
  'ios': { demand: 75, baseRate: [80, 210], competition: 55, growth: 62, category: 'web' },
  'android': { demand: 73, baseRate: [70, 190], competition: 60, growth: 60, category: 'web' },

  // Industry verticals
  'health tech': { demand: 88, baseRate: [90, 230], competition: 40, growth: 90, category: 'industry' },
  'healthcare': { demand: 85, baseRate: [80, 210], competition: 45, growth: 85, category: 'industry' },
  'fintech': { demand: 87, baseRate: [95, 240], competition: 42, growth: 82, category: 'industry' },
  'finance': { demand: 80, baseRate: [85, 220], competition: 50, growth: 70, category: 'industry' },
  'ecommerce': { demand: 82, baseRate: [60, 180], competition: 70, growth: 72, category: 'industry' },
  'e-commerce': { demand: 82, baseRate: [60, 180], competition: 70, growth: 72, category: 'industry' },
  'real estate': { demand: 70, baseRate: [60, 170], competition: 65, growth: 55, category: 'industry' },
  'education': { demand: 72, baseRate: [50, 150], competition: 60, growth: 68, category: 'industry' },
  'edtech': { demand: 75, baseRate: [65, 180], competition: 50, growth: 72, category: 'industry' },
  'legal': { demand: 68, baseRate: [70, 190], competition: 45, growth: 60, category: 'industry' },
  'legaltech': { demand: 72, baseRate: [80, 210], competition: 35, growth: 70, category: 'industry' },
  'restaurant': { demand: 60, baseRate: [40, 120], competition: 75, growth: 45, category: 'industry' },
  'fitness': { demand: 65, baseRate: [45, 130], competition: 70, growth: 55, category: 'industry' },
  'travel': { demand: 60, baseRate: [50, 140], competition: 65, growth: 50, category: 'industry' },

  // Marketing & creative
  'seo': { demand: 78, baseRate: [60, 170], competition: 75, growth: 65, category: 'marketing' },
  'content marketing': { demand: 75, baseRate: [50, 150], competition: 70, growth: 62, category: 'marketing' },
  'social media': { demand: 70, baseRate: [40, 130], competition: 85, growth: 55, category: 'marketing' },
  'email marketing': { demand: 72, baseRate: [50, 150], competition: 65, growth: 60, category: 'marketing' },
  'paid ads': { demand: 78, baseRate: [60, 180], competition: 60, growth: 68, category: 'marketing' },
  'ppc': { demand: 76, baseRate: [60, 170], competition: 60, growth: 65, category: 'marketing' },
  'branding': { demand: 68, baseRate: [55, 170], competition: 70, growth: 55, category: 'marketing' },
  'graphic design': { demand: 65, baseRate: [40, 120], competition: 85, growth: 40, category: 'marketing' },
  'video production': { demand: 72, baseRate: [60, 180], competition: 60, growth: 70, category: 'marketing' },
  'copywriting': { demand: 70, baseRate: [45, 150], competition: 75, growth: 58, category: 'marketing' },
  'conversion optimization': { demand: 80, baseRate: [75, 200], competition: 40, growth: 75, category: 'marketing' },
  'cro': { demand: 80, baseRate: [75, 200], competition: 40, growth: 75, category: 'marketing' },

  // Consulting & strategy
  'consulting': { demand: 70, baseRate: [80, 220], competition: 60, growth: 60, category: 'consulting' },
  'strategy': { demand: 72, baseRate: [85, 230], competition: 55, growth: 62, category: 'consulting' },
  'coaching': { demand: 65, baseRate: [50, 150], competition: 80, growth: 55, category: 'consulting' },
  'project management': { demand: 70, baseRate: [60, 160], competition: 65, growth: 58, category: 'consulting' },
}

const LOCATION_MODIFIERS = {
  'us': 1.0, 'usa': 1.0, 'united states': 1.0, 'new york': 1.15, 'san francisco': 1.2,
  'los angeles': 1.05, 'chicago': 1.0, 'austin': 0.95, 'miami': 0.95,
  'uk': 0.9, 'united kingdom': 0.9, 'london': 1.05,
  'canada': 0.85, 'toronto': 0.9, 'vancouver': 0.9,
  'australia': 0.9, 'sydney': 0.95,
  'germany': 0.85, 'berlin': 0.85,
  'india': 0.4, 'philippines': 0.35, 'pakistan': 0.35,
  'eastern europe': 0.55, 'poland': 0.55, 'ukraine': 0.5, 'romania': 0.5,
  'latin america': 0.5, 'brazil': 0.5, 'mexico': 0.5, 'argentina': 0.45,
  'remote': 0.85, 'global': 0.85, 'worldwide': 0.85,
}

const CLIENT_PROFILES = {
  tech: [
    { title: 'Funded Startups', desc: 'Series A-C startups needing to scale fast. Budget: $5K-$25K/month. Decision-makers are CTOs and product leads.' },
    { title: 'Enterprise Innovation Teams', desc: 'Corporate teams with allocated budgets for digital transformation. Longer sales cycles but high-value contracts.' },
    { title: 'Tech Founders', desc: 'Solo founders or small teams building MVPs. Budget-conscious but willing to pay for speed and expertise.' },
  ],
  web: [
    { title: 'Growing SMBs', desc: 'Small-to-medium businesses outgrowing their current web presence. Budget: $3K-$15K per project.' },
    { title: 'Marketing Agencies', desc: 'Agencies needing white-label development partners. Recurring work with volume discounts.' },
    { title: 'E-commerce Brands', desc: 'DTC brands scaling their online presence. Revenue-driven, measure ROI closely.' },
  ],
  industry: [
    { title: 'Industry Incumbents', desc: 'Established companies needing to modernize. Higher budgets, slower decision-making, value reliability.' },
    { title: 'Vertical SaaS Companies', desc: 'Software companies building industry-specific solutions. Need domain expertise + technical skills.' },
    { title: 'Professional Services Firms', desc: 'Law firms, accounting firms, medical practices needing specialized digital solutions.' },
  ],
  marketing: [
    { title: 'DTC E-commerce Brands', desc: 'Direct-to-consumer brands spending $5K-$50K/month on marketing. Data-driven and results-focused.' },
    { title: 'Local Service Businesses', desc: 'High-value local businesses (dental, legal, real estate). Steady recurring revenue potential.' },
    { title: 'SaaS Companies', desc: 'B2B SaaS needing demand generation. Long-term contracts, performance-based bonuses possible.' },
  ],
  consulting: [
    { title: 'Executive Teams', desc: 'C-suite leaders needing strategic guidance. High hourly rates, relationship-driven sales.' },
    { title: 'Scale-up Companies', desc: 'Companies past product-market fit needing operational expertise. 3-6 month engagements.' },
    { title: 'Solopreneurs', desc: 'Individual business owners seeking mentorship and strategy. Lower budget but high volume potential.' },
  ],
}

function analyzeNiche(description, location, experienceLevel) {
  const text = description.toLowerCase()
  const words = text.split(/\s+/)
  const expData = EXPERIENCE_LEVELS.find(e => e.value === experienceLevel) || EXPERIENCE_LEVELS[1]

  // Find matching niches
  let bestMatch = null
  let bestMatchScore = 0
  const matchedNiches = []

  for (const [keyword, data] of Object.entries(NICHE_DATABASE)) {
    if (text.includes(keyword)) {
      const keywordLength = keyword.split(/\s+/).length
      const matchScore = keywordLength * 10 + data.demand
      matchedNiches.push({ keyword, ...data })
      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore
        bestMatch = { keyword, ...data }
      }
    }
  }

  // If no match, generate from heuristics
  if (!bestMatch) {
    const hasDigital = words.some(w => ['digital', 'online', 'web', 'app', 'software', 'tech', 'technology'].includes(w))
    const hasCreative = words.some(w => ['design', 'creative', 'art', 'visual', 'brand', 'content', 'write', 'writing'].includes(w))
    const hasMarketing = words.some(w => ['marketing', 'ads', 'advertising', 'growth', 'leads', 'sales', 'funnel'].includes(w))

    bestMatch = {
      keyword: 'general',
      demand: hasDigital ? 65 : hasCreative ? 55 : hasMarketing ? 60 : 50,
      baseRate: hasDigital ? [50, 150] : hasCreative ? [40, 120] : hasMarketing ? [45, 140] : [40, 120],
      competition: hasDigital ? 65 : hasCreative ? 75 : hasMarketing ? 70 : 70,
      growth: hasDigital ? 60 : hasCreative ? 45 : hasMarketing ? 55 : 45,
      category: hasDigital ? 'tech' : hasCreative ? 'marketing' : hasMarketing ? 'marketing' : 'consulting',
    }
  }

  // Location modifier
  let locationMod = 0.85 // default
  if (location) {
    const loc = location.toLowerCase().trim()
    for (const [key, mod] of Object.entries(LOCATION_MODIFIERS)) {
      if (loc.includes(key) || key.includes(loc)) {
        locationMod = mod
        break
      }
    }
  }

  // Calculate scores
  const demandLevel = bestMatch.demand
  const adjustedLowRate = Math.round(bestMatch.baseRate[0] * expData.multiplier * locationMod)
  const adjustedHighRate = Math.round(bestMatch.baseRate[1] * expData.multiplier * locationMod)
  const competitionDensity = bestMatch.competition
  const growthTrajectory = bestMatch.growth

  // Adjust for multiple niche keywords (specialization bonus)
  const specializationBonus = Math.min(15, (matchedNiches.length - 1) * 5)

  // Niche score calculation
  let nicheScore = 0
  nicheScore += demandLevel * 0.3 // 30% demand
  nicheScore += (100 - competitionDensity) * 0.2 // 20% low competition
  nicheScore += growthTrajectory * 0.25 // 25% growth
  nicheScore += Math.min(100, ((adjustedLowRate + adjustedHighRate) / 2) / 2) * 0.15 // 15% rate potential
  nicheScore += specializationBonus * 0.1 * 10 // 10% specialization
  nicheScore = Math.round(Math.max(0, Math.min(100, nicheScore)))

  // Demand label
  const getDemandLabel = (d) => {
    if (d >= 85) return 'Very High'
    if (d >= 70) return 'High'
    if (d >= 50) return 'Moderate'
    if (d >= 30) return 'Low'
    return 'Very Low'
  }

  // Competition label
  const getCompetitionLabel = (c) => {
    if (c >= 80) return 'Very High - Saturated'
    if (c >= 60) return 'High - Competitive'
    if (c >= 40) return 'Moderate - Room to grow'
    if (c >= 20) return 'Low - Blue ocean'
    return 'Very Low - Untapped'
  }

  // Growth label
  const getGrowthLabel = (g) => {
    if (g >= 80) return 'Explosive'
    if (g >= 60) return 'Strong'
    if (g >= 40) return 'Steady'
    if (g >= 20) return 'Slow'
    return 'Declining'
  }

  // Verdict
  let verdict, verdictColor
  if (nicheScore >= 70) {
    verdict = 'Go'
    verdictColor = 'success'
  } else if (nicheScore >= 45) {
    verdict = 'Go with Caution'
    verdictColor = 'warning'
  } else {
    verdict = 'Pivot'
    verdictColor = 'danger'
  }

  // Ideal client profile
  const category = bestMatch.category || 'consulting'
  const profiles = CLIENT_PROFILES[category] || CLIENT_PROFILES.consulting
  const idealClient = profiles[0]

  // Positioning angles
  const positioningAngles = generatePositioningAngles(text, bestMatch, expData, matchedNiches)

  return {
    nicheScore,
    demandLevel,
    demandLabel: getDemandLabel(demandLevel),
    rateRange: { low: adjustedLowRate, high: adjustedHighRate },
    competitionDensity,
    competitionLabel: getCompetitionLabel(competitionDensity),
    growthTrajectory,
    growthLabel: getGrowthLabel(growthTrajectory),
    verdict,
    verdictColor,
    idealClient,
    allProfiles: profiles,
    positioningAngles,
    matchedKeywords: matchedNiches.map(n => n.keyword),
    category,
    locationMod,
  }
}

function generatePositioningAngles(text, match, expData, matchedNiches) {
  const angles = []
  const category = match.category || 'consulting'

  // Angle 1: Specialization-based
  if (matchedNiches.length >= 2) {
    const niches = matchedNiches.slice(0, 2).map(n => n.keyword)
    angles.push({
      title: `The ${niches.join(' + ')} Specialist`,
      description: `Position yourself at the intersection of ${niches.join(' and ')}. This cross-niche expertise is rare and commands premium rates. Lead with case studies showing results in both areas.`,
    })
  } else {
    angles.push({
      title: `The ${match.keyword.charAt(0).toUpperCase() + match.keyword.slice(1)} Authority`,
      description: `Go deep on ${match.keyword} and become the go-to expert. Create content, build a portfolio, and focus all marketing on this single niche. Specialists command 2-3x generalist rates.`,
    })
  }

  // Angle 2: Results-based
  if (category === 'tech') {
    angles.push({
      title: 'The ROI-Driven Builder',
      description: 'Frame every project in terms of business outcomes, not technical deliverables. "I don\'t just build software - I build revenue engines." This attracts clients who value results over hourly rates.',
    })
  } else if (category === 'marketing') {
    angles.push({
      title: 'The Revenue Architect',
      description: 'Position around measurable business outcomes. Offer performance-based pricing tiers. Clients pay for growth, not hours. This builds trust and justifies premium pricing.',
    })
  } else if (category === 'industry') {
    angles.push({
      title: 'The Industry Insider',
      description: 'Leverage domain knowledge as your differentiator. Speak the client\'s language, understand their regulations, know their pain points. This expertise gap is your moat against generalist competitors.',
    })
  } else {
    angles.push({
      title: 'The Transformation Partner',
      description: 'Position as a strategic partner, not a service provider. Offer discovery workshops, roadmapping sessions, and ongoing advisory. Higher perceived value means higher rates and longer engagements.',
    })
  }

  // Angle 3: Experience-based
  if (expData.value === 'beginner') {
    angles.push({
      title: 'The Hungry Newcomer',
      description: 'Compete on speed, responsiveness, and modern skills. Offer starter packages at accessible prices to build your portfolio fast. Focus on a specific sub-niche where you can become known quickly.',
    })
  } else if (expData.value === 'expert') {
    angles.push({
      title: 'The Premium Consultant',
      description: 'Stop competing on price entirely. Offer high-touch, premium engagements with strategic advisory built in. Your experience justifies 3-5x beginner rates. Focus on fewer, higher-value clients.',
    })
  } else {
    angles.push({
      title: 'The Efficient Operator',
      description: 'You have enough experience to work efficiently but can still price competitively. Package your services into productized offerings with fixed prices. This removes price objections and speeds up sales.',
    })
  }

  return angles
}

export default function App() {
  const [description, setDescription] = useLocalStorage('skynet-niche-scanner-desc', '')
  const [location, setLocation] = useLocalStorage('skynet-niche-scanner-location', '')
  const [experience, setExperience] = useLocalStorage('skynet-niche-scanner-exp', 'intermediate')
  const [results, setResults] = useLocalStorage('skynet-niche-scanner-results', null)

  const handleAnalyze = () => {
    if (!description.trim()) return
    const analysis = analyzeNiche(description, location, experience)
    setResults(analysis)
  }

  const handleReset = () => {
    setDescription('')
    setLocation('')
    setExperience('intermediate')
    setResults(null)
  }

  const inputClass = 'w-full rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 text-sm'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)', '--tw-ring-color': 'var(--accent-soft)' }
  const selectClass = 'w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 text-sm appearance-none cursor-pointer'
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }

  return (
    <ToolLayout
      title="AI Niche Profitability Scanner"
      description="Analyze any freelancing or agency niche for demand, profitability, competition, and growth potential. Get data-driven positioning advice."
    >
      {/* Input */}
      <div className="space-y-6">
        <ResultCard title="Niche Details" icon="🔍">
          <div className="space-y-4">
            <div>
              <label className={labelClass} style={labelStyle}>Niche Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your niche... e.g., 'AI automation for e-commerce SaaS companies' or 'web design for health tech startups'"
                rows={4}
                className={`${inputClass} resize-y leading-relaxed`}
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Location (optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., United States, London, Remote"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={selectClass}
                  style={inputStyle}
                >
                  {EXPERIENCE_LEVELS.map(e => (
                    <option key={e.value} value={e.value} style={{ background: 'var(--bg-card)' }}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </ResultCard>

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!description.trim()}
            className="px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl transition-all text-sm"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Scan This Niche
          </button>
          {results && (
            <button
              onClick={handleReset}
              className="px-6 py-3 font-medium rounded-xl transition-all text-sm"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-6">
          {/* Score + Verdict */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultCard className="flex flex-col items-center justify-center">
              <ScoreGauge score={results.nicheScore} label="Niche Score" />
            </ResultCard>

            <ResultCard className="md:col-span-2">
              {/* Verdict Banner */}
              <div className="rounded-lg p-6 text-center mb-4" style={{
                background: results.verdictColor === 'success' ? 'var(--success-soft)' : results.verdictColor === 'danger' ? 'var(--danger-soft)' : 'var(--warning-soft)',
                border: `1px solid color-mix(in srgb, ${results.verdictColor === 'success' ? 'var(--success)' : results.verdictColor === 'danger' ? 'var(--danger)' : 'var(--warning)'} 20%, transparent)`,
              }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Verdict</p>
                <h2 className="text-3xl font-black" style={{ color: results.verdictColor === 'success' ? 'var(--success)' : results.verdictColor === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>{results.verdict}</h2>
              </div>

              {results.matchedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Matched:</span>
                  {results.matchedKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-xs font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </ResultCard>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard className="text-center">
              <p className="text-xl font-bold" style={{
                color: results.demandLevel >= 70 ? 'var(--success)' : results.demandLevel >= 50 ? 'var(--warning)' : 'var(--danger)',
              }}>
                {results.demandLabel}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Demand Level</p>
              <div className="w-full rounded-full h-1.5 mt-2" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${results.demandLevel}%`, background: 'var(--accent)' }}
                />
              </div>
            </ResultCard>

            <ResultCard className="text-center">
              <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                ${results.rateRange.low} - ${results.rateRange.high}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Rate Range /hr</p>
            </ResultCard>

            <ResultCard className="text-center">
              <p className="text-xl font-bold" style={{
                color: results.competitionDensity <= 40 ? 'var(--success)' : results.competitionDensity <= 65 ? 'var(--warning)' : 'var(--danger)',
              }}>
                {results.competitionDensity}%
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Competition</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{results.competitionLabel}</p>
            </ResultCard>

            <ResultCard className="text-center">
              <p className="text-xl font-bold" style={{
                color: results.growthTrajectory >= 70 ? 'var(--success)' : results.growthTrajectory >= 45 ? 'var(--warning)' : 'var(--danger)',
              }}>
                {results.growthLabel}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Growth Trajectory</p>
              <div className="w-full rounded-full h-1.5 mt-2" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${results.growthTrajectory}%`, background: 'var(--info)' }}
                />
              </div>
            </ResultCard>
          </div>

          {/* Ideal Client Profile */}
          <ResultCard title="Ideal Client Profile" icon="🎯">
            <div className="space-y-4">
              {results.allProfiles.map((profile, i) => (
                <div key={i} className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: i === 0 ? '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' : '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    {i === 0 && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Best Fit</span>}
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{profile.title}</h4>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.desc}</p>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Positioning Angles */}
          <ResultCard title="Positioning Angles" icon="🧭">
            <div className="space-y-4">
              {results.positioningAngles.map((angle, i) => (
                <div key={i} className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      {i + 1}
                    </span>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{angle.title}</h4>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{angle.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <CopyButton
                text={results.positioningAngles.map((a, i) => `${i + 1}. ${a.title}\n${a.description}`).join('\n\n')}
                label="Copy Positioning Angles"
              />
            </div>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
