import React, { useState, useMemo, useRef, useCallback } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const TIMELINE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: '+1week', label: '+1 Week' },
  { value: '+2weeks', label: '+2 Weeks' },
  { value: '+1month', label: '+1 Month' },
  { value: 'custom', label: 'Custom' },
]

const PRIORITY_OPTIONS = [
  { value: 'nice', label: 'Nice to Have', color: 'text-gray-400' },
  { value: 'important', label: 'Important', color: 'text-yellow-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' },
]

const CR_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500/20 text-green-400' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
]

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
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
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = crDocRef.current
      if (!el) return
      const canvas = await html2canvas(el, { backgroundColor: '#0a0a0f', scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`change-request-${viewCR?.id?.slice(0, 6) || 'doc'}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    }
  }, [viewCR])

  const inputClass = "w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#13b973]/50"

  // View: Projects
  if (view === 'projects') {
    return (
      <ToolLayout title="Scope Change Request System" description="Manage projects and track scope change requests with automated cost calculations.">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('projects')} className="px-4 py-2 text-sm rounded-xl bg-[#13b973] text-white">Projects</button>
          <button onClick={() => setView('requests')} className="px-4 py-2 text-sm rounded-xl bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 transition-all">Change Requests</button>
          <button onClick={() => { setCRForm((f) => ({ ...f, projectId: projects[0]?.id || '' })); if (projects[0]) selectProjectForCR(projects[0].id); setView('new-cr') }} className="ml-auto px-5 py-2 bg-[#13b973] hover:bg-[#13b973]/80 text-white rounded-xl font-medium transition-colors text-sm">
            + New Change Request
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Active Projects</h2>
          <button onClick={openNewProject} className="px-4 py-2 text-sm bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 rounded-xl transition-all">+ Add Project</button>
        </div>

        {projects.length === 0 ? (
          <ResultCard>
            <p className="text-gray-500 text-center py-12">No projects yet. Add a project to start tracking scope changes.</p>
          </ResultCard>
        ) : (
          <div className="space-y-4">
            {projects.map((proj) => {
              const crs = getProjectCRs(proj.id)
              const approvedExtra = crs.filter((cr) => cr.status === 'approved').reduce((s, cr) => s + cr.additionalHours * cr.hourlyRate, 0)
              return (
                <div key={proj.id} className="bg-dark-100/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{proj.name}</h3>
                      {proj.scopeSummary && <p className="text-gray-400 text-sm mb-2 max-w-2xl">{proj.scopeSummary}</p>}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Budget: <span className="text-[#13b973] font-medium">${Number(proj.budget).toLocaleString()}</span></span>
                        <span className="text-gray-500">Rate: <span className="text-gray-300">${proj.hourlyRate}/hr</span></span>
                        <span className="text-gray-500">CRs: <span className="text-gray-300">{crs.length}</span></span>
                        {approvedExtra > 0 && <span className="text-yellow-400">+${approvedExtra.toLocaleString()} approved</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditProject(proj)} className="px-3 py-1.5 text-xs bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-all">Edit</button>
                      <button onClick={() => deleteProject(proj.id)} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all">Delete</button>
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
              <label className="block text-sm text-gray-400 mb-1.5">Project Name *</label>
              <input type="text" value={projectForm.name} onChange={(e) => updateProjectField('name', e.target.value)} className={inputClass} placeholder="Website Redesign" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Original Scope Summary</label>
              <textarea value={projectForm.scopeSummary} onChange={(e) => updateProjectField('scopeSummary', e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Describe the original project scope..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Budget ($)</label>
                <input type="number" value={projectForm.budget} onChange={(e) => updateProjectField('budget', e.target.value)} className={inputClass} placeholder="10000" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Hourly Rate ($)</label>
                <input type="number" value={projectForm.hourlyRate} onChange={(e) => updateProjectField('hourlyRate', e.target.value)} className={inputClass} placeholder="150" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowProjectModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={saveProject} className="px-6 py-2.5 bg-[#13b973] hover:bg-[#13b973]/80 text-white rounded-xl font-medium transition-colors">{editProject ? 'Update' : 'Add Project'}</button>
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
          <button onClick={() => setView('projects')} className="px-4 py-2 text-sm rounded-xl bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 transition-all">Projects</button>
          <button onClick={() => setView('requests')} className="px-4 py-2 text-sm rounded-xl bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 transition-all">Change Requests</button>
        </div>

        <div className="max-w-2xl mx-auto">
          <ResultCard title="New Change Request" icon="\uD83D\uDCDD">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Select Project *</label>
                <select value={crForm.projectId} onChange={(e) => selectProjectForCR(e.target.value)} className={inputClass}>
                  <option value="">-- Select a project --</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Change Description *</label>
                <textarea value={crForm.description} onChange={(e) => updateCRField('description', e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Describe the scope change in detail..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Additional Hours *</label>
                  <input type="number" value={crForm.additionalHours} onChange={(e) => updateCRField('additionalHours', e.target.value)} className={inputClass} placeholder="20" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Hourly Rate ($)</label>
                  <input type="number" value={crForm.hourlyRate} onChange={(e) => updateCRField('hourlyRate', e.target.value)} className={inputClass} placeholder="150" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Timeline Impact</label>
                  <select value={crForm.timelineImpact} onChange={(e) => updateCRField('timelineImpact', e.target.value)} className={inputClass}>
                    {TIMELINE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {crForm.timelineImpact === 'custom' && (
                    <input type="text" value={crForm.customTimeline} onChange={(e) => updateCRField('customTimeline', e.target.value)} className={`${inputClass} mt-2`} placeholder="e.g., +3 weeks" />
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
                  <select value={crForm.priority} onChange={(e) => updateCRField('priority', e.target.value)} className={inputClass}>
                    {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Cost Summary */}
              {(Number(crForm.additionalHours) > 0 && Number(crForm.hourlyRate) > 0) && (
                <div className="bg-dark-200/30 border border-white/5 rounded-xl p-4 mt-4">
                  <h4 className="text-white font-medium mb-3">Cost Impact</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Additional Cost</p>
                      <p className="text-[#13b973] font-bold">${additionalCost.toLocaleString()}</p>
                    </div>
                    {selectedProject && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Original Budget</p>
                          <p className="text-gray-300 font-bold">${Number(selectedProject.budget).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">New Total</p>
                          <p className="text-white font-bold">${newTotal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Over Budget</p>
                          <p className={`font-bold ${Number(overPercent) > 20 ? 'text-red-400' : Number(overPercent) > 10 ? 'text-yellow-400' : 'text-[#13b973]'}`}>+{overPercent}%</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setView('projects')} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={submitCR} disabled={!crForm.projectId || !crForm.description.trim() || !crForm.additionalHours} className="px-6 py-2.5 bg-[#13b973] hover:bg-[#13b973]/80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors">
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
          <button onClick={() => { setViewCR(null); setView('requests') }} className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-1 transition-colors">
            &larr; Back to Requests
          </button>
          <div className="flex items-center gap-3">
            <select
              value={viewCR.status}
              onChange={(e) => { updateCRStatus(viewCR.id, e.target.value); setViewCR({ ...viewCR, status: e.target.value }) }}
              className="bg-dark-200/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#13b973]/50"
            >
              {CR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <CopyButton text={docText} label="Copy" />
            <button onClick={exportPDF} className="px-4 py-2 text-sm bg-[#13b973] hover:bg-[#13b973]/80 text-white rounded-xl font-medium transition-colors">Export PDF</button>
          </div>
        </div>

        <div ref={crDocRef} className="max-w-2xl mx-auto bg-dark-100/50 border border-white/10 rounded-2xl p-8">
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{docText}</pre>
        </div>
      </ToolLayout>
    )
  }

  // View: All Change Requests
  return (
    <ToolLayout title="Scope Change Request System" description="View and manage all change requests across projects.">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('projects')} className="px-4 py-2 text-sm rounded-xl bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 transition-all">Projects</button>
        <button onClick={() => setView('requests')} className="px-4 py-2 text-sm rounded-xl bg-[#13b973] text-white">Change Requests</button>
        <button onClick={() => { setCRForm((f) => ({ ...f, projectId: projects[0]?.id || '' })); if (projects[0]) selectProjectForCR(projects[0].id); setView('new-cr') }} className="ml-auto px-5 py-2 bg-[#13b973] hover:bg-[#13b973]/80 text-white rounded-xl font-medium transition-colors text-sm">
          + New Change Request
        </button>
      </div>

      {/* Filter by project */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setSelectedProjectId(null)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${!selectedProjectId ? 'bg-[#13b973] text-white' : 'bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200'}`}>All Projects</button>
        {projects.map((p) => (
          <button key={p.id} onClick={() => setSelectedProjectId(p.id)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${selectedProjectId === p.id ? 'bg-[#13b973] text-white' : 'bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200'}`}>{p.name}</button>
        ))}
      </div>

      {changeRequests.length === 0 ? (
        <ResultCard>
          <p className="text-gray-500 text-center py-12">No change requests yet. Create one from the Projects view.</p>
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
                <div key={cr.id} className="bg-dark-100/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-gray-500 text-xs font-mono">CR-{cr.id.slice(0, 6).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusObj?.color}`}>{statusObj?.label}</span>
                        <span className={`text-xs ${priorityObj?.color}`}>{priorityObj?.label}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">Project: <span className="text-gray-300">{project?.name || 'Unknown'}</span></p>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{cr.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#13b973] font-medium">+${cost.toLocaleString()}</span>
                        <span className="text-gray-500">{cr.additionalHours}h @ ${cr.hourlyRate}/hr</span>
                        <span className="text-gray-600">{new Date(cr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => { setViewCR(cr); setView('view-cr') }} className="px-3 py-1.5 text-xs bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-all">View</button>
                      <button onClick={() => deleteCR(cr.id)} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all">Delete</button>
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
