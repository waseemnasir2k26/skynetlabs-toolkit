import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import StepWizard from '../shared/StepWizard'
import FormInput from '../shared/FormInput'
import FormSelect from '../shared/FormSelect'
import FormTextarea from '../shared/FormTextarea'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import ExportButton from '../shared/ExportButton'
import CopyButton from '../shared/CopyButton'
import EmptyState from '../shared/EmptyState'
import { useToast } from '../shared/Toast'
import { generateId } from '../shared/utils'

const STEPS = ['Client Info', 'The Problem', 'Your Solution', 'Results', 'Testimonial', 'Preview']

const PROJECT_TYPES = [
  'Website',
  'Branding',
  'Marketing Campaign',
  'SEO',
  'Social Media',
  'App Development',
  'Consulting',
  'Other',
]

const EMPTY_STUDY = {
  id: '',
  clientName: '',
  projectType: '',
  industry: '',
  duration: '',
  problem: '',
  painPoints: [],
  solution: '',
  methodology: '',
  toolsUsed: [],
  results: [],
  testimonial: { quote: '', author: '', role: '', company: '' },
  createdAt: '',
  updatedAt: '',
}

export default function App() {
  const [studies, setStudies] = useLocalStorage('skynet-case-study-generator-studies', [])
  const [currentStep, setCurrentStep] = useState(0)
  const [view, setView] = useState('list') // 'list' | 'editor'
  const [editingId, setEditingId] = useState(null)

  // Working draft state
  const [draft, setDraft] = useState({ ...EMPTY_STUDY })

  // Temp inputs for add/remove lists
  const [painPointInput, setPainPointInput] = useState('')
  const [toolInput, setToolInput] = useState('')

  const toast = useToast()

  // --- Helpers ---
  const updateDraft = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const updateTestimonial = (field, value) => {
    setDraft(prev => ({
      ...prev,
      testimonial: { ...prev.testimonial, [field]: value },
    }))
  }

  const startNew = () => {
    setDraft({ ...EMPTY_STUDY, id: generateId(), createdAt: new Date().toISOString().split('T')[0] })
    setEditingId(null)
    setCurrentStep(0)
    setView('editor')
  }

  const editStudy = (study) => {
    setDraft({ ...study })
    setEditingId(study.id)
    setCurrentStep(0)
    setView('editor')
  }

  const deleteStudy = (id) => {
    setStudies(prev => prev.filter(s => s.id !== id))
    if (toast) toast('Case study deleted', 'success')
  }

  const saveStudy = () => {
    const now = new Date().toISOString().split('T')[0]
    const updated = { ...draft, updatedAt: now }
    if (!updated.createdAt) updated.createdAt = now

    setStudies(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updated
        return copy
      }
      return [...prev, updated]
    })

    if (toast) toast('Case study saved!', 'success')
  }

  const saveAndBack = () => {
    saveStudy()
    setView('list')
  }

  // --- Pain Points ---
  const addPainPoint = () => {
    const trimmed = painPointInput.trim()
    if (!trimmed) return
    updateDraft('painPoints', [...draft.painPoints, trimmed])
    setPainPointInput('')
  }

  const removePainPoint = (idx) => {
    updateDraft('painPoints', draft.painPoints.filter((_, i) => i !== idx))
  }

  // --- Tools Used ---
  const addTool = () => {
    const trimmed = toolInput.trim()
    if (!trimmed) return
    updateDraft('toolsUsed', [...draft.toolsUsed, trimmed])
    setToolInput('')
  }

  const removeTool = (idx) => {
    updateDraft('toolsUsed', draft.toolsUsed.filter((_, i) => i !== idx))
  }

  // --- Results Metrics ---
  const addResult = () => {
    updateDraft('results', [...draft.results, { metric: '', before: '', after: '', improvement: '' }])
  }

  const updateResult = (idx, field, value) => {
    const updated = draft.results.map((r, i) => {
      if (i !== idx) return r
      const newR = { ...r, [field]: value }
      // Auto-calculate improvement %
      if (field === 'before' || field === 'after') {
        const bNum = parseFloat(newR.before)
        const aNum = parseFloat(newR.after)
        if (!isNaN(bNum) && !isNaN(aNum) && bNum !== 0) {
          const imp = ((aNum - bNum) / Math.abs(bNum)) * 100
          newR.improvement = Math.round(imp) + '%'
        }
      }
      return newR
    })
    updateDraft('results', updated)
  }

  const removeResult = (idx) => {
    updateDraft('results', draft.results.filter((_, i) => i !== idx))
  }

  // --- Completeness Score ---
  const completenessScore = useMemo(() => {
    let total = 0
    let filled = 0

    // Light fields (weight 1 each)
    const lightFields = [
      draft.clientName, draft.projectType, draft.industry, draft.duration,
      draft.methodology,
      draft.testimonial.quote, draft.testimonial.author,
    ]
    total += lightFields.length
    filled += lightFields.filter(f => f && f.trim()).length

    // Heavy fields (weight 3 each)
    // Problem
    total += 3
    if (draft.problem && draft.problem.trim()) filled += 3

    // Solution
    total += 3
    if (draft.solution && draft.solution.trim()) filled += 3

    // Results (weight 3)
    total += 3
    if (draft.results.length > 0 && draft.results.some(r => r.metric && r.after)) filled += 3

    // Pain points (weight 2)
    total += 2
    if (draft.painPoints.length > 0) filled += 2

    // Tools used (weight 1)
    total += 1
    if (draft.toolsUsed.length > 0) filled += 1

    return Math.round((filled / total) * 100)
  }, [draft])

  // --- Plain Text for Copy ---
  const plainText = useMemo(() => {
    let text = ''
    text += `CASE STUDY: ${draft.clientName || '[Client Name]'}\n`
    text += `Project: ${draft.projectType || '[Project Type]'} | Industry: ${draft.industry || '[Industry]'} | Duration: ${draft.duration || '[Duration]'}\n`
    text += `${'='.repeat(60)}\n\n`

    text += `THE CHALLENGE\n${'-'.repeat(40)}\n`
    text += `${draft.problem || '[Describe the problem]'}\n\n`
    if (draft.painPoints.length > 0) {
      text += `Key Pain Points:\n`
      draft.painPoints.forEach(p => { text += `  - ${p}\n` })
      text += '\n'
    }

    text += `OUR APPROACH\n${'-'.repeat(40)}\n`
    text += `${draft.solution || '[Describe your solution]'}\n\n`
    if (draft.methodology) text += `Methodology: ${draft.methodology}\n`
    if (draft.toolsUsed.length > 0) text += `Tools: ${draft.toolsUsed.join(', ')}\n`
    text += '\n'

    text += `THE RESULTS\n${'-'.repeat(40)}\n`
    if (draft.results.length > 0) {
      draft.results.forEach(r => {
        text += `  ${r.metric}: ${r.before} -> ${r.after} (${r.improvement} improvement)\n`
      })
    } else {
      text += '  [Add your results]\n'
    }
    text += '\n'

    if (draft.testimonial.quote) {
      text += `CLIENT TESTIMONIAL\n${'-'.repeat(40)}\n`
      text += `"${draft.testimonial.quote}"\n`
      text += `- ${draft.testimonial.author || '[Author]'}${draft.testimonial.role ? ', ' + draft.testimonial.role : ''}${draft.testimonial.company ? ' at ' + draft.testimonial.company : ''}\n`
    }

    return text
  }, [draft])

  // --- Step Renderers ---
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Client Name"
          value={draft.clientName}
          onChange={(e) => updateDraft('clientName', e.target.value)}
          placeholder="Acme Corp"
          required
        />
        <FormSelect
          label="Project Type"
          value={draft.projectType}
          onChange={(e) => updateDraft('projectType', e.target.value)}
          options={PROJECT_TYPES}
          placeholder="Select project type..."
          required
        />
        <FormInput
          label="Industry"
          value={draft.industry}
          onChange={(e) => updateDraft('industry', e.target.value)}
          placeholder="SaaS, E-commerce, Healthcare..."
        />
        <FormInput
          label="Duration"
          value={draft.duration}
          onChange={(e) => updateDraft('duration', e.target.value)}
          placeholder="3 months"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <FormTextarea
        label="Problem Description"
        value={draft.problem}
        onChange={(e) => updateDraft('problem', e.target.value)}
        placeholder="Describe the client's main problem or challenge before you got involved. What were they struggling with? What was at stake?"
        rows={5}
        required
      />

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          Pain Points
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={painPointInput}
            onChange={(e) => setPainPointInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
            placeholder="Add a pain point..."
            className="flex-1 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-heading)',
            }}
          />
          <button
            onClick={addPainPoint}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.painPoints.map((point, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: 'var(--danger-soft, rgba(239,68,68,0.1))',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
              }}
            >
              {point}
              <button
                onClick={() => removePainPoint(idx)}
                className="hover:opacity-70 transition-opacity"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {draft.painPoints.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No pain points added yet. Press Enter or click Add.</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <FormTextarea
        label="Solution Description"
        value={draft.solution}
        onChange={(e) => updateDraft('solution', e.target.value)}
        placeholder="Describe what you did to solve the problem. What was your approach? What made your solution unique?"
        rows={5}
        required
      />
      <FormInput
        label="Approach / Methodology"
        value={draft.methodology}
        onChange={(e) => updateDraft('methodology', e.target.value)}
        placeholder="Discovery → Design → Development → Launch"
        helpText="Describe your process as steps or phases"
      />
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          Tools & Technologies Used
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
            placeholder="Add a tool (Figma, React, etc.)..."
            className="flex-1 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-heading)',
            }}
          />
          <button
            onClick={addTool}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.toolsUsed.map((tool, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              {tool}
              <button
                onClick={() => removeTool(idx)}
                className="hover:opacity-70 transition-opacity"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {draft.toolsUsed.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tools added yet. Press Enter or click Add.</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
          Results & Metrics
        </label>
        <button
          onClick={addResult}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Metric
        </button>
      </div>

      {draft.results.length === 0 && (
        <div
          className="rounded-lg p-6 text-center border-2 border-dashed"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <p className="text-sm mb-2">No metrics added yet</p>
          <p className="text-xs">Click "Add Metric" to show before/after results</p>
        </div>
      )}

      <div className="space-y-3">
        {draft.results.map((r, idx) => (
          <div
            key={idx}
            className="rounded-lg p-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                Metric {idx + 1}
              </span>
              <button
                onClick={() => removeResult(idx)}
                className="p-1 rounded transition-all"
                style={{ color: 'var(--danger)' }}
                title="Remove metric"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <FormInput
                label="Metric Name"
                value={r.metric}
                onChange={(e) => updateResult(idx, 'metric', e.target.value)}
                placeholder="Conversion Rate"
              />
              <FormInput
                label="Before"
                value={r.before}
                onChange={(e) => updateResult(idx, 'before', e.target.value)}
                placeholder="2%"
              />
              <FormInput
                label="After"
                value={r.after}
                onChange={(e) => updateResult(idx, 'after', e.target.value)}
                placeholder="8%"
              />
              <FormInput
                label="Improvement"
                value={r.improvement}
                onChange={(e) => updateResult(idx, 'improvement', e.target.value)}
                placeholder="300%"
                helpText="Auto-calculated if numeric"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-4">
      <FormTextarea
        label="Testimonial Quote"
        value={draft.testimonial.quote}
        onChange={(e) => updateTestimonial('quote', e.target.value)}
        placeholder="Working with [your name] was an incredible experience. They understood our vision and delivered results beyond our expectations..."
        rows={4}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput
          label="Author Name"
          value={draft.testimonial.author}
          onChange={(e) => updateTestimonial('author', e.target.value)}
          placeholder="John Smith"
        />
        <FormInput
          label="Author Role"
          value={draft.testimonial.role}
          onChange={(e) => updateTestimonial('role', e.target.value)}
          placeholder="CEO"
        />
        <FormInput
          label="Company"
          value={draft.testimonial.company}
          onChange={(e) => updateTestimonial('company', e.target.value)}
          placeholder="Acme Corp"
        />
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      {/* Score + Actions Row */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ScoreGauge
          score={completenessScore}
          label={completenessScore >= 80 ? 'Great!' : completenessScore >= 50 ? 'Getting there' : 'Needs more detail'}
          size={120}
          strokeWidth={8}
        />
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>
            Completeness: {completenessScore}%
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {completenessScore >= 80
              ? 'Your case study is looking great! Ready to export.'
              : completenessScore >= 50
                ? 'Good progress. Fill in more details for a stronger case study.'
                : 'Add more content to make your case study compelling.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <ExportButton
              elementId="case-study-preview"
              filename={`${draft.clientName || 'case-study'}-case-study.pdf`}
              label="Export PDF"
            />
            <CopyButton text={plainText} label="Copy Text" />
            <button
              onClick={saveStudy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all font-medium"
              style={{
                background: 'var(--success-soft)',
                color: 'var(--success)',
                border: '1px solid var(--success)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div
        id="case-study-preview"
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="p-6 sm:p-8"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ opacity: 0.8 }}>
            Case Study
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {draft.clientName || 'Client Name'}
          </h2>
          <div className="flex flex-wrap gap-3 text-sm" style={{ opacity: 0.9 }}>
            {draft.projectType && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {draft.projectType}
              </span>
            )}
            {draft.industry && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {draft.industry}
              </span>
            )}
            {draft.duration && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {draft.duration}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* The Challenge */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--danger-soft, rgba(239,68,68,0.1))', color: 'var(--danger)' }}
              >
                !
              </span>
              The Challenge
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-body)' }}>
              {draft.problem || 'Describe the challenge your client was facing...'}
            </p>
            {draft.painPoints.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draft.painPoints.map((point, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--danger-soft, rgba(239,68,68,0.1))',
                      color: 'var(--danger)',
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {point}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Our Approach */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              Our Approach
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-body)' }}>
              {draft.solution || 'Describe your solution and approach...'}
            </p>
            {draft.methodology && (
              <div
                className="rounded-lg p-3 mb-4"
                style={{ background: 'var(--accent-soft)', borderLeft: '3px solid var(--accent)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>Methodology</p>
                <p className="text-sm" style={{ color: 'var(--text-body)' }}>{draft.methodology}</p>
              </div>
            )}
            {draft.toolsUsed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draft.toolsUsed.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-body)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* The Results */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
              The Results
            </h3>
            {draft.results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {draft.results.map((r, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-4 text-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                      {r.metric || 'Metric'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div>
                        <p className="text-lg font-bold" style={{ color: 'var(--danger)' }}>
                          {r.before || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Before</p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                          {r.after || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>After</p>
                      </div>
                    </div>
                    {r.improvement && (
                      <p
                        className="text-sm font-bold mt-2 px-3 py-1 rounded-full inline-block"
                        style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
                      >
                        {r.improvement} improvement
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add metrics in Step 4 to see results here.</p>
            )}
          </div>

          {/* Testimonial */}
          {draft.testimonial.quote && (
            <>
              <div style={{ borderTop: '1px solid var(--border)' }} />
              <div>
                <div
                  className="rounded-xl p-6 relative"
                  style={{ background: 'var(--accent-soft)', borderLeft: '4px solid var(--accent)' }}
                >
                  <svg
                    className="absolute top-4 right-4 w-8 h-8"
                    fill="var(--accent)"
                    viewBox="0 0 24 24"
                    style={{ opacity: 0.2 }}
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                  </svg>
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: 'var(--text-body)' }}>
                    "{draft.testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                    >
                      {(draft.testimonial.author || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                        {draft.testimonial.author || 'Author'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {[draft.testimonial.role, draft.testimonial.company].filter(Boolean).join(' at ') || 'Role at Company'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const stepContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6]

  // --- List View ---
  const renderList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Your Case Studies</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{studies.length} case {studies.length === 1 ? 'study' : 'studies'} saved</p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Case Study
        </button>
      </div>

      {studies.length === 0 ? (
        <EmptyState
          icon="\uD83D\uDCCB"
          title="No Case Studies Yet"
          description="Create your first case study to showcase your best work to potential clients."
          action="Create Case Study"
          onAction={startNew}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studies.map((study) => {
            const filledResults = study.results?.filter(r => r.metric)?.length || 0
            return (
              <div
                key={study.id}
                className="rounded-xl p-5 transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onClick={() => editStudy(study)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-heading)' }}>
                      {study.clientName || 'Untitled Case Study'}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {study.projectType || 'No project type'} {study.industry ? `\u00B7 ${study.industry}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm('Delete this case study?')) deleteStudy(study.id)
                    }}
                    className="p-1.5 rounded-lg transition-all flex-shrink-0 ml-2"
                    style={{ color: 'var(--danger)' }}
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-body)' }}>
                  {study.problem || 'No problem description yet...'}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  {study.duration && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                      {study.duration}
                    </span>
                  )}
                  {filledResults > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                      {filledResults} metric{filledResults !== 1 ? 's' : ''}
                    </span>
                  )}
                  {study.testimonial?.quote && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      Has testimonial
                    </span>
                  )}
                </div>

                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  {study.updatedAt ? `Updated ${study.updatedAt}` : study.createdAt ? `Created ${study.createdAt}` : ''}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // --- Editor View ---
  const renderEditor = () => (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('list')}
          className="inline-flex items-center gap-2 text-sm font-medium transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </button>
        <button
          onClick={saveAndBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-all"
          style={{ background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Save & Close
        </button>
      </div>

      {/* Wizard Steps */}
      <StepWizard
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(i) => setCurrentStep(i)}
      />

      {/* Step Content */}
      <ResultCard
        title={`Step ${currentStep + 1}: ${STEPS[currentStep]}`}
        icon={['\uD83C\uDFE2', '\u26A0\uFE0F', '\uD83D\uDCA1', '\uD83D\uDCCA', '\u2B50', '\uD83D\uDC41\uFE0F'][currentStep]}
      >
        {stepContent[currentStep]()}
      </ResultCard>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
          style={{
            background: 'var(--bg-elevated)',
            color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-heading)',
            border: '1px solid var(--border)',
            opacity: currentStep === 0 ? 0.5 : 1,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: 'var(--accent)',
              color: 'var(--text-on-accent)',
            }}
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={saveAndBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: 'var(--success)',
              color: '#fff',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Save Case Study
          </button>
        )}
      </div>
    </div>
  )

  return (
    <ToolLayout
      title="Case Study Generator"
      description="Create professional case studies with the Problem \u2192 Solution \u2192 Results framework."
      icon="\uD83D\uDCCB"
      category="Authority Building"
      maxWidth="wide"
      proTip="Strong case studies follow the PSR framework: Problem, Solution, Results. Include specific metrics (before/after numbers) to make your results concrete and compelling."
    >
      {view === 'list' ? renderList() : renderEditor()}
    </ToolLayout>
  )
}
