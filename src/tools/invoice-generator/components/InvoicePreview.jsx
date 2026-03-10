import React from 'react'
import ModernTemplate from '../templates/ModernTemplate'
import ClassicTemplate from '../templates/ClassicTemplate'
import MinimalTemplate from '../templates/MinimalTemplate'

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
}

export default function InvoicePreview({ invoice }) {
  const TemplateComponent = TEMPLATE_MAP[invoice.template] || ModernTemplate

  return (
    <div className="sticky top-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">Live Preview</h3>
        <span className="text-[10px] text-gray-600 bg-dark-300 px-2 py-1 rounded-md capitalize">
          {invoice.template} template
        </span>
      </div>
      <div
        className="bg-white rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}
      >
        <div
          id="invoice-preview"
          style={{
            padding: '40px',
            backgroundColor: '#ffffff',
            minHeight: '600px',
            width: '100%',
          }}
        >
          <TemplateComponent invoice={invoice} />
        </div>
      </div>
    </div>
  )
}
