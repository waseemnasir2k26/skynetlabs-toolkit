import React, { useState, useRef, useCallback } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'

const BLOCK_TYPES = [
  { type: 'executive-summary', label: 'Executive Summary', icon: '&#128196;' },
  { type: 'key-metrics', label: 'Key Metrics', icon: '&#128200;' },
  { type: 'completed-work', label: 'Completed Work', icon: '&#9989;' },
  { type: 'highlights', label: 'Highlights & Wins', icon: '&#127942;' },
  { type: 'challenges', label: 'Challenges & Solutions', icon: '&#9888;' },
  { type: 'next-plan', label: 'Next Period Plan', icon: '&#128197;' },
  { type: 'custom', label: 'Custom Section', icon: '&#9998;' }
]

function createBlock(type) {
  const base = { id: crypto.randomUUID(), type }
  switch (type) {
    case 'executive-summary': return { ...base, content: '' }
    case 'key-metrics': return { ...base, metrics: [{ label: '', value: '', trend: 'up' }] }
    case 'completed-work': return { ...base, items: [{ text: '', done: true }] }
    case 'highlights': return { ...base, items: [''] }
    case 'challenges': return { ...base, items: [{ challenge: '', solution: '' }] }
    case 'next-plan': return { ...base, items: [{ task: '', done: false }] }
    case 'custom': return { ...base, heading: '', content: '' }
    default: return base
  }
}

function SortableBlock({ block, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  const typeInfo = BLOCK_TYPES.find(b => b.type === block.type) || { label: block.type, icon: '' }
  const inputClass = 'w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors'

  return (
    <div ref={setNodeRef} style={style} className="bg-dark-100/50 border border-white/5 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1" title="Drag to reorder">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
          </button>
          <span className="text-sm" dangerouslySetInnerHTML={{ __html: typeInfo.icon }} />
          <span className="text-white font-medium text-sm">{typeInfo.label}</span>
        </div>
        <button onClick={() => onDelete(block.id)} className="text-gray-500 hover:text-red-400 transition-colors text-sm">Remove</button>
      </div>

      {block.type === 'executive-summary' && (
        <textarea className={inputClass + ' min-h-[80px]'} value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })} placeholder="Write your executive summary..." />
      )}

      {block.type === 'key-metrics' && (
        <div className="space-y-2">
          {(block.metrics || []).map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={inputClass + ' flex-1'} value={m.label} onChange={e => { const arr = [...block.metrics]; arr[i] = { ...arr[i], label: e.target.value }; onUpdate(block.id, { metrics: arr }) }} placeholder="Metric label" />
              <input className={inputClass + ' w-24'} value={m.value} onChange={e => { const arr = [...block.metrics]; arr[i] = { ...arr[i], value: e.target.value }; onUpdate(block.id, { metrics: arr }) }} placeholder="Value" />
              <select className={inputClass + ' w-20'} value={m.trend} onChange={e => { const arr = [...block.metrics]; arr[i] = { ...arr[i], trend: e.target.value }; onUpdate(block.id, { metrics: arr }) }}>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="flat">Flat</option>
              </select>
              <button onClick={() => { const arr = block.metrics.filter((_, j) => j !== i); onUpdate(block.id, { metrics: arr }) }} className="text-gray-500 hover:text-red-400 text-lg">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate(block.id, { metrics: [...(block.metrics || []), { label: '', value: '', trend: 'up' }] })} className="text-primary text-sm hover:text-primary-light">+ Add Metric</button>
        </div>
      )}

      {block.type === 'completed-work' && (
        <div className="space-y-2">
          {(block.items || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="checkbox" checked={item.done} onChange={e => { const arr = [...block.items]; arr[i] = { ...arr[i], done: e.target.checked }; onUpdate(block.id, { items: arr }) }} className="accent-primary" />
              <input className={inputClass + ' flex-1'} value={item.text} onChange={e => { const arr = [...block.items]; arr[i] = { ...arr[i], text: e.target.value }; onUpdate(block.id, { items: arr }) }} placeholder="Completed task..." />
              <button onClick={() => { const arr = block.items.filter((_, j) => j !== i); onUpdate(block.id, { items: arr }) }} className="text-gray-500 hover:text-red-400 text-lg">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate(block.id, { items: [...(block.items || []), { text: '', done: true }] })} className="text-primary text-sm hover:text-primary-light">+ Add Item</button>
        </div>
      )}

      {block.type === 'highlights' && (
        <div className="space-y-2">
          {(block.items || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-primary">&#8226;</span>
              <input className={inputClass + ' flex-1'} value={item} onChange={e => { const arr = [...block.items]; arr[i] = e.target.value; onUpdate(block.id, { items: arr }) }} placeholder="Highlight or win..." />
              <button onClick={() => { const arr = block.items.filter((_, j) => j !== i); onUpdate(block.id, { items: arr }) }} className="text-gray-500 hover:text-red-400 text-lg">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate(block.id, { items: [...(block.items || []), ''] })} className="text-primary text-sm hover:text-primary-light">+ Add Bullet</button>
        </div>
      )}

      {block.type === 'challenges' && (
        <div className="space-y-3">
          {(block.items || []).map((item, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1 space-y-1">
                <input className={inputClass} value={item.challenge} onChange={e => { const arr = [...block.items]; arr[i] = { ...arr[i], challenge: e.target.value }; onUpdate(block.id, { items: arr }) }} placeholder="Challenge..." />
                <input className={inputClass} value={item.solution} onChange={e => { const arr = [...block.items]; arr[i] = { ...arr[i], solution: e.target.value }; onUpdate(block.id, { items: arr }) }} placeholder="Solution..." />
              </div>
              <button onClick={() => { const arr = block.items.filter((_, j) => j !== i); onUpdate(block.id, { items: arr }) }} className="text-gray-500 hover:text-red-400 text-lg self-center">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate(block.id, { items: [...(block.items || []), { challenge: '', solution: '' }] })} className="text-primary text-sm hover:text-primary-light">+ Add Challenge</button>
        </div>
      )}

      {block.type === 'next-plan' && (
        <div className="space-y-2">
          {(block.items || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="checkbox" checked={item.done} onChange={e => { const arr = [...block.items]; arr[i] = { ...arr[i], done: e.target.checked }; onUpdate(block.id, { items: arr }) }} className="accent-primary" />
              <input className={inputClass + ' flex-1'} value={item.task} onChange={e => { const arr = [...block.items]; arr[i] = { ...arr[i], task: e.target.value }; onUpdate(block.id, { items: arr }) }} placeholder="Planned task..." />
              <button onClick={() => { const arr = block.items.filter((_, j) => j !== i); onUpdate(block.id, { items: arr }) }} className="text-gray-500 hover:text-red-400 text-lg">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate(block.id, { items: [...(block.items || []), { task: '', done: false }] })} className="text-primary text-sm hover:text-primary-light">+ Add Task</button>
        </div>
      )}

      {block.type === 'custom' && (
        <div className="space-y-2">
          <input className={inputClass} value={block.heading} onChange={e => onUpdate(block.id, { heading: e.target.value })} placeholder="Section heading..." />
          <textarea className={inputClass + ' min-h-[60px]'} value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })} placeholder="Section content..." />
        </div>
      )}
    </div>
  )
}

function PreviewBlock({ block }) {
  const typeInfo = BLOCK_TYPES.find(b => b.type === block.type)
  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold text-base mb-2 flex items-center gap-2">
        <span dangerouslySetInnerHTML={{ __html: typeInfo?.icon || '' }} />
        {block.type === 'custom' ? (block.heading || 'Custom Section') : typeInfo?.label}
      </h3>

      {block.type === 'executive-summary' && (
        <p className="text-gray-300 text-sm whitespace-pre-wrap">{block.content || 'No content yet.'}</p>
      )}

      {block.type === 'key-metrics' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(block.metrics || []).map((m, i) => (
            <div key={i} className="bg-dark-200/50 rounded-lg p-3 text-center border border-white/5">
              <p className="text-gray-400 text-xs">{m.label || 'Metric'}</p>
              <p className="text-white text-xl font-bold mt-1">{m.value || '0'}</p>
              <span className={`text-xs ${m.trend === 'up' ? 'text-green-400' : m.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                {m.trend === 'up' ? '&#9650; Up' : m.trend === 'down' ? '&#9660; Down' : '&#8212; Flat'}
              </span>
            </div>
          ))}
        </div>
      )}

      {block.type === 'completed-work' && (
        <ul className="space-y-1">
          {(block.items || []).map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={item.done ? 'text-green-400' : 'text-gray-500'}>{item.done ? '&#9745;' : '&#9744;'}</span>
              <span className="text-gray-300">{item.text || 'Task'}</span>
            </li>
          ))}
        </ul>
      )}

      {block.type === 'highlights' && (
        <ul className="space-y-1">
          {(block.items || []).map((item, i) => (
            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
              <span className="text-primary mt-0.5">&#8226;</span>
              <span>{item || 'Highlight'}</span>
            </li>
          ))}
        </ul>
      )}

      {block.type === 'challenges' && (
        <div className="space-y-2">
          {(block.items || []).map((item, i) => (
            <div key={i} className="text-sm">
              <p className="text-red-400">Challenge: {item.challenge || 'N/A'}</p>
              <p className="text-green-400">Solution: {item.solution || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      {block.type === 'next-plan' && (
        <ul className="space-y-1">
          {(block.items || []).map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={item.done ? 'text-green-400' : 'text-gray-500'}>{item.done ? '&#9745;' : '&#9744;'}</span>
              <span className="text-gray-300">{item.task || 'Task'}</span>
            </li>
          ))}
        </ul>
      )}

      {block.type === 'custom' && (
        <p className="text-gray-300 text-sm whitespace-pre-wrap">{block.content || 'No content.'}</p>
      )}
    </div>
  )
}

export default function App() {
  const [templates, setTemplates] = useLocalStorage('skynet-report-templates', [])
  const [setup, setSetup] = useState({ clientName: '', period: 'month', startDate: '', endDate: '', agencyName: '', logo: '' })
  const [sections, setSections] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSetup(p => ({ ...p, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const addSection = (type) => {
    setSections(prev => [...prev, createBlock(type)])
  }

  const updateBlock = useCallback((id, updates) => {
    setSections(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const deleteBlock = useCallback((id) => {
    setSections(prev => prev.filter(b => b.id !== id))
  }, [])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id)
      const newIndex = prev.findIndex(s => s.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const saveTemplate = () => {
    if (!templateName.trim()) return
    const tpl = { id: crypto.randomUUID(), name: templateName.trim(), setup, sections, createdAt: new Date().toISOString() }
    setTemplates(prev => [tpl, ...prev])
    setTemplateName('')
  }

  const loadTemplate = (tpl) => {
    setSetup(tpl.setup)
    setSections(tpl.sections.map(s => ({ ...s, id: crypto.randomUUID() })))
  }

  const deleteTemplate = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const exportPDF = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false
      })
      const imgData = canvas.toDataURL('image/png')
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let y = 10
      let remainingHeight = imgHeight

      if (imgHeight <= pageHeight - 20) {
        doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      } else {
        while (remainingHeight > 0) {
          const sliceHeight = Math.min(remainingHeight, pageHeight - 20)
          doc.addImage(imgData, 'PNG', 10, y - (imgHeight - remainingHeight), imgWidth, imgHeight)
          remainingHeight -= (pageHeight - 20)
          if (remainingHeight > 0) {
            doc.addPage()
            y = 10
          }
        }
      }

      doc.save(`${setup.clientName || 'client'}-report.pdf`)
    } catch (err) {
      console.error('Export failed:', err)
      alert('PDF export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const inputClass = 'w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors'
  const btnPrimary = 'px-4 py-2 bg-primary hover:bg-primary-light text-black font-medium rounded-lg transition-colors text-sm'
  const btnSecondary = 'px-4 py-2 bg-dark-200/50 hover:bg-dark-200 text-gray-300 hover:text-white border border-white/10 rounded-lg transition-colors text-sm'

  return (
    <ToolLayout
      title="White-Label Client Report Builder"
      description="Create professional client reports with drag-and-drop sections. Save templates and export branded PDFs."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Builder */}
        <div className="space-y-4">
          {/* Report Setup */}
          <ResultCard title="Report Setup" icon="&#9881;">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Client Name</label>
                  <input className={inputClass} value={setup.clientName} onChange={e => setSetup(p => ({ ...p, clientName: e.target.value }))} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Agency Name</label>
                  <input className={inputClass} value={setup.agencyName} onChange={e => setSetup(p => ({ ...p, agencyName: e.target.value }))} placeholder="Your Agency" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Period</label>
                  <select className={inputClass} value={setup.period} onChange={e => setSetup(p => ({ ...p, period: e.target.value }))}>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {setup.period === 'custom' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Start</label>
                      <input type="date" className={inputClass} value={setup.startDate} onChange={e => setSetup(p => ({ ...p, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">End</label>
                      <input type="date" className={inputClass} value={setup.endDate} onChange={e => setSetup(p => ({ ...p, endDate: e.target.value }))} />
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-gray-400 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-dark-200 file:text-gray-300 file:text-sm file:cursor-pointer" />
                {setup.logo && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={setup.logo} alt="Logo" className="h-8 object-contain" />
                    <button onClick={() => setSetup(p => ({ ...p, logo: '' }))} className="text-gray-500 hover:text-red-400 text-xs">Remove</button>
                  </div>
                )}
              </div>
            </div>
          </ResultCard>

          {/* Add Sections */}
          <ResultCard title="Add Sections" icon="&#10010;">
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map(bt => (
                <button key={bt.type} onClick={() => addSection(bt.type)} className={btnSecondary + ' text-xs'}>
                  <span dangerouslySetInnerHTML={{ __html: bt.icon }} /> {bt.label}
                </button>
              ))}
            </div>
          </ResultCard>

          {/* Section Builder with DnD */}
          {sections.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Report Sections ({sections.length})</h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map(block => (
                    <SortableBlock key={block.id} block={block} onUpdate={updateBlock} onDelete={deleteBlock} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Templates */}
          <ResultCard title="Templates" icon="&#128190;">
            <div className="flex gap-2 mb-3">
              <input className={inputClass + ' flex-1'} value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name..." />
              <button onClick={saveTemplate} disabled={!templateName.trim()} className={btnPrimary + ' disabled:opacity-50'}>Save</button>
            </div>
            {templates.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {templates.map(tpl => (
                  <div key={tpl.id} className="flex items-center justify-between bg-dark-200/30 rounded-lg px-3 py-2">
                    <span className="text-gray-300 text-sm truncate">{tpl.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => loadTemplate(tpl)} className="text-primary text-xs hover:text-primary-light">Load</button>
                      <button onClick={() => deleteTemplate(tpl.id)} className="text-gray-500 text-xs hover:text-red-400">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ResultCard>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setShowPreview(!showPreview)} className={btnSecondary}>{showPreview ? 'Hide Preview' : 'Show Preview'}</button>
            <button onClick={exportPDF} disabled={exporting || sections.length === 0} className={btnPrimary + ' disabled:opacity-50'}>
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-4">
            <h3 className="text-white font-semibold mb-3">Live Preview</h3>
            <div ref={previewRef} className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  {setup.logo && <img src={setup.logo} alt="Logo" className="h-10 object-contain mb-2" />}
                  <h2 className="text-white text-xl font-bold">{setup.agencyName || 'Agency Report'}</h2>
                  <p className="text-gray-400 text-sm">Prepared for: {setup.clientName || 'Client'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {setup.period === 'custom' ? `${setup.startDate} to ${setup.endDate}` : `${setup.period === 'week' ? 'Weekly' : 'Monthly'} Report`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Sections */}
              {sections.length === 0 ? (
                <p className="text-gray-500 text-center py-12 text-sm">Add sections to build your report</p>
              ) : (
                sections.map(block => <PreviewBlock key={block.id} block={block} />)
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-white/10 text-center">
                <p className="text-gray-500 text-xs">{setup.agencyName || 'Your Agency'} &middot; Confidential</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
