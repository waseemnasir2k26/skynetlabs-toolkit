import React from 'react'
import { formatDate, formatCurrency, calculateInvoiceTotals, STATUSES } from '../utils/constants'

export default function ModernTemplate({ invoice }) {
  const { subtotal, taxAmount, discountAmount, total } = calculateInvoiceTotals(invoice)
  const status = STATUSES.find(s => s.value === invoice.status) || STATUSES[0]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a2e', fontSize: '12px', lineHeight: '1.5' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          {invoice.from.logo && (
            <img
              src={invoice.from.logo}
              alt="Logo"
              style={{ maxHeight: '48px', maxWidth: '140px', objectFit: 'contain', marginBottom: '8px' }}
            />
          )}
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0a0a0f', letterSpacing: '-0.5px', margin: 0 }}>
            INVOICE
          </h1>
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            #{invoice.invoiceNumber}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: status.color + '18',
              color: status.color,
              border: `1px solid ${status.color}30`,
            }}
          >
            {status.label}
          </span>
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7280' }}>
            <p>Date: <strong style={{ color: '#374151' }}>{formatDate(invoice.invoiceDate)}</strong></p>
            <p>Due: <strong style={{ color: '#374151' }}>{formatDate(invoice.dueDate)}</strong></p>
          </div>
        </div>
      </div>

      {/* From / To */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#13b973', marginBottom: '8px' }}>From</p>
          <p style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{invoice.from.name || 'Your Business Name'}</p>
          {invoice.from.email && <p style={{ color: '#6b7280', fontSize: '11px' }}>{invoice.from.email}</p>}
          {invoice.from.address && (
            <p style={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'pre-line', marginTop: '4px' }}>{invoice.from.address}</p>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#13b973', marginBottom: '8px' }}>Bill To</p>
          <p style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{invoice.to.name || 'Client Name'}</p>
          {invoice.to.email && <p style={{ color: '#6b7280', fontSize: '11px' }}>{invoice.to.email}</p>}
          {invoice.to.address && (
            <p style={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'pre-line', marginTop: '4px' }}>{invoice.to.address}</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 60px 90px 90px',
          gap: '0',
          backgroundColor: '#0a0a0f',
          padding: '10px 16px',
          borderRadius: '8px 8px 0 0',
          fontSize: '9px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#ffffff',
        }}>
          <span>Description</span>
          <span style={{ textAlign: 'center' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Rate</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </div>
        {invoice.items.map((item, i) => {
          const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
          return (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 60px 90px 90px',
                gap: '0',
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#374151' }}>{item.description || 'Item description'}</span>
              <span style={{ textAlign: 'center', color: '#6b7280' }}>{item.quantity}</span>
              <span style={{ textAlign: 'right', color: '#6b7280' }}>{formatCurrency(item.rate, invoice.currency)}</span>
              <span style={{ textAlign: 'right', fontWeight: '500', color: '#111827' }}>{formatCurrency(amount, invoice.currency)}</span>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#6b7280' }}>
            <span>Subtotal</span>
            <span style={{ color: '#374151' }}>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {parseFloat(invoice.taxRate) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#6b7280' }}>
              <span>Tax ({invoice.taxRate}%)</span>
              <span style={{ color: '#374151' }}>{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>
          )}
          {parseFloat(invoice.discountValue) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#6b7280' }}>
              <span>Discount {invoice.discountType === 'percent' ? `(${invoice.discountValue}%)` : ''}</span>
              <span style={{ color: '#ef4444' }}>-{formatCurrency(discountAmount, invoice.currency)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            marginTop: '8px',
            borderTop: '2px solid #0a0a0f',
            fontSize: '16px',
            fontWeight: '700',
            color: '#0a0a0f',
          }}>
            <span>Total</span>
            <span>{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Payment */}
      <div style={{ display: 'flex', gap: '32px' }}>
        {invoice.notes && (
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#13b973', marginBottom: '6px' }}>Notes / Terms</p>
            <p style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.notes}</p>
          </div>
        )}
        {invoice.paymentMethods && (
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#13b973', marginBottom: '6px' }}>Payment Methods</p>
            <p style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.paymentMethods}</p>
          </div>
        )}
      </div>
    </div>
  )
}
