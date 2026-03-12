import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
]

const US_BRACKETS_2024 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
]

const UK_BRACKETS = [
  { min: 0, max: 12570, rate: 0.00, name: 'Personal Allowance' },
  { min: 12570, max: 50270, rate: 0.20, name: 'Basic Rate' },
  { min: 50270, max: 125140, rate: 0.40, name: 'Higher Rate' },
  { min: 125140, max: Infinity, rate: 0.45, name: 'Additional Rate' },
]

const CA_BRACKETS = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 154906, rate: 0.26 },
  { min: 154906, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
]

const AU_BRACKETS = [
  { min: 0, max: 18200, rate: 0.00 },
  { min: 18200, max: 45000, rate: 0.19 },
  { min: 45000, max: 120000, rate: 0.325 },
  { min: 120000, max: 180000, rate: 0.37 },
  { min: 180000, max: Infinity, rate: 0.45 },
]

const DEDUCTIONS = [
  { key: 'homeOffice', label: 'Home Office', defaultAmount: 1500 },
  { key: 'equipment', label: 'Equipment & Hardware', defaultAmount: 2000 },
  { key: 'software', label: 'Software & Subscriptions', defaultAmount: 1200 },
  { key: 'insurance', label: 'Health Insurance', defaultAmount: 6000 },
  { key: 'travel', label: 'Business Travel', defaultAmount: 3000 },
  { key: 'education', label: 'Education & Training', defaultAmount: 1500 },
  { key: 'marketing', label: 'Marketing & Advertising', defaultAmount: 2000 },
  { key: 'phone', label: 'Phone & Internet', defaultAmount: 1200 },
]

function calcBracketTax(income, brackets) {
  let remaining = Math.max(0, income)
  let totalTax = 0
  const breakdown = []
  for (const bracket of brackets) {
    const taxable = Math.min(Math.max(0, remaining - bracket.min), bracket.max - bracket.min)
    const tax = taxable * bracket.rate
    if (taxable > 0) {
      breakdown.push({
        range: bracket.max === Infinity
          ? `${fmtCompact(bracket.min)}+`
          : `${fmtCompact(bracket.min)} - ${fmtCompact(bracket.max)}`,
        rate: `${(bracket.rate * 100).toFixed(1)}%`,
        taxable,
        tax,
        name: bracket.name || null,
      })
    }
    totalTax += tax
  }
  return { totalTax, breakdown }
}

function fmtCompact(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

export default function App() {
  const [grossIncome, setGrossIncome] = useLocalStorage('skynet-tax-estimator-grossIncome', 120000)
  const [businessExpenses, setBusinessExpenses] = useLocalStorage('skynet-tax-estimator-businessExpenses', 15000)
  const [country, setCountry] = useLocalStorage('skynet-tax-estimator-country', 'US')
  const [deductions, setDeductions] = useLocalStorage('skynet-tax-estimator-deductions', {})

  const { generateShareURL } = useShareableURL(
    { grossIncome, businessExpenses, country },
    { grossIncome: setGrossIncome, businessExpenses: setBusinessExpenses, country: setCountry }
  )

  const toggleDeduction = (key, defaultAmount) => {
    setDeductions(prev => {
      const next = { ...prev }
      if (next[key] !== undefined) {
        delete next[key]
      } else {
        next[key] = defaultAmount
      }
      return next
    })
  }

  const updateDeductionAmount = (key, amount) => {
    setDeductions(prev => ({ ...prev, [key]: parseFloat(amount) || 0 }))
  }

  const totalDeductions = Object.values(deductions).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0)
  const fmtPct = (n) => `${(isFinite(n) ? n : 0).toFixed(1)}%`

  const results = useMemo(() => {
    const gross = Math.max(0, parseFloat(grossIncome) || 0)
    const expenses = Math.max(0, parseFloat(businessExpenses) || 0)
    const netIncome = gross - expenses - totalDeductions

    if (country === 'US') {
      const standardDeduction = 14600
      const taxableIncome = Math.max(0, netIncome - standardDeduction)
      const { totalTax: federalTax, breakdown } = calcBracketTax(taxableIncome, US_BRACKETS_2024)
      const seTaxBase = Math.max(0, netIncome * 0.9235)
      const ssTax = Math.min(seTaxBase, 168600) * 0.124
      const medicareTax = seTaxBase * 0.029
      const additionalMedicare = Math.max(0, seTaxBase - 200000) * 0.009
      const selfEmploymentTax = ssTax + medicareTax + additionalMedicare
      const totalTax = federalTax + selfEmploymentTax
      const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0
      const quarterly = totalTax / 4
      const monthlySetAside = totalTax / 12

      return {
        label: 'United States (Federal)',
        taxableIncome,
        standardDeduction,
        federalTax,
        selfEmploymentTax,
        totalTax,
        effectiveRate,
        quarterly,
        monthlySetAside,
        breakdown,
        extras: [
          { label: 'Standard Deduction', value: fmt(standardDeduction) },
          { label: 'Self-Employment Tax (15.3%)', value: fmt(selfEmploymentTax) },
          { label: 'Social Security (12.4%)', value: fmt(ssTax) },
          { label: 'Medicare (2.9%)', value: fmt(medicareTax + additionalMedicare) },
        ],
      }
    }

    if (country === 'UK') {
      const { totalTax: incomeTax, breakdown } = calcBracketTax(netIncome, UK_BRACKETS)
      const class4NI = Math.max(0, netIncome - 12570) * 0.06 + Math.max(0, netIncome - 50270) * 0.02
      const class2NI = netIncome > 12570 ? 3.45 * 52 : 0
      const totalTax = incomeTax + class4NI + class2NI
      const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0
      const quarterly = totalTax / 4
      const monthlySetAside = totalTax / 12

      return {
        label: 'United Kingdom',
        taxableIncome: netIncome,
        standardDeduction: 0,
        federalTax: incomeTax,
        selfEmploymentTax: class4NI + class2NI,
        totalTax,
        effectiveRate,
        quarterly,
        monthlySetAside,
        breakdown,
        extras: [
          { label: 'Personal Allowance', value: '\u00A312,570' },
          { label: 'Class 4 NI', value: `\u00A3${class4NI.toFixed(0)}` },
          { label: 'Class 2 NI', value: `\u00A3${class2NI.toFixed(0)}` },
        ],
      }
    }

    if (country === 'CA') {
      const basicPersonalAmount = 15705
      const taxableIncome = Math.max(0, netIncome - basicPersonalAmount)
      const { totalTax: federalTax, breakdown } = calcBracketTax(taxableIncome, CA_BRACKETS)
      const cppBase = Math.max(0, Math.min(netIncome, 68500) - 3500)
      const cpp = cppBase * 0.1190
      const totalTax = federalTax + cpp
      const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0
      const quarterly = totalTax / 4
      const monthlySetAside = totalTax / 12

      return {
        label: 'Canada (Federal)',
        taxableIncome,
        standardDeduction: basicPersonalAmount,
        federalTax,
        selfEmploymentTax: cpp,
        totalTax,
        effectiveRate,
        quarterly,
        monthlySetAside,
        breakdown,
        extras: [
          { label: 'Basic Personal Amount', value: `C$${basicPersonalAmount.toLocaleString()}` },
          { label: 'CPP Contributions', value: `C$${cpp.toFixed(0)}` },
        ],
      }
    }

    if (country === 'AU') {
      const { totalTax: incomeTax, breakdown } = calcBracketTax(netIncome, AU_BRACKETS)
      const medicareLevy = netIncome * 0.02
      const totalTax = incomeTax + medicareLevy
      const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0
      const quarterly = totalTax / 4
      const monthlySetAside = totalTax / 12

      return {
        label: 'Australia',
        taxableIncome: netIncome,
        standardDeduction: 0,
        federalTax: incomeTax,
        selfEmploymentTax: medicareLevy,
        totalTax,
        effectiveRate,
        quarterly,
        monthlySetAside,
        breakdown,
        extras: [
          { label: 'Tax-Free Threshold', value: 'A$18,200' },
          { label: 'Medicare Levy (2%)', value: `A$${medicareLevy.toFixed(0)}` },
        ],
      }
    }

    return null
  }, [grossIncome, businessExpenses, country, totalDeductions])

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-heading)',
    borderRadius: 'var(--radius)',
  }

  const labelStyle = { color: 'var(--text-muted)' }

  const summaryText = results ? `Tax Estimate Summary (${results.label})
Gross Income: ${fmt(grossIncome)}
Business Expenses: ${fmt(businessExpenses)}
Additional Deductions: ${fmt(totalDeductions)}
Taxable Income: ${fmt(results.taxableIncome)}
Income Tax: ${fmt(results.federalTax)}
Self-Employment/NI Tax: ${fmt(results.selfEmploymentTax)}
Total Estimated Tax: ${fmt(results.totalTax)}
Effective Tax Rate: ${fmtPct(results.effectiveRate)}
Quarterly Payments: ${fmt(results.quarterly)}
Monthly Set-Aside: ${fmt(results.monthlySetAside)}` : ''

  return (
    <ToolLayout
      title="Freelance Tax Estimator"
      description="Estimate your freelance tax obligations with country-specific brackets, self-employment tax, and deduction tracking."
      icon="\uD83D\uDCCA"
      category="Revenue & Growth"
      proTip="Track your deductions throughout the year. Many freelancers miss legitimate write-offs that could save thousands. This is an estimate - consult a tax professional for exact numbers."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-6">
          <ResultCard title="Income Details" icon="\uD83D\uDCB5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Country / Region</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Annual Gross Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-lg"
                    style={inputStyle}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Business Expenses</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    value={businessExpenses}
                    onChange={(e) => setBusinessExpenses(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-lg"
                    style={inputStyle}
                    min="0"
                    step="500"
                  />
                </div>
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Deduction Checklist" icon="\u2705">
            <p className="text-xs mb-4" style={labelStyle}>Check deductions that apply to you and enter the annual amounts.</p>
            <div className="space-y-3">
              {DEDUCTIONS.map(d => {
                const isActive = deductions[d.key] !== undefined
                return (
                  <div key={d.key} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDeduction(d.key, d.defaultAmount)}
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      {isActive && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="flex-1 text-sm" style={{ color: isActive ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                      {d.label}
                    </span>
                    {isActive && (
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>$</span>
                        <input
                          type="number"
                          value={deductions[d.key]}
                          onChange={(e) => updateDeductionAmount(d.key, e.target.value)}
                          className="w-full pl-5 pr-2 py-1 text-sm rounded-lg text-right"
                          style={inputStyle}
                          min="0"
                          step="100"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {totalDeductions > 0 && (
              <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>Total Deductions</span>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{fmt(totalDeductions)}</span>
              </div>
            )}
          </ResultCard>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {results && (
            <>
              {/* Monthly Set-Aside Callout */}
              <div
                className="rounded-xl p-5 text-center"
                style={{ background: 'var(--accent-soft)', border: '2px solid var(--accent)' }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>Set aside this much per month</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{fmt(results.monthlySetAside)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  to cover your estimated annual tax of {fmt(results.totalTax)}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Taxable Income', value: fmt(results.taxableIncome), accent: false },
                  { label: 'Estimated Tax', value: fmt(results.totalTax), accent: true },
                  { label: 'Effective Rate', value: fmtPct(results.effectiveRate), accent: false },
                  { label: 'Quarterly Payment', value: fmt(results.quarterly), accent: true },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <div className="text-xl font-bold" style={{ color: card.accent ? 'var(--accent)' : 'var(--text-heading)' }}>
                      {card.value}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Tax Bracket Breakdown */}
              <ResultCard title={`Tax Brackets \u2014 ${results.label}`} icon="\uD83D\uDCC9">
                <div className="space-y-2">
                  {results.breakdown.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {b.name ? `${b.name} (${b.rate})` : b.rate}
                          </span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-heading)' }}>
                            {fmt(b.tax)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-card)' }}>
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${results.totalTax > 0 ? (b.tax / results.totalTax) * 100 : 0}%`,
                              background: 'var(--accent)',
                              minWidth: b.tax > 0 ? '4px' : '0px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ResultCard>

              {/* Country-Specific Extras */}
              <ResultCard title="Additional Details" icon="\uD83D\uDCCB">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Gross Income</span>
                    <span style={{ color: 'var(--text-heading)' }}>{fmt(grossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Business Expenses</span>
                    <span style={{ color: 'var(--danger)' }}>-{fmt(businessExpenses)}</span>
                  </div>
                  {totalDeductions > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Checked Deductions</span>
                      <span style={{ color: 'var(--danger)' }}>-{fmt(totalDeductions)}</span>
                    </div>
                  )}
                  <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex justify-between text-sm font-medium">
                      <span style={{ color: 'var(--text-heading)' }}>Net Income</span>
                      <span style={{ color: 'var(--text-heading)' }}>
                        {fmt((parseFloat(grossIncome) || 0) - (parseFloat(businessExpenses) || 0) - totalDeductions)}
                      </span>
                    </div>
                  </div>
                  {results.extras.map((extra, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>{extra.label}</span>
                      <span style={{ color: 'var(--text-body)' }}>{extra.value}</span>
                    </div>
                  ))}
                  <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex justify-between text-sm font-bold">
                      <span style={{ color: 'var(--text-heading)' }}>Take-Home (After Tax)</span>
                      <span style={{ color: 'var(--accent)' }}>
                        {fmt((parseFloat(grossIncome) || 0) - (parseFloat(businessExpenses) || 0) - totalDeductions - results.totalTax)}
                      </span>
                    </div>
                  </div>
                </div>
              </ResultCard>

              {/* Actions */}
              <div className="flex justify-center gap-3">
                <CopyButton text={summaryText} label="Copy Summary" />
                <ShareButton getShareURL={generateShareURL} />
              </div>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
