import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import { useToast } from '../shared/Toast'
import { generateId } from '../shared/utils'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

function createEmptyLineItem() {
  return { id: generateId(), description: '', quantity: 1, unitPrice: 0 }
}

export default function App() {
  const [businessName, setBusinessName] = useLocalStorage('skynet-invoice-generator-businessName', '')
  const [clientName, setClientName] = useLocalStorage('skynet-invoice-generator-clientName', '')
  const [invoiceNumber, setInvoiceNumber] = useLocalStorage('skynet-invoice-generator-invoiceNumber', `INV-${Date.now().toString(36).toUpperCase()}`)
  const [invoiceDate, setInvoiceDate] = useLocalStorage('skynet-invoice-generator-date', new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useLocalStorage('skynet-invoice-generator-dueDate', '')
  const [currency, setCurrency] = useLocalStorage('skynet-invoice-generator-currency', 'USD')
  const [taxRate, setTaxRate] = useLocalStorage('skynet-invoice-generator-taxRate', 0)
  const [notes, setNotes] = useLocalStorage('skynet-invoice-generator-notes', 'Payment is due within 30 days of invoice date. Late payments may incur a 1.5% monthly interest charge.')
  const [lineItems, setLineItems] = useLocalStorage('skynet-invoice-generator-lineItems', [createEmptyLineItem()])
  const toast = useToast()

  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  const fmt = (n) => {
    const val = isFinite(n) ? n : 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyObj.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)
  }

  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
    }, 0)
    const tax = subtotal * ((parseFloat(taxRate) || 0) / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [lineItems, taxRate])

  const addLineItem = () => {
    setLineItems([...lineItems, createEmptyLineItem()])
  }

  const removeLineItem = (id) => {
    if (lineItems.length <= 1) {
      if (toast) toast('At least one line item is required', 'error')
      return
    }
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const generateNewInvoiceNumber = () => {
    setInvoiceNumber(`INV-${Date.now().toString(36).toUpperCase()}`)
    if (toast) toast('New invoice number generated', 'success')
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-heading)',
    borderRadius: 'var(--radius)',
  }

  const labelStyle = { color: 'var(--text-muted)' }

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create professional invoices with automatic calculations. Add line items, tax, and export to PDF."
      icon="\uD83E\uDDFE"
      category="Generator"
      maxWidth="wide"
      proTip="Save your business name once and it persists across sessions. Use the PDF export for clean, print-ready invoices."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Business & Client Info */}
          <ResultCard title="Invoice Details" icon="\uD83D\uDCCB">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Your Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Design Studio"
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client Corp Inc."
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Invoice Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg"
                    style={inputStyle}
                  />
                  <button
                    onClick={generateNewInvoiceNumber}
                    className="px-3 py-2 text-xs rounded-lg transition-all"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                    title="Generate new number"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
            </div>
          </ResultCard>

          {/* Line Items */}
          <ResultCard title="Line Items" icon="\uD83D\uDCE6">
            <div className="space-y-3">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium" style={labelStyle}>
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {lineItems.map((item) => {
                const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Service description..."
                        className="w-full px-3 py-2 text-sm rounded-lg"
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 text-sm rounded-lg text-center"
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm rounded-lg text-center"
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                      {fmt(amount)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={addLineItem}
                className="w-full py-2.5 text-sm font-medium rounded-lg transition-all border-2 border-dashed"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}
              >
                + Add Line Item
              </button>
            </div>
          </ResultCard>

          {/* Tax & Totals */}
          <ResultCard title="Tax & Totals" icon="\uD83D\uDCB0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={labelStyle}>Subtotal</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{fmt(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm" style={labelStyle}>Tax Rate</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-20 px-3 py-1.5 text-sm rounded-lg text-center"
                    style={inputStyle}
                  />
                  <span className="text-sm" style={labelStyle}>%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={labelStyle}>Tax Amount</span>
                <span className="text-sm" style={{ color: 'var(--text-body)' }}>{fmt(calculations.tax)}</span>
              </div>
              <div className="pt-3" style={{ borderTop: '2px solid var(--border)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Total Due</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{fmt(calculations.total)}</span>
                </div>
              </div>
            </div>
          </ResultCard>

          {/* Notes */}
          <ResultCard title="Notes & Terms" icon="\uD83D\uDCDD">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Payment terms, bank details, thank you note..."
              className="w-full px-3 py-2 text-sm rounded-lg resize-y"
              style={inputStyle}
            />
          </ResultCard>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Live Preview</h3>
            <div className="flex gap-2">
              <ExportButton elementId="invoice-preview" filename={`${invoiceNumber || 'invoice'}.pdf`} label="Export PDF" />
            </div>
          </div>

          <div
            id="invoice-preview"
            className="rounded-xl p-8"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                  {businessName || 'Your Business Name'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Invoice</p>
              </div>
              <div className="text-right">
                <div
                  className="inline-block px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {invoiceNumber || 'INV-XXXX'}
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                  Bill To
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                  {clientName || 'Client Name'}
                </p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Date: </span>
                    <span className="text-sm" style={{ color: 'var(--text-body)' }}>
                      {invoiceDate ? new Date(invoiceDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Due: </span>
                    <span className="text-sm font-medium" style={{ color: dueDate ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                      {dueDate ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-6">
              <div
                className="grid grid-cols-12 gap-2 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              {lineItems.map((item) => {
                const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 py-3 px-3 text-sm"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div className="col-span-5" style={{ color: 'var(--text-heading)' }}>
                      {item.description || 'Untitled item'}
                    </div>
                    <div className="col-span-2 text-center" style={{ color: 'var(--text-body)' }}>
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-center" style={{ color: 'var(--text-body)' }}>
                      {fmt(parseFloat(item.unitPrice) || 0)}
                    </div>
                    <div className="col-span-3 text-right font-medium" style={{ color: 'var(--text-heading)' }}>
                      {fmt(amount)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ color: 'var(--text-heading)' }}>{fmt(calculations.subtotal)}</span>
                </div>
                {parseFloat(taxRate) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Tax ({taxRate}%)</span>
                    <span style={{ color: 'var(--text-body)' }}>{fmt(calculations.tax)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-2 text-base font-bold"
                  style={{ borderTop: '2px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--text-heading)' }}>Total</span>
                  <span style={{ color: 'var(--accent)' }}>{fmt(calculations.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div
                className="rounded-lg p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                  Notes & Terms
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>
                  {notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Thank you for your business!
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
