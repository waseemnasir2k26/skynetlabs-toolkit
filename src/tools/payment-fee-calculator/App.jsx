import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'

const fmt = (n) => {
  const safe = isFinite(n) ? n : 0
  return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const pct = (n) => {
  const safe = isFinite(n) ? n : 0
  return `${safe.toFixed(2)}%`
}

function NumberInput({ label, value, onChange, prefix = '', suffix = '', min = 0, step = 1 }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
          min={min}
          step={step}
          className={`w-full rounded-lg py-2.5 text-sm focus:outline-none ${prefix ? 'pl-7 pr-4' : suffix ? 'pl-4 pr-8' : 'px-4'}`}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

const PLATFORMS = [
  {
    name: 'PayPal',
    icon: '💳',
    calcFee: (amount) => amount * 0.029 + 0.30,
    calcCharge: (desired) => (desired + 0.30) / (1 - 0.029),
    description: '2.9% + $0.30 per transaction',
  },
  {
    name: 'Stripe',
    icon: '💎',
    calcFee: (amount) => amount * 0.029 + 0.30,
    calcCharge: (desired) => (desired + 0.30) / (1 - 0.029),
    description: '2.9% + $0.30 per transaction',
  },
  {
    name: 'Upwork (0-$500)',
    icon: '🟢',
    calcFee: (amount) => amount * 0.10,
    calcCharge: (desired) => desired / (1 - 0.10),
    description: '10% for first $500 billed with client',
  },
  {
    name: 'Upwork ($500-$10K)',
    icon: '🟡',
    calcFee: (amount) => amount * 0.05,
    calcCharge: (desired) => desired / (1 - 0.05),
    description: '5% for $500.01 - $10,000',
  },
  {
    name: 'Upwork ($10K+)',
    icon: '🔵',
    calcFee: (amount) => amount * 0.033,
    calcCharge: (desired) => desired / (1 - 0.033),
    description: '3.3% for earnings over $10,000',
  },
  {
    name: 'Wise',
    icon: '🌍',
    calcFee: (amount) => amount * 0.005,
    calcCharge: (desired) => desired / (1 - 0.005),
    description: '~0.5% transfer fee',
  },
  {
    name: 'Bank Wire',
    icon: '🏦',
    calcFee: () => 25,
    calcCharge: (desired) => desired + 25,
    description: 'Flat $25 wire transfer fee',
  },
]

function PlatformCard({ platform, amount, isReverse, isBest }) {
  const fee = platform.calcFee(amount)
  const net = amount - fee
  const effectiveRate = amount > 0 ? (fee / amount) * 100 : 0

  const chargeAmount = isReverse ? platform.calcCharge(amount) : null
  const reverseFee = isReverse ? chargeAmount - amount : null

  return (
    <div
      className="p-4 rounded-xl transition-all"
      style={{
        background: 'var(--bg-elevated)',
        border: isBest ? '2px solid var(--success)' : '1px solid var(--border)',
        boxShadow: isBest ? 'var(--shadow-glow)' : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{platform.icon}</span>
          <div>
            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{platform.name}</h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{platform.description}</p>
          </div>
        </div>
        {isBest && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
          >
            Best Option
          </span>
        )}
      </div>

      {!isReverse ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Fee</p>
            <p className="font-bold text-sm" style={{ color: 'var(--danger)' }}>{fmt(fee)}</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>You Receive</p>
            <p className="font-bold text-sm" style={{ color: 'var(--success)' }}>{fmt(net)}</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Effective Rate</p>
            <p className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{pct(effectiveRate)}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Charge Client</p>
            <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{fmt(chargeAmount)}</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Platform Fee</p>
            <p className="font-bold text-sm" style={{ color: 'var(--danger)' }}>{fmt(reverseFee)}</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>You Receive</p>
            <p className="font-bold text-sm" style={{ color: 'var(--success)' }}>{fmt(amount)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [invoiceAmount, setInvoiceAmount] = useLocalStorage('skynet-payment-fee-amount', 2500)
  const [isReverse, setIsReverse] = useState(false)

  const { generateShareURL } = useShareableURL(
    { invoiceAmount },
    { invoiceAmount: setInvoiceAmount }
  )

  const results = useMemo(() => {
    return PLATFORMS.map(platform => {
      const fee = platform.calcFee(invoiceAmount)
      const net = invoiceAmount - fee
      const chargeAmount = platform.calcCharge(invoiceAmount)
      return { ...platform, fee, net, chargeAmount }
    })
  }, [invoiceAmount])

  const bestIndex = useMemo(() => {
    if (isReverse) {
      let minCharge = Infinity
      let idx = 0
      results.forEach((r, i) => {
        if (r.chargeAmount < minCharge) {
          minCharge = r.chargeAmount
          idx = i
        }
      })
      return idx
    } else {
      let maxNet = -Infinity
      let idx = 0
      results.forEach((r, i) => {
        if (r.net > maxNet) {
          maxNet = r.net
          idx = i
        }
      })
      return idx
    }
  }, [results, isReverse])

  const bestPlatform = results[bestIndex]
  const worstResult = isReverse
    ? results.reduce((max, r) => r.chargeAmount > max.chargeAmount ? r : max, results[0])
    : results.reduce((min, r) => r.net < min.net ? r : min, results[0])
  const savingsVsWorst = isReverse
    ? worstResult.chargeAmount - bestPlatform.chargeAmount
    : bestPlatform.net - worstResult.net

  return (
    <ToolLayout
      title="Payment Fee Calculator"
      description="See exactly how much each payment platform costs you. Compare fees side-by-side and find the cheapest way to get paid."
      category="Revenue & Growth"
      icon="🏧"
      proTip="For recurring clients, negotiate payment via Wise or bank wire to save thousands in fees annually. Reserve PayPal/Stripe for one-off or international clients."
    >
      <div id="payment-fee-results">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <NumberInput
            label={isReverse ? 'Amount You Want to RECEIVE' : 'Invoice Amount'}
            value={invoiceAmount}
            onChange={setInvoiceAmount}
            prefix="$"
            step={100}
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>Calculation Mode</label>
            <button
              onClick={() => setIsReverse(!isReverse)}
              className="w-full rounded-lg py-2.5 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: isReverse ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                border: isReverse ? '2px solid var(--accent)' : '1px solid var(--border)',
                color: isReverse ? 'var(--accent)' : 'var(--text-body)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {isReverse ? 'Reverse Mode: What to Charge' : 'Standard Mode: What You Receive'}
            </button>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {isReverse
                ? 'Shows what to invoice so you receive your desired amount after fees'
                : 'Shows how much you keep from your invoice after platform fees'
              }
            </p>
          </div>
        </div>

        {/* Summary Banner */}
        <div
          className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best Option</p>
            <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
              {bestPlatform.name} — {isReverse ? `Charge ${fmt(bestPlatform.chargeAmount)}` : `Receive ${fmt(bestPlatform.net)}`}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Savings vs Worst</p>
            <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>{fmt(savingsVsWorst)}</p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {PLATFORMS.map((platform, i) => (
            <PlatformCard
              key={platform.name}
              platform={platform}
              amount={invoiceAmount}
              isReverse={isReverse}
              isBest={i === bestIndex}
            />
          ))}
        </div>

        {/* Comparison Table */}
        <ResultCard title="Summary Comparison" icon="📊">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Platform</th>
                  <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Fee</th>
                  <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {isReverse ? 'Charge' : 'Net Received'}
                  </th>
                  <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Eff. Rate</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const effectiveRate = invoiceAmount > 0 ? (r.fee / invoiceAmount) * 100 : 0
                  return (
                    <tr
                      key={r.name}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: i === bestIndex ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      <td className="py-2 px-3 font-medium" style={{ color: 'var(--text-heading)' }}>
                        {r.icon} {r.name}
                        {i === bestIndex && (
                          <span className="ml-1 text-xs" style={{ color: 'var(--success)' }}> (Best)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--danger)' }}>{fmt(r.fee)}</td>
                      <td className="py-2 px-3 text-right font-semibold" style={{ color: 'var(--success)' }}>
                        {isReverse ? fmt(r.chargeAmount) : fmt(r.net)}
                      </td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--text-body)' }}>{pct(effectiveRate)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ResultCard>

        {/* Annual Impact */}
        <div className="mt-6">
          <ResultCard title="Annual Impact (if billed monthly)" icon="📅">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              If you invoice {fmt(invoiceAmount)} every month, here is what you lose per year on each platform:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {results.filter((_, i) => [0, 2, 5, 6].includes(i)).map(r => (
                <div key={r.name} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{r.name}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--danger)' }}>
                    {fmt(r.fee * 12)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>lost/year in fees</p>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="payment-fee-results" filename="payment-fee-comparison.pdf" label="Export as PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
