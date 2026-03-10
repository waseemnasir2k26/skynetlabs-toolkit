export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]

export const STATUSES = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'sent', label: 'Sent', color: '#3b82f6' },
  { value: 'paid', label: 'Paid', color: '#13b973' },
  { value: 'overdue', label: 'Overdue', color: '#ef4444' },
]

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
  { id: 'classic', name: 'Classic', description: 'Traditional professional layout' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
]

export function generateInvoiceNumber() {
  const prefix = 'INV'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp.slice(-4)}${random}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatCurrency(amount, currencyCode) {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  const num = parseFloat(amount) || 0
  return `${currency.symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function createEmptyLineItem() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36),
    description: '',
    quantity: 1,
    rate: 0,
  }
}

export function createEmptyInvoice() {
  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + 30)

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36),
    invoiceNumber: generateInvoiceNumber(),
    status: 'draft',
    template: 'modern',
    currency: 'USD',
    invoiceDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    from: {
      name: '',
      email: '',
      address: '',
      logo: null,
    },
    to: {
      name: '',
      email: '',
      address: '',
    },
    items: [createEmptyLineItem()],
    taxRate: 0,
    discountType: 'percent',
    discountValue: 0,
    notes: '',
    paymentMethods: '',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  }
}

export function calculateInvoiceTotals(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
  }, 0)

  const taxAmount = subtotal * ((parseFloat(invoice.taxRate) || 0) / 100)

  let discountAmount = 0
  if (invoice.discountType === 'percent') {
    discountAmount = subtotal * ((parseFloat(invoice.discountValue) || 0) / 100)
  } else {
    discountAmount = parseFloat(invoice.discountValue) || 0
  }

  const total = subtotal + taxAmount - discountAmount

  return { subtotal, taxAmount, discountAmount, total }
}
