import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import { useInvoice } from './hooks/useInvoice'
import { generatePDF } from './utils/pdf'

export default function App() {
  const {
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
  } = useInvoice()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      await generatePDF('invoice-preview', invoice.invoiceNumber)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }, [invoice.invoiceNumber])

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* Tool-specific sub-header */}
      <div className="border-b px-4 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>Invoice Generator</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0 p-3 pl-3">
          <Sidebar
            invoices={invoices}
            currentId={invoice.id}
            onSelect={loadExisting}
            onDuplicate={duplicate}
            onDelete={remove}
            onNew={createNew}
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar
            invoices={invoices}
            currentId={invoice.id}
            onSelect={loadExisting}
            onDuplicate={duplicate}
            onDelete={remove}
            onNew={createNew}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 lg:p-5">
          {/* Mobile Preview Toggle */}
          <div className="lg:hidden mb-4 flex gap-2">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={!showPreview
                ? { background: 'var(--accent)', color: 'var(--text-heading)' }
                : { background: 'var(--bg-card)', color: 'var(--text-muted)' }
              }
            >
              Edit Invoice
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={showPreview
                ? { background: 'var(--accent)', color: 'var(--text-heading)' }
                : { background: 'var(--bg-card)', color: 'var(--text-muted)' }
              }
            >
              Preview
            </button>
          </div>

          <div className="flex gap-5">
            {/* Form Panel */}
            <div className={`flex-1 min-w-0 ${showPreview ? 'hidden lg:block' : 'block'}`}>
              <InvoiceForm
                invoice={invoice}
                updateField={updateField}
                addLineItem={addLineItem}
                removeLineItem={removeLineItem}
                updateLineItem={updateLineItem}
                onSave={save}
                onDownload={handleDownload}
                downloading={downloading}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>

            {/* Preview Panel */}
            <div className={`lg:w-[480px] xl:w-[520px] flex-shrink-0 ${showPreview ? 'block w-full' : 'hidden lg:block'}`}>
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
