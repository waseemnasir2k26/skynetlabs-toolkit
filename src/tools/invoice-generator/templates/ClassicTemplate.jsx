import React from 'react'
import { formatDate, formatCurrency, calculateInvoiceTotals, STATUSES } from '../utils/constants'

export default function ClassicTemplate({ invoice }) {
  const { subtotal, taxAmount, discountAmount, total } = calculateInvoiceTotals(invoice)
  const status = STATUSES.find(s => s.value === invoice.status) || STATUSES[0]

  return (
    <div style={{ fontFamily: "'Inter', serif", color: '#1a1a2e', fontSize: '12px', lineHeight: '1.6' }}>
      {/* Header with top border */}
      <div style={{ borderTop: '4px solid #13b973', paddingTop: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {invoice.from.logo && (
              <img
                src={invoice.from.logo}
                alt="Logo"
                style={{ maxHeight: '44px', maxWidth: '130px', objectFit: 'contain', marginBottom: '12px' }}
              />
            )}
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>{invoice.from.name || 'Your Business'}</p>
            {invoice.from.email && <p style={{ color: '#6b7280', fontSize: '11px' }}>{invoice.from.email}</p>}
            {invoice.from.address && <p style={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'pre-line' }}>{invoice.from.address}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#374151', letterSpacing: '4px', margin: 0, textTransform: 'uppercase' }}>
              Invoice
            </h1>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
      }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '8px' }}>Bill To</p>
          <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{invoice.to.name || 'Client Name'}</p>
          {invoice.to.email && <p style={{ color: '#6b7280', fontSize: '11px' }}>{invoice.to.email}</p>}
          {invoice.to.address && <p style={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'pre-line' }}>{invoice.to.address}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <table style={{ marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 12px 3px 0', color: '#9ca3af', fontWeight: '500' }}>Invoice #</td>
                <td style={{ padding: '3px 0', color: '#374151', fontWeight: '600' }}>{invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 12px 3px 0', color: '#9ca3af', fontWeight: '500' }}>Date</td>
                <td style={{ padding: '3px 0', color: '#374151' }}>{formatDate(invoice.invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 12px 3px 0', color: '#9ca3af', fontWeight: '500' }}>Due Date</td>
                <td style={{ padding: '3px 0', color: '#374151' }}>{formatDate(invoice.dueDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 12px 3px 0', color: '#9ca3af', fontWeight: '500' }}>Status</td>
                <td style={{ padding: '3px 0' }}>
                  <span style={{ color: status.color, fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>
                    {status.label}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111827' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', width: '60px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', width: '90px' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', width: '90px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => {
            const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px 8px', color: '#374151' }}>{item.description || 'Item description'}</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6b7280' }}>{item.quantity}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#6b7280' }}>{formatCurrency(item.rate, invoice.currency)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '500', color: '#111827' }}>{formatCurrency(amount, invoice.currency)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
            <span>Subtotal</span>
            <span style={{ color: '#374151' }}>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {parseFloat(invoice.taxRate) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
              <span>Tax ({invoice.taxRate}%)</span>
              <span style={{ color: '#374151' }}>{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>
          )}
          {parseFloat(invoice.discountValue) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
              <span>Discount {invoice.discountType === 'percent' ? `(${invoice.discountValue}%)` : ''}</span>
              <span style={{ color: '#ef4444' }}>-{formatCurrency(discountAmount, invoice.currency)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            marginTop: '4px',
            borderTop: '2px solid #13b973',
            borderBottom: '2px solid #13b973',
            fontSize: '15px',
            fontWeight: '700',
            color: '#111827',
          }}>
            <span>Total Due</span>
            <span>{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
        {invoice.notes && (
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '6px' }}>Notes & Terms</p>
            <p style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.notes}</p>
          </div>
        )}
        {invoice.paymentMethods && (
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '6px' }}>Payment Methods</p>
            <p style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'pre-line' }}>{invoice.paymentMethods}</p>
          </div>
        )}
      </div>
    </div>
  )
}
