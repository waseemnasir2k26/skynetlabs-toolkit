import React, { useState, useMemo, useRef, useCallback } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ShareButton from '../shared/ShareButton'
import { useToast } from '../shared/Toast'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { generateId } from '../shared/utils'

const TIMELINE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '+1week', label: '+1 Week' },
  { value: '+2weeks', label: '+2 Weeks' },
  { value: '+1month', label: '+1 Month' },
  { value: 'custom', label: 'Custom' },
]

const PRIORITY_OPTIONS = [
  { value: 'nice', label: 'Nice to Have', colorVar: 'var(--text-muted)' },
  { value: 'important', label: 'Important', colorVar: 'var(--warning)' },
  { value: 'critical', label: 'Critical', colorVar: 'var(--danger)' },
]

const CR_STATUSES = [
  { value: 'draft', label: 'Draft', bg: 'var(--bg-elevated)', text: 'var(--text-muted)' },
  { value: 'sent', label: 'Sent', bg: 'var(--info-soft)', text: 'var(--info)' },
  { value: 'approved', label: 'Approved', bg: 'var(--success-soft)', text: 'var(--success)' },
  { value: 'rejected', label: 'Rejected', bg: 'var(--danger-soft)', text: 'var(--danger)' },
]

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{title}</h2>
          <button onClick={onClose} className="transition-colors text-2xl leading-none hover:opacity-80" style={{ color: 'var(--text-muted)' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function generateCRDocument(cr, project) {
  const date = new Date(cr.createdAt).toLocaleDateString()
  const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === cr.priority)?.label || cr.priority
  const timelineLabel = TIMELINE_OPTIONS.find((t) => t.value === cr.timelineImpact)?.label || cr.customTimeline || cr.timelineImpact

  return `SCOPE CHANGE REQUEST
${'='.repeat(50)}

Project: ${project?.name || 'Unknown'}
Request #: CR-${cr.id.slice(0, 6).toUpperCase()}
Date: ${date}
Status: ${cr.status.toUpperCase()}
Priority: ${priorityLabel}

DESCRIPTION
${'-'.repeat(30)}
${cr.description}

IMPACT ANALYSIS
${'-'.repeat(30)}
Additional Hours: ${cr.additionalHours}h
Hourly Rate: $${cr.hourlyRate}
Additional Cost: $${(cr.additionalHours * cr.hourlyRate).toLocaleString()}
Original Budget: $${project ? Number(project.budget).toLocaleString() : 'N/A'}
New Total: $${project ? (Number(project.budget) + cr.additionalHours * cr.hourlyRate).toLocaleString() : 'N/A'}
Budget Impact: ${project ? `+${((cr.additionalHours * cr.hourlyRate / Number(project.budget)) * 100).toFixed(1)}%` : 'N/A'}
Timeline Impact: ${timelineLabel}

${'='.repeat(50)}
Signature: ________________________  Date: ____________`
}

export default function App() {
  const [projects, setProjects] = useLocalStorage('skynet-scope-change-projects', [])
  const [changeRequests, setChangeRequests] = useLocalStorage('skynet-scope-change-requests', [])
  const [view, setView] = useState('projects') // projects | requests | new-cr | view-cr
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [viewCR, setViewCR] = useState(null)
  const crDocRef = useRef(null)
  const toast = useToast()

  // Project form
  const [projectForm, setProjectForm] = useState({ name: '', scopeSummary: '', budget: '', hourlyRate: '' })

  // CR form
  const [crForm, setCRForm] = useState({
    projectId: '',
    description: '',
    additionalHours: '',
    hourlyRate: '',
    timelineImpact: 'none',
    customTimeline: '',
    priority: 'important',
  })

  const updateProjectField = (field, val) => setProjectForm((f) => ({ ...f, [field]: val }))
  const updateCRField = (field, val) => setCRForm((f) => ({ ...f, [field]: val }))

  // When selecting a project for CR, auto-fill hourly rate
  const selectProjectForCR = (projectId) => {
    const proj = projects.find((p) => p.id === projectId)
    setCRForm((f) => ({ ...f, projectId, hourlyRate: proj?.hourlyRate || f.hourlyRate }))
  }

  const saveProject = () => {
    if (!projectForm.name.trim()) return
    if (editProject) {
      setProjects((prev) => prev.map((p) => p.id === editProject.id ? { ...editProject, ...projectForm } : p))
    } else {
      setProjects((prev) => [...prev, { ...projectForm, id: generateId(), createdAt: new Date().toISOString() }])
    }
    setProjectForm({ name: '', scopeSummary: '', budget: '', hourlyRate: '' })
    setEditProject(null)
    setShowProjectModal(false)
  }

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setChangeRequests((prev) => prev.filter((cr) => cr.projectId !== id))
  }

  const openEditProject = (proj) => {
    setEditProject(proj)
    setProjectForm({ name: proj.name, scopeSummary: proj.scopeSummary, budget: proj.budget, hourlyRate: proj.hourlyRate })
    setShowProjectModal(true)
  }

  const openNewProject = () => {
    setEditProject(null)
    setProjectForm({ name: '', scopeSummary: '', budget: '', hourlyRate: '' })
    setShowProjectModal(true)
  }

  const submitCR = () => {
    if (!crForm.projectId || !crForm.description.trim() || !crForm.additionalHours) return
    const cr = {
      ...crForm,
      id: generateId(),
      additionalHours: Number(crForm.additionalHours),
      hourlyRate: Number(crForm.hourlyRate),
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    setChangeRequests((prev) => [...prev, cr])
    setCRForm({ projectId: '', description: '', additionalHours: '', hourlyRate: '', timelineImpact: 'none', customTimeline: '', priority: 'important' })
    setView('requests')
  }

  const updateCRStatus = (crId, newStatus) => {
    setChangeRequests((prev) => prev.map((cr) => cr.id === crId ? { ...cr, status: newStatus } : cr))
  }

  const deleteCR = (crId) => {
    setChangeRequests((prev) => prev.filter((cr) => cr.id !== crId))
    if (viewCR?.id === crId) { setViewCR(null); setView('requests') }
  }

  const getProjectCRs = (projectId) => changeRequests.filter((cr) => cr.projectId === projectId)

  const getProjectById = (id) => projects.find((p) => p.id === id)

  // PDF export
  const exportPDF = useCallback(async () => {
    const root = document.documentElement
    const originalTheme = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'light')
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = crDocRef.current
      if (!el) return
      const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`change-request-${viewCR?.id?.slice(0, 6) || 'doc'}.pdf`)
      if (toast) toast('Change request exported as PDF!', 'success')
    } catch (err) {
      console.error('PDF export failed:', err)
      if (toast) toast('PDF export failed. Please try again.', 'error')
    } finally {
      root.setAttribute('data-theme', originalTheme || 'dark')
    }
  }, [viewCR])

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }
  const inputClass = "w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"

  // View: Projects
  if (view === 'projects') {
    return (
      <ToolLayout title="Scope Change Request System" description="Manage projects and track scope change requests with automated cost calculations.">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('projects')} className="px-4 py-2 text-sm rounded-xl" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Projects</button>
          <button onClick={() => setView('requests')} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Change Requests</button>
          <button onClick={() => { setCRForm((f) => ({ ...f, projectId: projects[0]?.id || '' })); if (projects[0]) selectProjectForCR(projects[0].id); setView('new-cr') }} className="ml-auto px-5 py-2 rounded-xl font-medium transition-colors text-sm hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
            + New Change Request
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Active Projects</h2>
          <button onClick={openNewProject} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>+ Add Project</button>
        </div>

        {projects.length === 0 ? (
          <ResultCard>
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No projects yet. Add a project to start tracking scope changes.</p>
          </ResultCard>
        ) : (
          <div className="space-y-4">
            {projects.map((proj) => {
              const crs = getProjectCRs(proj.id)
              const approvedExtra = crs.filter((cr) => cr.status === 'approved').reduce((s, cr) => s + cr.additionalHours * cr.hourlyRate, 0)
              return (
                <div key={proj.id} className="rounded-xl p-5 transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-heading)' }}>{proj.name}</h3>
                      {proj.scopeSummary && <p className="text-sm mb-2 max-w-2xl" style={{ color: 'var(--text-muted)' }}>{proj.scopeSummary}</p>}
                      <div className="flex items-center gap-4 text-sm">
                        <span style={{ color: 'var(--text-muted)' }}>Budget: <span style={{ color: 'var(--accent)' }} className="font-medium">${Number(proj.budget).toLocaleString()}</span></span>
                        <span style={{ color: 'var(--text-muted)' }}>Rate: <span style={{ color: 'var(--text-body)' }}>${proj.hourlyRate}/hr</span></span>
                        <span style={{ color: 'var(--text-muted)' }}>CRs: <span style={{ color: 'var(--text-body)' }}>{crs.length}</span></span>
                        {approvedExtra > 0 && <span style={{ color: 'var(--warning)' }}>+${approvedExtra.toLocaleString()} approved</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditProject(proj)} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Edit</button>
                      <button onClick={() => deleteProject(proj.id)} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Project Modal */}
        <Modal open={showProjectModal} onClose={() => setShowProjectModal(false)} title={editProject ? 'Edit Project' : 'Add Project'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Project Name *</label>
              <input type="text" value={projectForm.name} onChange={(e) => updateProjectField('name', e.target.value)} className={inputClass} style={inputStyle} placeholder="Website Redesign" />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Original Scope Summary</label>
              <textarea value={projectForm.scopeSummary} onChange={(e) => updateProjectField('scopeSummary', e.target.value)} rows={3} className={`${inputClass} resize-none`} style={inputStyle} placeholder="Describe the original project scope..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Budget ($)</label>
                <input type="number" value={projectForm.budget} onChange={(e) => updateProjectField('budget', e.target.value)} className={inputClass} style={inputStyle} placeholder="10000" />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Hourly Rate ($)</label>
                <input type="number" value={projectForm.hourlyRate} onChange={(e) => updateProjectField('hourlyRate', e.target.value)} className={inputClass} style={inputStyle} placeholder="150" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowProjectModal(false)} className="px-4 py-2 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              <button onClick={saveProject} className="px-6 py-2.5 rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>{editProject ? 'Update' : 'Add Project'}</button>
            </div>
          </div>
        </Modal>
      </ToolLayout>
    )
  }

  // View: New Change Request
  if (view === 'new-cr') {
    const selectedProject = getProjectById(crForm.projectId)
    const additionalCost = (Number(crForm.additionalHours) || 0) * (Number(crForm.hourlyRate) || 0)
    const newTotal = selectedProject ? Number(selectedProject.budget) + additionalCost : additionalCost
    const overPercent = selectedProject && Number(selectedProject.budget) > 0 ? ((additionalCost / Number(selectedProject.budget)) * 100).toFixed(1) : 0

    return (
      <ToolLayout title="Scope Change Request System" description="Create a new change request.">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('projects')} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Projects</button>
          <button onClick={() => setView('requests')} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Change Requests</button>
        </div>

        <div className="max-w-2xl mx-auto">
          <ResultCard title="New Change Request" icon="\uD83D\uDCDD">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Select Project *</label>
                <select value={crForm.projectId} onChange={(e) => selectProjectForCR(e.target.value)} className={inputClass} style={inputStyle}>
                  <option value="">-- Select a project --</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Change Description *</label>
                <textarea value={crForm.description} onChange={(e) => updateCRField('description', e.target.value)} rows={4} className={`${inputClass} resize-none`} style={inputStyle} placeholder="Describe the scope change in detail..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Additional Hours *</label>
                  <input type="number" value={crForm.additionalHours} onChange={(e) => updateCRField('additionalHours', e.target.value)} className={inputClass} style={inputStyle} placeholder="20" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Hourly Rate ($)</label>
                  <input type="number" value={crForm.hourlyRate} onChange={(e) => updateCRField('hourlyRate', e.target.value)} className={inputClass} style={inputStyle} placeholder="150" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Timeline Impact</label>
                  <select value={crForm.timelineImpact} onChange={(e) => updateCRField('timelineImpact', e.target.value)} className={inputClass} style={inputStyle}>
                    {TIMELINE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {crForm.timelineImpact === 'custom' && (
                    <input type="text" value={crForm.customTimeline} onChange={(e) => updateCRField('customTimeline', e.target.value)} className={`${inputClass} mt-2`} style={inputStyle} placeholder="e.g., +3 weeks" />
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Priority</label>
                  <select value={crForm.priority} onChange={(e) => updateCRField('priority', e.target.value)} className={inputClass} style={inputStyle}>
                    {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Cost Summary */}
              {(Number(crForm.additionalHours) > 0 && Number(crForm.hourlyRate) > 0) && (
                <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <h4 className="font-medium mb-3" style={{ color: 'var(--text-heading)' }}>Cost Impact</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Additional Cost</p>
                      <p className="font-bold" style={{ color: 'var(--accent)' }}>${additionalCost.toLocaleString()}</p>
                    </div>
                    {selectedProject && (
                      <>
                        <div>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Original Budget</p>
                          <p className="font-bold" style={{ color: 'var(--text-body)' }}>${Number(selectedProject.budget).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>New Total</p>
                          <p className="font-bold" style={{ color: 'var(--text-heading)' }}>${newTotal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Over Budget</p>
                          <p className="font-bold" style={{ color: Number(overPercent) > 20 ? 'var(--danger)' : Number(overPercent) > 10 ? 'var(--warning)' : 'var(--accent)' }}>+{overPercent}%</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setView('projects')} className="px-4 py-2 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                <button onClick={submitCR} disabled={!crForm.projectId || !crForm.description.trim() || !crForm.additionalHours} className="px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
                  Create Change Request
                </button>
              </div>
            </div>
          </ResultCard>
        </div>
      </ToolLayout>
    )
  }

  // View: CR Document
  if (view === 'view-cr' && viewCR) {
    const project = getProjectById(viewCR.projectId)
    const docText = generateCRDocument(viewCR, project)
    const statusObj = CR_STATUSES.find((s) => s.value === viewCR.status)

    return (
      <ToolLayout title="Scope Change Request System" description={`Change Request: CR-${viewCR.id.slice(0, 6).toUpperCase()}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setViewCR(null); setView('requests') }} className="text-sm inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            &larr; Back to Requests
          </button>
          <div className="flex items-center gap-3">
            <select
              value={viewCR.status}
              onChange={(e) => { updateCRStatus(viewCR.id, e.target.value); setViewCR({ ...viewCR, status: e.target.value }) }}
              className="rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
            >
              {CR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <CopyButton text={docText} label="Copy" />
            <button onClick={exportPDF} className="px-4 py-2 text-sm rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Export PDF</button>
          </div>
        </div>

        <div ref={crDocRef} className="max-w-2xl mx-auto rounded-2xl p-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed" style={{ color: 'var(--text-body)' }}>{docText}</pre>
        </div>
      </ToolLayout>
    )
  }

  // View: All Change Requests
  return (
    <ToolLayout title="Scope Change Request System" description="View and manage all change requests across projects.">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('projects')} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Projects</button>
        <button onClick={() => setView('requests')} className="px-4 py-2 text-sm rounded-xl" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Change Requests</button>
        <button onClick={() => { setCRForm((f) => ({ ...f, projectId: projects[0]?.id || '' })); if (projects[0]) selectProjectForCR(projects[0].id); setView('new-cr') }} className="ml-auto px-5 py-2 rounded-xl font-medium transition-colors text-sm hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
          + New Change Request
        </button>
      </div>

      {/* Filter by project */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setSelectedProjectId(null)} className="px-3 py-1.5 text-xs rounded-lg transition-all" style={!selectedProjectId ? { background: 'var(--accent)', color: 'var(--text-heading)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>All Projects</button>
        {projects.map((p) => (
          <button key={p.id} onClick={() => setSelectedProjectId(p.id)} className="px-3 py-1.5 text-xs rounded-lg transition-all" style={selectedProjectId === p.id ? { background: 'var(--accent)', color: 'var(--text-heading)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{p.name}</button>
        ))}
      </div>

      {changeRequests.length === 0 ? (
        <ResultCard>
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No change requests yet. Create one from the Projects view.</p>
        </ResultCard>
      ) : (
        <div className="space-y-3">
          {changeRequests
            .filter((cr) => !selectedProjectId || cr.projectId === selectedProjectId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((cr) => {
              const project = getProjectById(cr.projectId)
              const cost = cr.additionalHours * cr.hourlyRate
              const statusObj = CR_STATUSES.find((s) => s.value === cr.status)
              const priorityObj = PRIORITY_OPTIONS.find((p) => p.value === cr.priority)
              return (
                <div key={cr.id} className="rounded-xl p-5 transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>CR-{cr.id.slice(0, 6).toUpperCase()}</span>
                        <span className="px-2.5 py-0.5 text-xs rounded-full font-medium" style={{ background: statusObj?.bg, color: statusObj?.text }}>{statusObj?.label}</span>
                        <span className="text-xs" style={{ color: priorityObj?.colorVar }}>{priorityObj?.label}</span>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Project: <span style={{ color: 'var(--text-body)' }}>{project?.name || 'Unknown'}</span></p>
                      <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{cr.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium" style={{ color: 'var(--accent)' }}>+${cost.toLocaleString()}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{cr.additionalHours}h @ ${cr.hourlyRate}/hr</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(cr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => { setViewCR(cr); setView('view-cr') }} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>View</button>
                      <button onClick={() => deleteCR(cr.id)} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </ToolLayout>
  )
}
