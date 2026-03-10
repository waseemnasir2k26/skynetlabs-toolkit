import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import CopyButton from '../shared/CopyButton'

const PAYMENT_OPTIONS = [
  { value: 'always_on_time', label: 'Always on time', score: 100 },
  { value: 'usually_on_time', label: 'Usually on time (1-2 late)', score: 75 },
  { value: 'often_late', label: 'Often late', score: 40 },
  { value: 'chases_required', label: 'Requires chasing', score: 20 },
  { value: 'nonpayer', label: 'Frequently doesn\'t pay', score: 0 },
]

const SCOPE_CREEP_OPTIONS = [
  { value: 'never', label: 'Never / Rarely', score: 100 },
  { value: 'sometimes', label: 'Sometimes', score: 70 },
  { value: 'often', label: 'Often', score: 35 },
  { value: 'always', label: 'Every single project', score: 10 },
]

const GROWTH_OPTIONS = [
  { value: 'high', label: 'High - Growing business, increasing budgets', score: 100 },
  { value: 'moderate', label: 'Moderate - Stable with some upside', score: 65 },
  { value: 'low', label: 'Low - Stagnant or declining', score: 30 },
  { value: 'none', label: 'None - No future potential', score: 0 },
]

const REFERRAL_OPTIONS = [
  { value: 'highly_likely', label: 'Highly likely - Already has referred', score: 100 },
  { value: 'likely', label: 'Likely - Connected and willing', score: 70 },
  { value: 'unlikely', label: 'Unlikely - Isolated or unwilling', score: 30 },
  { value: 'never', label: 'Never - Would not recommend', score: 0 },
]

function analyzeClient(data) {
  const {
    monthlyRevenue, avgHours, communicationDifficulty, paymentReliability,
    scopeCreepFrequency, stressLevel, growthPotential, referralLikelihood,
  } = data

  // Effective hourly rate
  const effectiveRate = avgHours > 0 ? monthlyRevenue / avgHours : 0

  // Stress-adjusted rate: penalize high-stress clients
  const stressFactor = 1 - (stressLevel - 1) * 0.06 // 1 stress = 1.0x, 10 stress = 0.46x
  const stressAdjustedRate = effectiveRate * stressFactor

  // Individual dimension scores (0-100)
  const paymentScore = PAYMENT_OPTIONS.find(o => o.value === paymentReliability)?.score ?? 50
  const scopeScore = SCOPE_CREEP_OPTIONS.find(o => o.value === scopeCreepFrequency)?.score ?? 50
  const growthScore = GROWTH_OPTIONS.find(o => o.value === growthPotential)?.score ?? 50
  const referralScore = REFERRAL_OPTIONS.find(o => o.value === referralLikelihood)?.score ?? 50
  const communicationScore = Math.max(0, 100 - (communicationDifficulty - 1) * 11.1)
  const stressScore = Math.max(0, 100 - (stressLevel - 1) * 11.1)

  // Rate score: how good is the effective rate
  // Benchmark: $75/hr = 50, $150/hr = 100, $30/hr = 20
  const rateScore = Math.min(100, Math.max(0, (effectiveRate / 150) * 100))

  // Weighted composite score
  const weights = {
    rate: 0.25,
    payment: 0.15,
    scope: 0.10,
    communication: 0.10,
    stress: 0.15,
    growth: 0.15,
    referral: 0.10,
  }

  const compositeScore = Math.round(
    rateScore * weights.rate +
    paymentScore * weights.payment +
    scopeScore * weights.scope +
    communicationScore * weights.communication +
    stressScore * weights.stress +
    growthScore * weights.growth +
    referralScore * weights.referral
  )

  // Verdict
  let verdict, verdictColor, confidence
  if (compositeScore > 65) {
    verdict = 'KEEP'
    verdictColor = 'text-green-400'
    confidence = Math.min(99, 50 + (compositeScore - 65) * 1.4)
  } else if (compositeScore >= 35) {
    verdict = 'RENEGOTIATE'
    verdictColor = 'text-yellow-400'
    // Confidence is higher when closer to boundaries
    const distanceFromCenter = Math.abs(compositeScore - 50)
    confidence = 50 + distanceFromCenter * 1.5
  } else {
    verdict = 'FIRE'
    verdictColor = 'text-red-400'
    confidence = Math.min(99, 50 + (35 - compositeScore) * 2)
  }
  confidence = Math.round(Math.min(99, Math.max(51, confidence)))

  // Opportunity cost: what you could earn with those hours at market rate ($125/hr benchmark)
  const marketRate = 125
  const opportunityCost = avgHours * marketRate - monthlyRevenue
  const annualOpportunityCost = opportunityCost * 12

  // Risk score (0-100, higher = more risky)
  const riskScore = Math.round(
    100 - (
      paymentScore * 0.3 +
      scopeScore * 0.25 +
      communicationScore * 0.2 +
      stressScore * 0.25
    )
  )

  // Generate exit script or renegotiation points
  const exitScript = generateExitScript(data, effectiveRate, verdict)
  const renegotiationPoints = generateRenegotiationPoints(data, effectiveRate, compositeScore)

  const dimensions = [
    { label: 'Effective Rate', score: Math.round(rateScore), detail: `$${effectiveRate.toFixed(0)}/hr` },
    { label: 'Payment Reliability', score: paymentScore, detail: PAYMENT_OPTIONS.find(o => o.value === paymentReliability)?.label },
    { label: 'Scope Management', score: scopeScore, detail: SCOPE_CREEP_OPTIONS.find(o => o.value === scopeCreepFrequency)?.label },
    { label: 'Communication', score: Math.round(communicationScore), detail: `${communicationDifficulty}/10 difficulty` },
    { label: 'Stress Level', score: Math.round(stressScore), detail: `${stressLevel}/10 stress` },
    { label: 'Growth Potential', score: growthScore, detail: GROWTH_OPTIONS.find(o => o.value === growthPotential)?.label },
    { label: 'Referral Value', score: referralScore, detail: REFERRAL_OPTIONS.find(o => o.value === referralLikelihood)?.label },
  ]

  return {
    effectiveRate,
    stressAdjustedRate,
    compositeScore,
    verdict,
    verdictColor,
    confidence,
    opportunityCost,
    annualOpportunityCost,
    riskScore,
    dimensions,
    exitScript,
    renegotiationPoints,
  }
}

function generateExitScript(data, effectiveRate, verdict) {
  const { clientName } = data
  const name = clientName || 'the client'

  if (verdict === 'KEEP') return null

  return `Hi ${name},

I hope this message finds you well. After reviewing my current capacity and business direction, I've made the difficult decision to wind down our working relationship.

I want to ensure a smooth transition, so here's what I propose:
- I'll complete any currently active deliverables by [DATE].
- I'm happy to provide a detailed handoff document for your next provider.
- I can recommend 2-3 qualified professionals who may be a great fit.

This has nothing to do with the quality of your business - I've genuinely appreciated our time working together. My focus is shifting in a direction that means I can no longer give you the level of attention you deserve.

I'm available to discuss this further if you'd like.

Best regards`
}

function generateRenegotiationPoints(data, effectiveRate, score) {
  const points = []

  if (effectiveRate < 100) {
    const suggestedRate = Math.round(effectiveRate * 1.3 / 5) * 5
    points.push(`Propose a rate increase to $${suggestedRate}/hr (currently $${effectiveRate.toFixed(0)}/hr effective rate)`)
  }

  const paymentScore = PAYMENT_OPTIONS.find(o => o.value === data.paymentReliability)?.score ?? 50
  if (paymentScore < 75) {
    points.push('Require 50% upfront payment and net-14 terms on remaining balance')
  }

  const scopeScore = SCOPE_CREEP_OPTIONS.find(o => o.value === data.scopeCreepFrequency)?.score ?? 50
  if (scopeScore < 70) {
    points.push('Implement a formal change request process with written approval for any scope additions')
    points.push('Add a scope creep clause: additional requests beyond SOW billed at 1.5x rate')
  }

  if (data.communicationDifficulty > 6) {
    points.push('Set communication boundaries: scheduled check-in calls, 24-48hr response window, project management tool for requests')
  }

  if (data.stressLevel > 7) {
    points.push('Establish clear working hours and response time expectations')
    points.push('Consider transitioning to a retainer model with defined monthly deliverables')
  }

  if (data.avgHours > 40) {
    points.push('Cap monthly hours and require advance booking for additional time')
  }

  if (points.length === 0) {
    points.push('This client is performing well - consider a modest rate increase at the next contract renewal')
    points.push('Explore upsell opportunities: additional services, higher-tier packages')
  }

  return points
}

export default function App() {
  const [form, setForm] = useState({
    clientName: '',
    monthlyRevenue: '',
    avgHours: '',
    communicationDifficulty: 5,
    paymentReliability: 'usually_on_time',
    scopeCreepFrequency: 'sometimes',
    stressLevel: 5,
    growthPotential: 'moderate',
    referralLikelihood: 'likely',
  })
  const [results, setResults] = useState(null)

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = () => {
    if (!form.monthlyRevenue || !form.avgHours) return
    const analysis = analyzeClient({
      ...form,
      monthlyRevenue: parseFloat(form.monthlyRevenue),
      avgHours: parseFloat(form.avgHours),
    })
    setResults(analysis)
  }

  const handleReset = () => {
    setForm({
      clientName: '',
      monthlyRevenue: '',
      avgHours: '',
      communicationDifficulty: 5,
      paymentReliability: 'usually_on_time',
      scopeCreepFrequency: 'sometimes',
      stressLevel: 5,
      growthPotential: 'moderate',
      referralLikelihood: 'likely',
    })
    setResults(null)
  }

  const inputClass = 'w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm'
  const selectClass = 'w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm appearance-none cursor-pointer'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <ToolLayout
      title='AI "Fire or Keep" Client Analyzer'
      description="Objectively evaluate whether a client is worth keeping, needs renegotiation, or should be let go. Get data-driven insights on your client relationships."
    >
      {/* Input Form */}
      <div className="space-y-6">
        <ResultCard title="Client Information" icon="👤">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Client Name</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                placeholder="Acme Corp"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Monthly Revenue ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={form.monthlyRevenue}
                  onChange={(e) => updateField('monthlyRevenue', e.target.value)}
                  placeholder="3000"
                  min="0"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Avg Hours / Month</label>
              <input
                type="number"
                value={form.avgHours}
                onChange={(e) => updateField('avgHours', e.target.value)}
                placeholder="40"
                min="0"
                className={inputClass}
              />
            </div>
          </div>
        </ResultCard>

        <ResultCard title="Client Behavior" icon="📊">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Communication Difficulty Slider */}
            <div>
              <label className={labelClass}>
                Communication Difficulty: <span className="text-primary font-mono">{form.communicationDifficulty}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.communicationDifficulty}
                onChange={(e) => updateField('communicationDifficulty', parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-dark-200/50 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Nightmare</span>
              </div>
            </div>

            {/* Stress Level Slider */}
            <div>
              <label className={labelClass}>
                Stress Level: <span className="text-primary font-mono">{form.stressLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.stressLevel}
                onChange={(e) => updateField('stressLevel', parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-dark-200/50 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Zen</span>
                <span>Burnout</span>
              </div>
            </div>

            {/* Payment Reliability */}
            <div>
              <label className={labelClass}>Payment Reliability</label>
              <select
                value={form.paymentReliability}
                onChange={(e) => updateField('paymentReliability', e.target.value)}
                className={selectClass}
              >
                {PAYMENT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-dark-200">{o.label}</option>
                ))}
              </select>
            </div>

            {/* Scope Creep */}
            <div>
              <label className={labelClass}>Scope Creep Frequency</label>
              <select
                value={form.scopeCreepFrequency}
                onChange={(e) => updateField('scopeCreepFrequency', e.target.value)}
                className={selectClass}
              >
                {SCOPE_CREEP_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-dark-200">{o.label}</option>
                ))}
              </select>
            </div>

            {/* Growth Potential */}
            <div>
              <label className={labelClass}>Growth Potential</label>
              <select
                value={form.growthPotential}
                onChange={(e) => updateField('growthPotential', e.target.value)}
                className={selectClass}
              >
                {GROWTH_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-dark-200">{o.label}</option>
                ))}
              </select>
            </div>

            {/* Referral Likelihood */}
            <div>
              <label className={labelClass}>Referral Likelihood</label>
              <select
                value={form.referralLikelihood}
                onChange={(e) => updateField('referralLikelihood', e.target.value)}
                className={selectClass}
              >
                {REFERRAL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-dark-200">{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </ResultCard>

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!form.monthlyRevenue || !form.avgHours}
            className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
          >
            Analyze This Client
          </button>
          {results && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-dark-200/50 hover:bg-dark-200 text-gray-300 font-medium rounded-xl transition-all text-sm border border-white/5"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-6">
          {/* Verdict Banner */}
          <div className={`relative overflow-hidden rounded-xl border p-8 text-center ${
            results.verdict === 'KEEP'
              ? 'bg-green-500/5 border-green-500/20'
              : results.verdict === 'FIRE'
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-yellow-500/5 border-yellow-500/20'
          }`}>
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Verdict</p>
            <h2 className={`text-5xl font-black ${results.verdictColor}`}>
              {results.verdict}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {results.confidence}% confidence &middot; Composite Score: {results.compositeScore}/100
            </p>
            {form.clientName && (
              <p className="text-gray-500 text-xs mt-1">Analysis for: {form.clientName}</p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard className="text-center">
              <p className="text-2xl font-bold text-white">${results.effectiveRate.toFixed(0)}</p>
              <p className="text-gray-400 text-xs mt-1">Effective $/hr</p>
            </ResultCard>
            <ResultCard className="text-center">
              <p className="text-2xl font-bold text-primary">${results.stressAdjustedRate.toFixed(0)}</p>
              <p className="text-gray-400 text-xs mt-1">Stress-Adjusted $/hr</p>
            </ResultCard>
            <ResultCard className="text-center">
              <p className={`text-2xl font-bold ${results.opportunityCost > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {results.opportunityCost > 0 ? '-' : '+'}${Math.abs(results.opportunityCost).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-1">Monthly Opp. Cost</p>
            </ResultCard>
            <ResultCard className="text-center">
              <p className={`text-2xl font-bold ${results.riskScore > 60 ? 'text-red-400' : results.riskScore > 35 ? 'text-yellow-400' : 'text-green-400'}`}>
                {results.riskScore}
              </p>
              <p className="text-gray-400 text-xs mt-1">Risk Score /100</p>
            </ResultCard>
          </div>

          {/* Dimension Breakdown */}
          <ResultCard title="Dimension Breakdown" icon="📈">
            <div className="space-y-3">
              {results.dimensions.map((dim, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">{dim.label}</span>
                    <span className="text-xs text-gray-500">{dim.detail}</span>
                  </div>
                  <div className="w-full bg-dark-200/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${dim.score}%`,
                        backgroundColor: dim.score >= 70 ? '#13b973' : dim.score >= 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Renegotiation Points (always shown) */}
          <ResultCard title="Renegotiation Talking Points" icon="🤝">
            <ul className="space-y-2">
              {results.renegotiationPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-400 mt-0.5 flex-shrink-0">&#8226;</span>
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <CopyButton
                text={results.renegotiationPoints.join('\n')}
                label="Copy Talking Points"
              />
            </div>
          </ResultCard>

          {/* Exit Script (for FIRE / RENEGOTIATE) */}
          {results.exitScript && (
            <ResultCard title="Graceful Exit Script" icon="🚪">
              <div className="bg-dark-200/30 rounded-lg p-4 border border-white/5">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {results.exitScript}
                </pre>
              </div>
              <div className="mt-3">
                <CopyButton text={results.exitScript} label="Copy Exit Script" />
              </div>
            </ResultCard>
          )}

          {/* Annual Impact */}
          <ResultCard title="Annual Impact" icon="📅">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-dark-200/30 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  ${(parseFloat(form.monthlyRevenue) * 12).toLocaleString()}
                </p>
                <p className="text-gray-400 text-xs mt-1">Annual Revenue from Client</p>
              </div>
              <div className="bg-dark-200/30 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold ${results.annualOpportunityCost > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {results.annualOpportunityCost > 0 ? '-' : '+'}${Math.abs(results.annualOpportunityCost).toLocaleString()}
                </p>
                <p className="text-gray-400 text-xs mt-1">Annual Opportunity Cost</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Opportunity cost calculated against $125/hr market benchmark rate.
            </p>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
