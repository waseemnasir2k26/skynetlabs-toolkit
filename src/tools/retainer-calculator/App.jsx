import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

const COMMITMENT_OPTIONS = [
  { months: 3, label: '3 Months' },
  { months: 6, label: '6 Months' },
  { months: 12, label: '12 Months' },
]

export default function App() {
  const [hourlyRate, setHourlyRate] = useLocalStorage('skynet-retainer-calculator-hourlyRate', 150)
  const [estimatedHours, setEstimatedHours] = useLocalStorage('skynet-retainer-calculator-estimatedHours', 20)
  const [discount, setDiscount] = useLocalStorage('skynet-retainer-calculator-discount', 10)
  const [commitment, setCommitment] = useLocalStorage('skynet-retainer-calculator-commitment', 6)
  const [tierBasicHours, setTierBasicHours] = useLocalStorage('skynet-retainer-calculator-tierBasicHours', 10)
  const [tierStandardHours, setTierStandardHours] = useLocalStorage('skynet-retainer-calculator-tierStandardHours', 20)
  const [tierPremiumHours, setTierPremiumHours] = useLocalStorage('skynet-retainer-calculator-tierPremiumHours', 40)

  const { generateShareURL } = useShareableURL(
    { hourlyRate, estimatedHours, discount, commitment, tierBasicHours, tierStandardHours, tierPremiumHours },
    {
      hourlyRate: setHourlyRate,
      estimatedHours: setEstimatedHours,
      discount: setDiscount,
      commitment: setCommitment,
      tierBasicHours: setTierBasicHours,
      tierStandardHours: setTierStandardHours,
      tierPremiumHours: setTierPremiumHours,
    }
  )

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0)
  const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(isFinite(n) ? n : 0)

  const calc = useMemo(() => {
    const rate = Math.max(0, parseFloat(hourlyRate) || 0)
    const hours = Math.max(0, parseFloat(estimatedHours) || 0)
    const disc = Math.max(0, Math.min(100, parseFloat(discount) || 0))
    const months = Math.max(1, parseFloat(commitment) || 1)

    const standardMonthly = rate * hours
    const retainerRate = rate * (1 - disc / 100)
    const retainerMonthly = retainerRate * hours
    const totalContractValue = retainerMonthly * months
    const clientSavingsMonthly = standardMonthly - retainerMonthly
    const clientSavingsTotal = clientSavingsMonthly * months

    return {
      standardRate: rate,
      retainerRate,
      standardMonthly,
      retainerMonthly,
      totalContractValue,
      clientSavingsMonthly,
      clientSavingsTotal,
      months,
    }
  }, [hourlyRate, estimatedHours, discount, commitment])

  const tiers = useMemo(() => {
    const rate = Math.max(0, parseFloat(hourlyRate) || 0)
    const disc = Math.max(0, Math.min(100, parseFloat(discount) || 0))
    const retainerRate = rate * (1 - disc / 100)
    const months = Math.max(1, parseFloat(commitment) || 1)

    const buildTier = (name, hours, highlight) => {
      const monthly = retainerRate * hours
      const annual = monthly * 12
      const totalContract = monthly * months
      const savingsVsStandard = (rate * hours - monthly) * months
      return { name, hours, monthly, annual, totalContract, savingsVsStandard, highlight }
    }

    return [
      buildTier('Basic', parseFloat(tierBasicHours) || 10, false),
      buildTier('Standard', parseFloat(tierStandardHours) || 20, true),
      buildTier('Premium', parseFloat(tierPremiumHours) || 40, false),
    ]
  }, [hourlyRate, discount, commitment, tierBasicHours, tierStandardHours, tierPremiumHours])

  const agreementText = `RETAINER AGREEMENT SUMMARY
============================

Service Provider Hourly Rate: ${fmtDec(calc.standardRate)}/hr
Retainer Discount: ${discount}%
Retainer Rate: ${fmtDec(calc.retainerRate)}/hr

Monthly Hours: ${estimatedHours} hours
Monthly Retainer Fee: ${fmt(calc.retainerMonthly)}
Commitment Period: ${calc.months} months
Total Contract Value: ${fmt(calc.totalContractValue)}

Client Savings: ${fmt(calc.clientSavingsTotal)} over ${calc.months} months

TIER COMPARISON:
${tiers.map(t => `  ${t.name} (${t.hours}h/mo): ${fmt(t.monthly)}/mo | ${fmt(t.annual)}/yr`).join('\n')}

This retainer guarantees ${estimatedHours} hours of dedicated service per month at a preferred rate. Unused hours do not roll over unless otherwise agreed. Additional hours beyond the retainer are billed at the standard rate of ${fmtDec(calc.standardRate)}/hr.`

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-heading)',
    borderRadius: 'var(--radius)',
  }

  const labelStyle = { color: 'var(--text-muted)' }

  return (
    <ToolLayout
      title="Retainer Pricing Calculator"
      description="Calculate retainer pricing with discount tiers, compare packages, and generate agreement summaries for predictable revenue."
      icon="\uD83D\uDD04"
      category="Revenue & Growth"
      proTip="Offering a 10-15% discount for retainer commitments is standard. It gives your client a better rate while guaranteeing you predictable monthly revenue."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-6">
          <ResultCard title="Rate & Terms" icon="\uD83D\uDCB2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Hourly Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-lg"
                    style={inputStyle}
                    min="0"
                    step="5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Estimated Hours / Month</label>
                <input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={labelStyle}>
                  Retainer Discount: <span style={{ color: 'var(--accent)' }}>{discount}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent)', background: 'rgba(255,255,255,0.1)' }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>0%</span>
                  <span>40%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={labelStyle}>Commitment Length</label>
                <div className="flex gap-2">
                  {COMMITMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.months}
                      onClick={() => setCommitment(opt.months)}
                      className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                      style={{
                        background: commitment === opt.months ? 'var(--accent)' : 'var(--bg-elevated)',
                        color: commitment === opt.months ? 'var(--text-on-accent)' : 'var(--text-body)',
                        border: `1px solid ${commitment === opt.months ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ResultCard>

          {/* Tier Configuration */}
          <ResultCard title="Tier Hours (Editable)" icon="\u2699\uFE0F">
            <p className="text-xs mb-4" style={labelStyle}>Customize the hours for each retainer tier to match your service offerings.</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Basic', value: tierBasicHours, setter: setTierBasicHours },
                { label: 'Standard', value: tierStandardHours, setter: setTierStandardHours },
                { label: 'Premium', value: tierPremiumHours, setter: setTierPremiumHours },
              ].map((tier) => (
                <div key={tier.label}>
                  <label className="block text-xs font-medium mb-1 text-center" style={labelStyle}>{tier.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={tier.value}
                      onChange={(e) => tier.setter(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm rounded-lg text-center"
                      style={inputStyle}
                      min="1"
                      step="5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* Main Calculation */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--accent-soft)', border: '2px solid var(--accent)' }}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Standard Rate</p>
                <p className="text-lg font-bold line-through opacity-60" style={{ color: 'var(--text-heading)' }}>
                  {fmtDec(calc.standardRate)}/hr
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Retainer Rate</p>
                <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                  {fmtDec(calc.retainerRate)}/hr
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly Retainer</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>{fmt(calc.retainerMonthly)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Contract ({calc.months}mo)</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{fmt(calc.totalContractValue)}</p>
              </div>
            </div>
          </div>

          {/* Client Savings */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'var(--success-soft)', border: '1px solid var(--success)' }}
          >
            <div className="text-3xl flex-shrink-0">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--success)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>Client Saves</p>
              <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                {fmt(calc.clientSavingsTotal)}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                over {calc.months} months ({fmt(calc.clientSavingsMonthly)}/mo)
              </p>
            </div>
          </div>

          {/* Tier Comparison */}
          <ResultCard title="Tier Comparison" icon="\uD83D\uDCCA">
            <div className="grid grid-cols-3 gap-3">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-xl p-4 text-center transition-all"
                  style={{
                    background: tier.highlight ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    border: tier.highlight ? '2px solid var(--accent)' : '1px solid var(--border)',
                    transform: tier.highlight ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  {tier.highlight && (
                    <span
                      className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2"
                      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                    >
                      POPULAR
                    </span>
                  )}
                  <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text-heading)' }}>{tier.name}</h4>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{tier.hours} hrs/month</p>
                  <p className="text-xl font-bold mb-1" style={{ color: tier.highlight ? 'var(--accent)' : 'var(--text-heading)' }}>
                    {fmt(tier.monthly)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>per month</p>
                  <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Annual Revenue</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{fmt(tier.annual)}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Contract Value</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{fmt(tier.totalContract)}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Client Savings</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>{fmt(tier.savingsVsStandard)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Annual Predictable Revenue */}
          <ResultCard title="Annual Predictable Revenue" icon="\uD83D\uDCC8">
            <p className="text-xs mb-4" style={labelStyle}>
              If you maintain one client at each tier level, here is your predictable annual revenue:
            </p>
            <div className="space-y-3">
              {tiers.map((tier) => {
                const maxAnnual = Math.max(...tiers.map(t => t.annual))
                const barWidth = maxAnnual > 0 ? (tier.annual / maxAnnual) * 100 : 0
                return (
                  <div key={tier.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                        {tier.name} ({tier.hours}h/mo)
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{fmt(tier.annual)}/yr</span>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ background: 'var(--bg-card)' }}>
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%`, background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="pt-3 flex justify-between" style={{ borderTop: '2px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>Combined (1 of each tier)</span>
                <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                  {fmt(tiers.reduce((sum, t) => sum + t.annual, 0))}/yr
                </span>
              </div>
            </div>
          </ResultCard>

          {/* Retainer Agreement Summary */}
          <ResultCard title="Retainer Agreement Summary" icon="\uD83D\uDCCB">
            <div
              className="rounded-lg p-4 text-xs font-mono whitespace-pre-wrap mb-3"
              style={{ background: 'var(--bg-card)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
            >
              {agreementText}
            </div>
            <div className="flex gap-2 justify-end">
              <CopyButton text={agreementText} label="Copy Agreement" />
            </div>
          </ResultCard>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <ShareButton getShareURL={generateShareURL} />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
