import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import CopyButton from '../shared/CopyButton'

const fmt = (n) => {
  const safe = isFinite(n) ? n : 0
  return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function NumberInput({ label, value, onChange, prefix = '', suffix = '', min = 0, step = 1, helpText = '' }) {
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
          className={`w-full rounded-lg py-2.5 text-sm focus:outline-none ${prefix ? 'pl-7 pr-4' : suffix ? 'pl-4 pr-12' : 'px-4'}`}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
        )}
      </div>
      {helpText && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{helpText}</p>}
    </div>
  )
}

function DateInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg py-2.5 px-4 text-sm focus:outline-none"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
      />
    </div>
  )
}

function MetricBox({ label, value, sub, highlight = false, danger = false }) {
  const getStyle = () => {
    if (danger) return { background: 'var(--danger-soft)', borderColor: 'var(--danger)' }
    if (highlight) return { background: 'var(--accent-soft)', borderColor: 'var(--accent)' }
    return { background: 'var(--bg-elevated)', borderColor: 'var(--border)' }
  }
  const getColor = () => {
    if (danger) return 'var(--danger)'
    if (highlight) return 'var(--accent)'
    return 'var(--text-heading)'
  }
  return (
    <div className="p-4 rounded-lg border" style={getStyle()}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: getColor() }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function EmailTemplate({ title, severity, clientName, invoiceNumber, invoiceAmount, daysOverdue, totalOwed, lateFee }) {
  const templates = {
    friendly: `Subject: Friendly Reminder - Invoice #${invoiceNumber} Past Due

Hi ${clientName},

Hope you're doing well! I wanted to send a quick reminder that Invoice #${invoiceNumber} for ${fmt(invoiceAmount)} was due ${daysOverdue} days ago.

I understand things get busy, so no worries at all. Could you let me know when I can expect payment?

If it has already been sent, please disregard this message.

Thanks so much!

Best regards,
[Your Name]`,

    firm: `Subject: Follow-Up: Invoice #${invoiceNumber} - ${daysOverdue} Days Overdue

Hi ${clientName},

I'm following up regarding Invoice #${invoiceNumber} for ${fmt(invoiceAmount)}, which is now ${daysOverdue} days past due.

Per our agreement, a late fee of ${fmt(lateFee)} has been applied, bringing the total to ${fmt(totalOwed)}.

I'd appreciate it if you could process this payment at your earliest convenience, or let me know if there's an issue I can help resolve.

Please remit payment within the next 7 business days.

Thank you,
[Your Name]`,

    final: `Subject: FINAL NOTICE - Invoice #${invoiceNumber} - Immediate Payment Required

Dear ${clientName},

This is a final notice regarding Invoice #${invoiceNumber}, originally for ${fmt(invoiceAmount)}, which is now ${daysOverdue} days overdue.

The total amount due, including late fees, is ${fmt(totalOwed)}.

If full payment is not received within 7 calendar days, I will be forced to:
- Pause all ongoing work
- Refer this matter to a collections agency
- Pursue legal remedies as outlined in our contract

I sincerely hope we can resolve this amicably. Please contact me immediately to arrange payment or discuss a payment plan.

Regards,
[Your Name]`,
  }

  const severityColors = {
    friendly: 'var(--success)',
    firm: 'var(--warning)',
    final: 'var(--danger)',
  }

  const severityBg = {
    friendly: 'var(--success-soft)',
    firm: 'var(--warning-soft)',
    final: 'var(--danger-soft)',
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: severityBg[severity], borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: severityColors[severity] }} />
          <h4 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{title}</h4>
        </div>
        <CopyButton text={templates[severity]} label="Copy Email" />
      </div>
      <div className="p-4" style={{ background: 'var(--bg-elevated)' }}>
        <pre
          className="text-sm whitespace-pre-wrap font-sans leading-relaxed"
          style={{ color: 'var(--text-body)' }}
        >
          {templates[severity]}
        </pre>
      </div>
    </div>
  )
}

export default function App() {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const [invoiceAmount, setInvoiceAmount] = useLocalStorage('skynet-late-fee-amount', 5000)
  const [dueDate, setDueDate] = useLocalStorage('skynet-late-fee-dueDate', thirtyDaysAgo)
  const [paymentDate, setPaymentDate] = useLocalStorage('skynet-late-fee-payDate', today)
  const [interestRate, setInterestRate] = useLocalStorage('skynet-late-fee-rate', 1.5)
  const [clientName, setClientName] = useLocalStorage('skynet-late-fee-client', 'Client')
  const [invoiceNumber, setInvoiceNumber] = useLocalStorage('skynet-late-fee-invoiceNum', 'INV-001')

  const { generateShareURL } = useShareableURL(
    { invoiceAmount, dueDate, paymentDate, interestRate },
    {
      invoiceAmount: setInvoiceAmount,
      dueDate: setDueDate,
      paymentDate: setPaymentDate,
      interestRate: setInterestRate,
    }
  )

  const calc = useMemo(() => {
    const due = new Date(dueDate)
    const paid = new Date(paymentDate)
    const diffMs = paid.getTime() - due.getTime()
    const daysOverdue = Math.max(0, Math.ceil(diffMs / 86400000))
    const monthlyRate = interestRate / 100
    const dailyRate = monthlyRate / 30
    const lateFee = invoiceAmount * dailyRate * daysOverdue
    const totalOwed = invoiceAmount + lateFee

    const escalation = [7, 14, 30, 60, 90].map(days => ({
      days,
      fee: invoiceAmount * dailyRate * days,
      total: invoiceAmount + (invoiceAmount * dailyRate * days),
      feePercent: ((invoiceAmount * dailyRate * days) / invoiceAmount) * 100,
    }))

    return { daysOverdue, lateFee, totalOwed, dailyRate, escalation }
  }, [invoiceAmount, dueDate, paymentDate, interestRate])

  return (
    <ToolLayout
      title="Late Payment Fee Calculator"
      description="Calculate late fees, see how they escalate over time, and use professional chase email templates to recover what you're owed."
      category="Revenue & Growth"
      icon="⏰"
      proTip="Always include late fee terms in your contract BEFORE starting work. Most common: 1.5% per month (18% APR). Some states cap this, so check local laws."
    >
      <div id="late-fee-results">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            <ResultCard title="Invoice Details" icon="📄">
              <div className="space-y-4">
                <NumberInput label="Invoice Amount" value={invoiceAmount} onChange={setInvoiceAmount} prefix="$" step={100} />
                <DateInput label="Invoice Due Date" value={dueDate} onChange={setDueDate} />
                <DateInput label="Today / Payment Date" value={paymentDate} onChange={setPaymentDate} />
                <NumberInput
                  label="Monthly Interest Rate"
                  value={interestRate}
                  onChange={setInterestRate}
                  suffix="% / month"
                  step={0.1}
                  min={0}
                  helpText={`That's ${(interestRate * 12).toFixed(1)}% APR`}
                />
              </div>
            </ResultCard>

            <ResultCard title="Email Personalization" icon="✏️">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full rounded-lg py-2.5 px-4 text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-lg py-2.5 px-4 text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    placeholder="INV-001"
                  />
                </div>
              </div>
            </ResultCard>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {/* Current Late Fee */}
            <ResultCard title="Current Late Fee" icon="💸">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricBox label="Days Overdue" value={calc.daysOverdue} sub={calc.daysOverdue === 0 ? 'Not yet overdue' : 'days late'} danger={calc.daysOverdue > 0} />
                <MetricBox label="Late Fee" value={fmt(calc.lateFee)} danger={calc.lateFee > 0} />
              </div>
              <div
                className="text-center py-4 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Total Amount Owed</p>
                <p className="text-4xl font-bold" style={{ color: calc.daysOverdue > 0 ? 'var(--danger)' : 'var(--text-heading)' }}>
                  {fmt(calc.totalOwed)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Original: {fmt(invoiceAmount)} + Fee: {fmt(calc.lateFee)}
                </p>
              </div>
            </ResultCard>

            {/* Escalation Timeline */}
            <ResultCard title="Fee Escalation Timeline" icon="📈">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                How fees grow the longer the invoice goes unpaid:
              </p>
              <div className="space-y-3">
                {calc.escalation.map(row => {
                  const isActive = calc.daysOverdue >= row.days
                  const isCurrent = calc.daysOverdue >= row.days && (
                    row.days === 90 || calc.daysOverdue < calc.escalation[calc.escalation.indexOf(row) + 1]?.days
                  )
                  return (
                    <div key={row.days} className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive ? 'var(--danger-soft)' : 'var(--bg-elevated)',
                          border: isCurrent ? '2px solid var(--danger)' : '1px solid var(--border)',
                        }}
                      >
                        <span className="text-sm font-bold" style={{ color: isActive ? 'var(--danger)' : 'var(--text-heading)' }}>
                          {row.days}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>days</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                            Fee: {fmt(row.fee)}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: isActive ? 'var(--danger)' : 'var(--text-body)' }}>
                            Total: {fmt(row.total)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(row.feePercent * 2, 100)}%`,
                              background: isActive ? 'var(--danger)' : 'var(--text-muted)',
                              opacity: isActive ? 1 : 0.3,
                            }}
                          />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          +{row.feePercent.toFixed(2)}% of invoice
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ResultCard>
          </div>
        </div>

        {/* Chase Email Templates */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>
            Chase Email Templates
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Professional email templates to help you recover payment. Click "Copy Email" to copy the full template.
          </p>

          <div className="space-y-4">
            <EmailTemplate
              title="Friendly Reminder (1-7 days late)"
              severity="friendly"
              clientName={clientName}
              invoiceNumber={invoiceNumber}
              invoiceAmount={invoiceAmount}
              daysOverdue={calc.daysOverdue}
              totalOwed={calc.totalOwed}
              lateFee={calc.lateFee}
            />
            <EmailTemplate
              title="Firm Follow-Up (14-30 days late)"
              severity="firm"
              clientName={clientName}
              invoiceNumber={invoiceNumber}
              invoiceAmount={invoiceAmount}
              daysOverdue={calc.daysOverdue}
              totalOwed={calc.totalOwed}
              lateFee={calc.lateFee}
            />
            <EmailTemplate
              title="Final Notice (30+ days late)"
              severity="final"
              clientName={clientName}
              invoiceNumber={invoiceNumber}
              invoiceAmount={invoiceAmount}
              daysOverdue={calc.daysOverdue}
              totalOwed={calc.totalOwed}
              lateFee={calc.lateFee}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="late-fee-results" filename="late-fee-calculation.pdf" label="Export as PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
