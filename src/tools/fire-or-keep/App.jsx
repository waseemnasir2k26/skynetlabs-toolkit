import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import CopyButton from '../shared/CopyButton'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

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
    verdictColor = 'success'
    confidence = Math.min(99, 50 + (compositeScore - 65) * 1.4)
  } else if (compositeScore >= 35) {
    verdict = 'RENEGOTIATE'
    verdictColor = 'warning'
    // Confidence is higher when closer to boundaries
    const distanceFromCenter = Math.abs(compositeScore - 50)
    confidence = 50 + distanceFromCenter * 1.5
  } else {
    verdict = 'FIRE'
    verdictColor = 'danger'
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

  const { generateShareURL } = useShareableURL(
    {
      clientName: form.clientName,
      monthlyRevenue: form.monthlyRevenue,
      avgHours: form.avgHours,
      communicationDifficulty: form.communicationDifficulty,
      paymentReliability: form.paymentReliability,
      scopeCreepFrequency: form.scopeCreepFrequency,
      stressLevel: form.stressLevel,
      growthPotential: form.growthPotential,
      referralLikelihood: form.referralLikelihood,
    },
    {
      clientName: (v) => updateField('clientName', v),
      monthlyRevenue: (v) => updateField('monthlyRevenue', v),
      avgHours: (v) => updateField('avgHours', v),
      communicationDifficulty: (v) => updateField('communicationDifficulty', v),
      paymentReliability: (v) => updateField('paymentReliability', v),
      scopeCreepFrequency: (v) => updateField('scopeCreepFrequency', v),
      stressLevel: (v) => updateField('stressLevel', v),
      growthPotential: (v) => updateField('growthPotential', v),
      referralLikelihood: (v) => updateField('referralLikelihood', v),
    }
  )

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

  const inputClass = 'w-full rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 text-sm'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)', '--tw-ring-color': 'var(--accent-soft)' }
  const selectClass = 'w-full rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 text-sm appearance-none cursor-pointer'
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }

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
              <label className={labelClass} style={labelStyle}>Client Name</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                placeholder="Acme Corp"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Monthly Revenue ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  value={form.monthlyRevenue}
                  onChange={(e) => updateField('monthlyRevenue', e.target.value)}
                  placeholder="3000"
                  min="0"
                  className={`${inputClass} pl-7`}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Avg Hours / Month</label>
              <input
                type="number"
                value={form.avgHours}
                onChange={(e) => updateField('avgHours', e.target.value)}
                placeholder="40"
                min="0"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </ResultCard>

        <ResultCard title="Client Behavior" icon="📊">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Communication Difficulty Slider */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Communication Difficulty: <span className="font-mono" style={{ color: 'var(--accent)' }}>{form.communicationDifficulty}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.communicationDifficulty}
                onChange={(e) => updateField('communicationDifficulty', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: 'var(--accent)', background: 'var(--bg-elevated)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Easy</span>
                <span>Nightmare</span>
              </div>
            </div>

            {/* Stress Level Slider */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Stress Level: <span className="font-mono" style={{ color: 'var(--accent)' }}>{form.stressLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={form.stressLevel}
                onChange={(e) => updateField('stressLevel', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: 'var(--accent)', background: 'var(--bg-elevated)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Zen</span>
                <span>Burnout</span>
              </div>
            </div>

            {/* Payment Reliability */}
            <div>
              <label className={labelClass} style={labelStyle}>Payment Reliability</label>
              <select
                value={form.paymentReliability}
                onChange={(e) => updateField('paymentReliability', e.target.value)}
                className={selectClass}
                style={inputStyle}
              >
                {PAYMENT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: 'var(--bg-card)' }}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Scope Creep */}
            <div>
              <label className={labelClass} style={labelStyle}>Scope Creep Frequency</label>
              <select
                value={form.scopeCreepFrequency}
                onChange={(e) => updateField('scopeCreepFrequency', e.target.value)}
                className={selectClass}
                style={inputStyle}
              >
                {SCOPE_CREEP_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: 'var(--bg-card)' }}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Growth Potential */}
            <div>
              <label className={labelClass} style={labelStyle}>Growth Potential</label>
              <select
                value={form.growthPotential}
                onChange={(e) => updateField('growthPotential', e.target.value)}
                className={selectClass}
                style={inputStyle}
              >
                {GROWTH_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: 'var(--bg-card)' }}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Referral Likelihood */}
            <div>
              <label className={labelClass} style={labelStyle}>Referral Likelihood</label>
              <select
                value={form.referralLikelihood}
                onChange={(e) => updateField('referralLikelihood', e.target.value)}
                className={selectClass}
                style={inputStyle}
              >
                {REFERRAL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: 'var(--bg-card)' }}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </ResultCard>

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!form.monthlyRevenue || !form.avgHours}
            className="px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl transition-all text-sm"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Analyze This Client
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
          <ShareButton getShareURL={generateShareURL} />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-6">
          {/* Verdict Banner */}
          <div className="relative overflow-hidden rounded-xl p-8 text-center" style={{
            background: results.verdictColor === 'success' ? 'var(--success-soft)' : results.verdictColor === 'danger' ? 'var(--danger-soft)' : 'var(--warning-soft)',
            border: `1px solid color-mix(in srgb, ${results.verdictColor === 'success' ? 'var(--success)' : results.verdictColor === 'danger' ? 'var(--danger)' : 'var(--warning)'} 20%, transparent)`,
          }}>
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Verdict</p>
            <h2 className="text-5xl font-black" style={{
              color: results.verdictColor === 'success' ? 'var(--success)' : results.verdictColor === 'danger' ? 'var(--danger)' : 'var(--warning)',
            }}>
              {results.verdict}
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {results.confidence}% confidence &middot; Composite Score: {results.compositeScore}/100
            </p>
            {form.clientName && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Analysis for: {form.clientName}</p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>${results.effectiveRate.toFixed(0)}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Effective $/hr</p>
            </ResultCard>
            <ResultCard className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>${results.stressAdjustedRate.toFixed(0)}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Stress-Adjusted $/hr</p>
            </ResultCard>
            <ResultCard className="text-center">
              <p className="text-2xl font-bold" style={{ color: results.opportunityCost > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {results.opportunityCost > 0 ? '-' : '+'}${Math.abs(results.opportunityCost).toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Monthly Opp. Cost</p>
            </ResultCard>
            <ResultCard className="text-center">
              <p className="text-2xl font-bold" style={{ color: results.riskScore > 60 ? 'var(--danger)' : results.riskScore > 35 ? 'var(--warning)' : 'var(--success)' }}>
                {results.riskScore}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Risk Score /100</p>
            </ResultCard>
          </div>

          {/* Dimension Breakdown */}
          <ResultCard title="Dimension Breakdown" icon="📈">
            <div className="space-y-3">
              {results.dimensions.map((dim, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm" style={{ color: 'var(--text-body)' }}>{dim.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dim.detail}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-elevated)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${dim.score}%`,
                        backgroundColor: dim.score >= 70 ? 'var(--success)' : dim.score >= 40 ? 'var(--warning)' : 'var(--danger)',
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
                  <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }}>&#8226;</span>
                  <span style={{ color: 'var(--text-body)' }}>{point}</span>
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
              <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'var(--text-body)' }}>
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
              <div className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
                  ${(parseFloat(form.monthlyRevenue) * 12).toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Annual Revenue from Client</p>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-2xl font-bold" style={{ color: results.annualOpportunityCost > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {results.annualOpportunityCost > 0 ? '-' : '+'}${Math.abs(results.annualOpportunityCost).toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Annual Opportunity Cost</p>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              Opportunity cost calculated against $125/hr market benchmark rate.
            </p>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
