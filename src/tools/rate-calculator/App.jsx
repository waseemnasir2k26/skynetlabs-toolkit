import { useState, useMemo } from 'react'
import IncomeSlider from './components/IncomeSlider'
import ExpensesSection from './components/ExpensesSection'
import TaxCountrySelect from './components/TaxCountrySelect'
import WorkSchedule from './components/WorkSchedule'
import ExperienceSelector from './components/ExperienceSelector'
import NicheSelector from './components/NicheSelector'
import ResultsDashboard from './components/ResultsDashboard'
import PricingTips from './components/PricingTips'
import CTASection from './components/CTASection'
import { countries, expenseCategories, experienceLevels, marketRates } from './data/marketData'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

function App() {
  const [desiredIncome, setDesiredIncome] = useState(100000)
  const [expenses, setExpenses] = useState(() => {
    const init = {}
    expenseCategories.forEach((cat) => { init[cat.id] = cat.default })
    return init
  })
  const [country, setCountry] = useState('United States')
  const [taxRate, setTaxRate] = useState(30)
  const [billableHours, setBillableHours] = useState(30)
  const [weeksOff, setWeeksOff] = useState(4)
  const [experience, setExperience] = useState('intermediate')
  const [niche, setNiche] = useState('webdev')

  const { generateShareURL } = useShareableURL(
    { desiredIncome, country, taxRate, billableHours, weeksOff, experience, niche },
    {
      desiredIncome: setDesiredIncome,
      country: setCountry,
      taxRate: setTaxRate,
      billableHours: setBillableHours,
      weeksOff: setWeeksOff,
      experience: setExperience,
      niche: setNiche,
    }
  )

  const handleCountryChange = (c) => {
    setCountry(c)
    const found = countries.find((x) => x.name === c)
    if (found) setTaxRate(found.taxRate)
  }

  const calculations = useMemo(() => {
    const monthlyExpenses = Object.values(expenses).reduce((a, b) => a + (parseFloat(b) || 0), 0)
    const totalExpenses = monthlyExpenses * 12
    const safeIncome = Math.max(0, parseFloat(desiredIncome) || 0)
    const safeTaxRate = Math.max(0, Math.min(100, parseFloat(taxRate) || 0))
    const taxAmount = safeIncome * (safeTaxRate / 100)
    const totalNeeded = safeIncome + totalExpenses + taxAmount

    const billableWeeks = Math.max(1, 52 - (parseFloat(weeksOff) || 0))
    const safeBillableHours = Math.max(1, parseFloat(billableHours) || 1)
    const annualBillableHours = safeBillableHours * billableWeeks

    const baseHourly = annualBillableHours > 0 ? totalNeeded / annualBillableHours : 0
    const expMultiplier = experienceLevels.find((e) => e.id === experience)?.multiplier || 1
    const nicheData = marketRates[niche] || marketRates.webdev

    // Blend calculated rate with market data
    const marketAdjusted = nicheData.mid * expMultiplier
    const hourlyRate = (baseHourly * 0.6 + marketAdjusted * 0.4)

    const hourlyLow = hourlyRate * 0.8
    const hourlyHigh = hourlyRate * 1.3

    const projectRate = hourlyRate * (nicheData.avgProject / nicheData.mid)
    const monthlyRetainer = hourlyRate * nicheData.retainerHours * 0.85 // slight retainer discount

    const annualRevenue = hourlyRate * annualBillableHours
    const profitMargin = annualRevenue > 0 ? ((annualRevenue - totalExpenses - taxAmount) / annualRevenue) * 100 : 0

    const clientsNeeded = projectRate > 0 ? annualRevenue / (projectRate * 12) : 0

    const marketLow = nicheData.low * expMultiplier
    const marketMid = nicheData.mid * expMultiplier
    const marketHigh = nicheData.high * expMultiplier

    return {
      hourlyRate,
      hourlyLow,
      hourlyHigh,
      projectRate,
      monthlyRetainer,
      annualRevenue,
      profitMargin: Math.max(0, profitMargin),
      clientsNeeded: Math.max(0, clientsNeeded),
      totalExpenses,
      taxAmount,
      desiredIncome,
      marketLow,
      marketMid,
      marketHigh,
    }
  }, [desiredIncome, expenses, taxRate, billableHours, weeksOff, experience, niche])

  return (
    <div className="py-6">
      <div className="text-center px-4 pt-4 pb-6 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
          <span style={{ color: 'var(--text-heading)' }}>Freelance</span>{' '}
          <span className="text-gradient">Rate Calculator</span>
        </h1>
        <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Calculate your perfect hourly rate based on your expenses, desired income, and market data.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6 relative z-10">
        <div className="space-y-6">
          <IncomeSlider value={desiredIncome} onChange={setDesiredIncome} />
          <ExpensesSection expenses={expenses} onChange={setExpenses} />
          <TaxCountrySelect
            country={country}
            taxRate={taxRate}
            onCountryChange={handleCountryChange}
            onTaxChange={setTaxRate}
          />
          <WorkSchedule
            billableHours={billableHours}
            weeksOff={weeksOff}
            onHoursChange={setBillableHours}
            onWeeksOffChange={setWeeksOff}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExperienceSelector selected={experience} onChange={setExperience} />
            <NicheSelector selected={niche} onChange={setNiche} />
          </div>
        </div>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-sm uppercase tracking-wider" style={{ background: 'var(--bg-page)', color: 'var(--text-muted)' }}>
              Your Results
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <ShareButton getShareURL={generateShareURL} />
        </div>

        {/* Results */}
        <ResultsDashboard calculations={calculations} niche={niche} experience={experience} />

        {/* Tips */}
        <PricingTips />

        {/* CTA */}
        <CTASection />
      </main>
    </div>
  )
}

export default App
