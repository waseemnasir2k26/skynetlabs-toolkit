const STORAGE_KEY = 'skynet-invoices'

export function loadInvoices() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveInvoice(invoice) {
  const invoices = loadInvoices()
  const index = invoices.findIndex(inv => inv.id === invoice.id)
  const updated = { ...invoice, updatedAt: new Date().toISOString() }

  if (index >= 0) {
    invoices[index] = updated
  } else {
    invoices.unshift(updated)
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  } catch (e) {
    console.error('Failed to save invoice to localStorage:', e)
  }
  return invoices
}

export function deleteInvoice(id) {
  const invoices = loadInvoices().filter(inv => inv.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  return invoices
}
