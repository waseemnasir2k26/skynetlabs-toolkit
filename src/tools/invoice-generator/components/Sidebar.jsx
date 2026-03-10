import React from 'react'
import { STATUSES } from '../utils/constants'

export default function Sidebar({ invoices, currentId, onSelect, onDuplicate, onDelete, onNew, isOpen, onClose }) {
  const getStatusInfo = (status) => STATUSES.find(s => s.value === status) || STATUSES[0]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          w-72 glass-strong rounded-none lg:rounded-2xl
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-300">Invoice History</h3>
          <button
            onClick={onNew}
            className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {invoices.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-dark-300 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-xs">No saved invoices yet</p>
              <p className="text-gray-600 text-[11px] mt-1">Create and save your first invoice</p>
            </div>
          ) : (
            invoices.map((inv) => {
              const status = getStatusInfo(inv.status)
              const isActive = inv.id === currentId
              return (
                <div
                  key={inv.id}
                  className={`
                    p-3 rounded-xl cursor-pointer transition-all duration-200 group
                    ${isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-dark-300 border border-transparent'
                    }
                  `}
                  onClick={() => { onSelect(inv); onClose(); }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-gray-300">{inv.invoiceNumber}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: status.color + '20', color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {inv.to.name || 'No client name'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-600">
                      {new Date(inv.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(inv); onClose(); }}
                        className="p-1 rounded hover:bg-dark-400 text-gray-500 hover:text-gray-300 transition-colors"
                        title="Duplicate"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                        className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-3 border-t border-white/5">
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-600 hover:text-primary transition-colors block text-center"
          >
            Powered by Skynet Labs
          </a>
        </div>
      </aside>
    </>
  )
}
