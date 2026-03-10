import { useState, useCallback, useEffect } from 'react'
import { createEmptyInvoice, createEmptyLineItem, generateInvoiceNumber } from '../utils/constants'
import { loadInvoices, saveInvoice as storageSave, deleteInvoice as storageDelete } from '../utils/storage'

export function useInvoice() {
  const [invoice, setInvoice] = useState(createEmptyInvoice)
  const [invoices, setInvoices] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setInvoices(loadInvoices())
  }, [])

  const updateField = useCallback((path, value) => {
    setInvoice(prev => {
      const parts = path.split('.')
      const updated = JSON.parse(JSON.stringify(prev))
      let obj = updated
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return updated
    })
    setHasUnsavedChanges(true)
  }, [])

  const addLineItem = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, createEmptyLineItem()],
    }))
    setHasUnsavedChanges(true)
  }, [])

  const removeLineItem = useCallback((id) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter(item => item.id !== id) : prev.items,
    }))
    setHasUnsavedChanges(true)
  }, [])

  const updateLineItem = useCallback((id, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
    setHasUnsavedChanges(true)
  }, [])

  const save = useCallback(() => {
    const updated = storageSave(invoice)
    setInvoices(updated)
    setHasUnsavedChanges(false)
  }, [invoice])

  const remove = useCallback((id) => {
    const updated = storageDelete(id)
    setInvoices(updated)
    if (invoice.id === id) {
      setInvoice(createEmptyInvoice())
      setHasUnsavedChanges(false)
    }
  }, [invoice.id])

  const loadExisting = useCallback((inv) => {
    setInvoice(JSON.parse(JSON.stringify(inv)))
    setHasUnsavedChanges(false)
  }, [])

  const duplicate = useCallback((inv) => {
    const dup = {
      ...JSON.parse(JSON.stringify(inv)),
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36),
      invoiceNumber: generateInvoiceNumber(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInvoice(dup)
    setHasUnsavedChanges(true)
  }, [])

  const createNew = useCallback(() => {
    setInvoice(createEmptyInvoice())
    setHasUnsavedChanges(false)
  }, [])

  return {
    invoice,
    invoices,
    hasUnsavedChanges,
    updateField,
    addLineItem,
    removeLineItem,
    updateLineItem,
    save,
    remove,
    loadExisting,
    duplicate,
    createNew,
  }
}
