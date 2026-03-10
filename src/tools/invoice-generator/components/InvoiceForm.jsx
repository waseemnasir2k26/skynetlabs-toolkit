import React, { useRef } from 'react'
import { CURRENCIES, STATUSES, TEMPLATES } from '../utils/constants'

function FormSection({ title, icon, children }) {
  return (
    <div className="glass rounded-xl p-4 sm:p-5 space-y-4 fade-in">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>}
      <input
        className="w-full bg-dark-200 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        {...props}
      />
    </div>
  )
}

function TextArea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>}
      <textarea
        className="w-full bg-dark-200 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
        rows={3}
        {...props}
      />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>}
      <select
        className="w-full bg-dark-200 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export default function InvoiceForm({
  invoice,
  updateField,
  addLineItem,
  removeLineItem,
  updateLineItem,
  onSave,
  onDownload,
  downloading,
  hasUnsavedChanges,
}) {
  const logoInputRef = useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        updateField('from.logo', ev.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Top Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <Select
            options={TEMPLATES.map(t => ({ value: t.id, label: t.name }))}
            value={invoice.template}
            onChange={(e) => updateField('template', e.target.value)}
          />
          <Select
            options={STATUSES.map(s => ({ value: s.value, label: s.label }))}
            value={invoice.status}
            onChange={(e) => updateField('status', e.target.value)}
          />
          <Select
            options={CURRENCIES.map(c => ({ value: c.code, label: `${c.code} (${c.symbol})` }))}
            value={invoice.currency}
            onChange={(e) => updateField('currency', e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              hasUnsavedChanges
                ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                : 'bg-dark-300 text-gray-400 hover:bg-dark-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Details */}
      <FormSection
        title="Invoice Details"
        icon={
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Invoice Number"
            value={invoice.invoiceNumber}
            onChange={(e) => updateField('invoiceNumber', e.target.value)}
          />
          <Input
            label="Invoice Date"
            type="date"
            value={invoice.invoiceDate}
            onChange={(e) => updateField('invoiceDate', e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            value={invoice.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
          />
        </div>
      </FormSection>

      {/* From / To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSection
          title="From (Your Business)"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        >
          <Input
            label="Business Name"
            placeholder="Your business name"
            value={invoice.from.name}
            onChange={(e) => updateField('from.name', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={invoice.from.email}
            onChange={(e) => updateField('from.email', e.target.value)}
          />
          <TextArea
            label="Address"
            placeholder="Street address, city, state, zip"
            value={invoice.from.address}
            onChange={(e) => updateField('from.address', e.target.value)}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Logo</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {invoice.from.logo ? (
                <div className="relative group">
                  <img
                    src={invoice.from.logo}
                    alt="Logo"
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-white/10"
                  />
                  <button
                    onClick={() => updateField('from.logo', null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                </div>
              ) : null}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="px-3 py-2 bg-dark-200 border border-white/5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:border-primary/30 transition-all"
              >
                {invoice.from.logo ? 'Change Logo' : 'Upload Logo'}
              </button>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Bill To (Client)"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        >
          <Input
            label="Client Name"
            placeholder="Client or company name"
            value={invoice.to.name}
            onChange={(e) => updateField('to.name', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="client@email.com"
            value={invoice.to.email}
            onChange={(e) => updateField('to.email', e.target.value)}
          />
          <TextArea
            label="Address"
            placeholder="Client address"
            value={invoice.to.address}
            onChange={(e) => updateField('to.address', e.target.value)}
          />
        </FormSection>
      </div>

      {/* Line Items */}
      <FormSection
        title="Line Items"
        icon={
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        }
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 text-[10px] text-gray-500 font-medium uppercase tracking-wider px-1">
            <span>Description</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Amount</span>
            <span></span>
          </div>

          {invoice.items.map((item, index) => {
            const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
            return (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_100px_36px] gap-2 items-center fade-in"
              >
                <input
                  className="w-full bg-dark-200 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary/40 transition-all"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                />
                <input
                  className="w-full bg-dark-200 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 text-center focus:outline-none focus:border-primary/40 transition-all"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                />
                <input
                  className="w-full bg-dark-200 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 text-right focus:outline-none focus:border-primary/40 transition-all"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.rate}
                  onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                />
                <div className="bg-dark-300 rounded-lg px-3 py-2 text-sm text-gray-400 text-right font-mono">
                  {amount.toFixed(2)}
                </div>
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors self-center justify-self-center"
                  title="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })}

          <button
            onClick={addLineItem}
            className="w-full py-2.5 border border-dashed border-white/10 rounded-lg text-xs text-gray-500 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Line Item
          </button>
        </div>
      </FormSection>

      {/* Tax & Discount */}
      <FormSection
        title="Tax & Discount"
        icon={
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Tax Rate (%)"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0"
            value={invoice.taxRate}
            onChange={(e) => updateField('taxRate', e.target.value)}
          />
          <Select
            label="Discount Type"
            options={[
              { value: 'percent', label: 'Percentage (%)' },
              { value: 'fixed', label: 'Fixed Amount' },
            ]}
            value={invoice.discountType}
            onChange={(e) => updateField('discountType', e.target.value)}
          />
          <Input
            label={invoice.discountType === 'percent' ? 'Discount (%)' : 'Discount Amount'}
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={invoice.discountValue}
            onChange={(e) => updateField('discountValue', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Notes & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSection
          title="Notes / Terms"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        >
          <TextArea
            placeholder="Payment terms, late fees, notes to client..."
            value={invoice.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </FormSection>

        <FormSection
          title="Payment Methods"
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        >
          <TextArea
            placeholder="Bank transfer details, PayPal, Wise, etc..."
            value={invoice.paymentMethods}
            onChange={(e) => updateField('paymentMethods', e.target.value)}
          />
        </FormSection>
      </div>
    </div>
  )
}
