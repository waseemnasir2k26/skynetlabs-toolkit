import React from 'react'
import { formatDate, formatCurrency, calculateInvoiceTotals, STATUSES } from '../utils/constants'

export default function MinimalTemplate({ invoice }) {
  const { subtotal, taxAmount, discountAmount, total } = calculateInvoiceTotals(invoice)
  const status = STATUSES.find(s => s.value === invoice.status) || STATUSES[0]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a2e', fontSize: '12px', lineHeight: '1.6' }}>
      {/* Minimal Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {invoice.from.logo && (
              <img
                src={invoice.from.logo}
                alt="Logo"
                style={{ maxHeight: '36px', maxWidth: '120px', objectFit: 'contain' }}
              />
            )}
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{invoice.from.name || 'Your Business'}</span>
          </div>
          <span style={{ fontSize: '11px', color: status.color, fontWeight: '500' }}>{status.label}</span>
        </div>

        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '24px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '200', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Invoice</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{invoice.invoiceNumber}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
            <p>{formatDate(invoice.invoiceDate)}</p>
            <p style={{ color: '#9ca3af' }}>Due {formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Addresses - minimal style */}
      <div style={{ display: 'flex', gap: '48px', marginBottom: '40px', fontSize: '11px' }}>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '4px', fontSize: '10px' }}>From</p>
          {invoice.from.email && <p style={{ color: '#6b7280' }}>{invoice.from.email}</p>}
          {invoice.from.address && <p style={{ color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.from.address}</p>}
        </div>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '4px', fontSize: '10px' }}>To</p>
          <p style={{ fontWeight: '500', color: '#111827' }}>{invoice.to.name || 'Client Name'}</p>
          {invoice.to.email && <p style={{ color: '#6b7280' }}>{invoice.to.email}</p>}
          {invoice.to.address && <p style={{ color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.to.address}</p>}
        </div>
      </div>

      {/* Items - minimal table */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 50px 80px 80px',
          padding: '0 0 8px 0',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '10px',
          color: '#9ca3af',
          fontWeight: '500',
        }}>
          <span>Item</span>
          <span style={{ textAlign: 'center' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Rate</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </div>
        {invoice.items.map((item) => {
          const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
          return (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 50px 80px 80px',
                padding: '12px 0',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#374151' }}>{item.description || 'Item'}</span>
              <span style={{ textAlign: 'center', color: '#9ca3af' }}>{item.quantity}</span>
              <span style={{ textAlign: 'right', color: '#9ca3af' }}>{formatCurrency(item.rate, invoice.currency)}</span>
              <span style={{ textAlign: 'right', color: '#111827' }}>{formatCurrency(amount, invoice.currency)}</span>
            </div>
          )
        })}
      </div>

      {/* Totals - minimal */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ width: '200px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#9ca3af' }}>
            <span>Subtotal</span>
            <span style={{ color: '#6b7280' }}>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {parseFloat(invoice.taxRate) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#9ca3af' }}>
              <span>Tax</span>
              <span style={{ color: '#6b7280' }}>{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>
          )}
          {parseFloat(invoice.discountValue) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#9ca3af' }}>
              <span>Discount</span>
              <span style={{ color: '#ef4444' }}>-{formatCurrency(discountAmount, invoice.currency)}</span>
            </div>
          )}
          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '18px', fontWeight: '300', color: '#111827' }}>
            <span>Total</span>
            <span>{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {(invoice.notes || invoice.paymentMethods) && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', display: 'flex', gap: '32px' }}>
          {invoice.notes && (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>Notes</p>
              <p style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.notes}</p>
            </div>
          )}
          {invoice.paymentMethods && (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>Payment</p>
              <p style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.paymentMethods}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
