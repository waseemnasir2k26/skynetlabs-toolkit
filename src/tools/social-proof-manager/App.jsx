import React, { useState, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useToast } from '../shared/Toast'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import html2canvas from 'html2canvas'

const DEFAULT_QUESTIONS = [
  'How was your overall experience working with us?',
  'What specific results or outcomes did you achieve?',
  'Would you recommend us to others? Why?',
]

const SERVICE_TAGS = ['Web Design', 'SEO', 'Branding', 'Development', 'Marketing', 'Consulting', 'Automation', 'Content', 'Other']
const INDUSTRY_TAGS = ['Tech', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Real Estate', 'Agency', 'SaaS', 'Local Business', 'Other']
const RESULT_TAGS = ['Revenue Growth', 'Time Saved', 'Lead Increase', 'Brand Awareness', 'Cost Reduction', 'Efficiency', 'Customer Satisfaction']
const STATUS_OPTIONS = ['New', 'Approved', 'Featured', 'Archived']
const STATUS_COLORS = {
  New: { background: 'var(--info-soft)', color: 'var(--info)' },
  Approved: { background: 'var(--warning-soft)', color: 'var(--warning)' },
  Featured: { background: 'var(--accent-soft)', color: 'var(--accent)' },
  Archived: { background: 'rgba(107,114,128,0.2)', color: 'var(--text-muted)' },
}

function StarRating({ value, onChange, size = 'md', interactive = true }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" disabled={!interactive}
          onClick={() => interactive && onChange(s)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}>
          <svg className={sizes[size]} viewBox="0 0 24 24" fill={s <= value ? 'var(--accent)' : 'none'}
            stroke={s <= value ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth={2}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [testimonials, setTestimonials] = useLocalStorage('social-proof-testimonials', [])
  const [questions, setQuestions] = useLocalStorage('social-proof-questions', DEFAULT_QUESTIONS)
  const [activeTab, setActiveTab] = useState('collect')
  const [editingId, setEditingId] = useState(null)
  const [selectedForWall, setSelectedForWall] = useState([])
  const [selectedForCard, setSelectedForCard] = useState(null)
  const [wallHtml, setWallHtml] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const cardRef = useRef(null)
  const toast = useToast()

  // Collection form state
  const [formData, setFormData] = useState({
    name: '', company: '', role: '', email: '', rating: 5, photo: '',
    answers: DEFAULT_QUESTIONS.map(() => ''), serviceTags: [], industryTags: [], resultTags: [],
  })

  const resetForm = () => {
    setFormData({
      name: '', company: '', role: '', email: '', rating: 5, photo: '',
      answers: questions.map(() => ''), serviceTags: [], industryTags: [], resultTags: [],
    })
  }

  const handleSubmitTestimonial = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.answers[0]) return
    const newT = {
      id: Date.now().toString(),
      ...formData,
      questions: [...questions],
      status: 'New',
      createdAt: new Date().toISOString(),
    }
    if (editingId) {
      setTestimonials(prev => prev.map(t => t.id === editingId ? { ...newT, id: editingId } : t))
      setEditingId(null)
    } else {
      setTestimonials(prev => [newT, ...prev])
    }
    resetForm()
    setShowCollectionForm(false)
    setActiveTab('manage')
  }

  const editTestimonial = (t) => {
    setFormData({
      name: t.name, company: t.company, role: t.role, email: t.email,
      rating: t.rating, photo: t.photo, answers: t.answers,
      serviceTags: t.serviceTags || [], industryTags: t.industryTags || [], resultTags: t.resultTags || [],
    })
    setEditingId(t.id)
    setActiveTab('collect')
    setShowCollectionForm(true)
  }

  const deleteTestimonial = (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id))
  }

  const updateStatus = (id, status) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const toggleTag = (field, tag) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag) ? prev[field].filter(t => t !== tag) : [...prev[field], tag]
    }))
  }

  const addQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions(prev => [...prev, newQuestion.trim()])
    setFormData(prev => ({ ...prev, answers: [...prev.answers, ''] }))
    setNewQuestion('')
  }

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return
    setQuestions(prev => prev.filter((_, i) => i !== idx))
    setFormData(prev => ({ ...prev, answers: prev.answers.filter((_, i) => i !== idx) }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFormData(prev => ({ ...prev, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  // Generate Wall of Love HTML
  const generateWallHtml = () => {
    const selected = testimonials.filter(t => selectedForWall.includes(t.id))
    if (!selected.length) return
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Wall of Love</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#fff;padding:40px 20px}
h1{text-align:center;font-size:2.5rem;margin-bottom:40px;color:#fff}
h1 span{color:#13b973}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;max-width:1200px;margin:0 auto}
.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;transition:transform .2s}
.card:hover{transform:translateY(-4px)}
.stars{color:#13b973;font-size:18px;margin-bottom:12px}
.quote{color:#d1d5db;font-size:15px;line-height:1.6;margin-bottom:16px;font-style:italic}
.author{display:flex;align-items:center;gap:12px}
.avatar{width:40px;height:40px;border-radius:50%;background:#13b973;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;color:#fff}
.avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover}
.name{font-weight:600;font-size:14px}
.role{color:#9ca3af;font-size:13px}
</style></head><body>
<h1>Wall of <span>Love</span></h1>
<div class="grid">
${selected.map(t => `<div class="card">
<div class="stars">${'&#9733;'.repeat(t.rating)}${'&#9734;'.repeat(5 - t.rating)}</div>
<div class="quote">"${t.answers[0]}"</div>
<div class="author">
<div class="avatar">${t.photo ? `<img src="${t.photo}" alt="${t.name}">` : t.name.charAt(0).toUpperCase()}</div>
<div><div class="name">${t.name}</div><div class="role">${t.role ? t.role + (t.company ? ', ' + t.company : '') : t.company || ''}</div></div>
</div></div>`).join('\n')}
</div></body></html>`
    setWallHtml(html)
  }

  const downloadWallHtml = () => {
    const blob = new Blob([wallHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'wall-of-love.html'; a.click()
    URL.revokeObjectURL(url)
    if (toast) toast('Wall of Love downloaded!', 'success')
  }

  const downloadQuoteCard = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#f4f5f7' : '#050507', useCORS: true })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url; a.download = 'testimonial-card.png'; a.click()
    if (toast) toast('Quote card downloaded!', 'success')
  }

  // Generate shareable link (simulated)
  const generateShareableLink = () => {
    const formJson = btoa(JSON.stringify({ questions }))
    return `${window.location.origin}${window.location.pathname}?collect=${formJson}`
  }

  // Stats
  const avgRating = testimonials.length ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1) : 0
  const positiveKeywords = (() => {
    const words = {}
    const positives = ['amazing', 'great', 'excellent', 'fantastic', 'wonderful', 'professional', 'outstanding', 'incredible', 'perfect', 'best', 'recommend', 'love', 'exceeded', 'impressed', 'quality', 'responsive', 'fast', 'reliable', 'skilled', 'efficient']
    testimonials.forEach(t => {
      t.answers.forEach(a => {
        const lower = (a || '').toLowerCase()
        positives.forEach(w => { if (lower.includes(w)) words[w] = (words[w] || 0) + 1 })
      })
    })
    return Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 10)
  })()

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.answers.some(a => (a || '').toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const exportAllJson = () => {
    const blob = new Blob([JSON.stringify(testimonials, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'testimonials-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'collect', label: 'Collect', icon: 'M12 4v16m8-8H4' },
    { id: 'manage', label: 'Manage', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'display', label: 'Display', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { id: 'stats', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  return (
    <ToolLayout title="Social Proof Manager" description="Collect, curate, and showcase powerful testimonials. Build trust with a Wall of Love, branded quote cards, and embeddable widgets.">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={activeTab === tab.id
              ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
            }>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* COLLECT TAB */}
      {activeTab === 'collect' && (
        <div className="space-y-6">
          {/* Question Configuration */}
          <ResultCard title="Collection Form Questions">
            <div className="space-y-3 mb-4">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-mono text-sm min-w-[24px]" style={{ color: "var(--accent)" }}>Q{i + 1}</span>
                  <span className="text-sm flex-1" style={{ color: "var(--text-body)" }}>{q}</span>
                  <button onClick={() => removeQuestion(i)} className="transition-colors" style={{ color: "var(--text-muted)" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Add a custom question..."
                className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                onKeyDown={e => e.key === 'Enter' && addQuestion()} />
              <button onClick={addQuestion} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>Add</button>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <CopyButton text={generateShareableLink()} label="Copy Shareable Link" />
            </div>
          </ResultCard>

          {/* Add Testimonial Button / Form */}
          {!showCollectionForm ? (
            <button onClick={() => { resetForm(); setShowCollectionForm(true); setEditingId(null) }}
              className="w-full py-4 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New Testimonial
            </button>
          ) : (
            <ResultCard title={editingId ? 'Edit Testimonial' : 'New Testimonial'}>
              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Name *</label>
                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} required />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Company</label>
                    <input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Role/Title</label>
                    <input value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--text-muted)" }}>Rating</label>
                  <StarRating value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} size="lg" />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Photo (optional)</label>
                  <div className="flex items-center gap-3">
                    {formData.photo && <img src={formData.photo} alt="" className="w-10 h-10 rounded-full object-cover" />}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload}
                      className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:cursor-pointer" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>

                {questions.map((q, i) => (
                  <div key={i}>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>{q} {i === 0 && '*'}</label>
                    <textarea value={formData.answers[i] || ''} onChange={e => {
                      const a = [...formData.answers]; a[i] = e.target.value
                      setFormData(p => ({ ...p, answers: a }))
                    }} rows={3} className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                      required={i === 0} />
                  </div>
                ))}

                {/* Tags */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--text-muted)" }}>Service Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag('serviceTags', tag)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={formData.serviceTags.includes(tag)
                          ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-soft)' }
                          : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                        }>{tag}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--text-muted)" }}>Industry Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag('industryTags', tag)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={formData.industryTags.includes(tag)
                          ? { background: 'var(--info-soft)', color: 'var(--info)', border: '1px solid var(--info-soft)' }
                          : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                        }>{tag}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: "var(--text-muted)" }}>Result Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {RESULT_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag('resultTags', tag)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={formData.resultTags.includes(tag)
                          ? { background: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning-soft)' }
                          : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                        }>{tag}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 font-medium rounded-xl transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                    {editingId ? 'Update' : 'Save'} Testimonial
                  </button>
                  <button type="button" onClick={() => { setShowCollectionForm(false); setEditingId(null); resetForm() }}
                    className="px-6 py-2.5 rounded-xl transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>Cancel</button>
                </div>
              </form>
            </ResultCard>
          )}
        </div>
      )}

      {/* MANAGE TAB */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search testimonials..."
              className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
            <div className="flex gap-2 flex-wrap">
              {['All', ...STATUS_OPTIONS].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={filterStatus === s
                    ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                  }>{s}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? 's' : ''}</span>
            <button onClick={exportAllJson} className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2" style={{ background: "var(--bg-elevated)", color: "var(--text-body)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export JSON
            </button>
          </div>

          {/* Testimonial Grid */}
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
              <p className="text-lg mb-2">No testimonials yet</p>
              <p className="text-sm">Go to the Collect tab to add your first testimonial.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTestimonials.map(t => (
                <div key={t.id} className="rounded-xl p-5 flex flex-col" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full  flex items-center justify-center font-bold text-sm">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text-heading)" }}>{t.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}{t.role && t.company ? ', ' : ''}{t.company}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={STATUS_COLORS[t.status]}>{t.status}</span>
                  </div>
                  <StarRating value={t.rating} onChange={() => {}} size="sm" interactive={false} />
                  <p className="text-sm mt-3 flex-1 line-clamp-4 italic" style={{ color: "var(--text-body)" }}>"{t.answers[0]}"</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(t.serviceTags || []).map(tag => <span key={tag} className="px-2 py-0.5 text-xs rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{tag}</span>)}
                    {(t.industryTags || []).map(tag => <span key={tag} className="px-2 py-0.5 text-xs rounded-full" style={{ background: "var(--info-soft)", color: "var(--info)" }}>{tag}</span>)}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                      className="rounded-lg px-2 py-1 text-xs focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-body)" }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex-1" />
                    <button onClick={() => editTestimonial(t)} className="transition-colors p-1" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => deleteTestimonial(t.id)} className="transition-colors p-1" style={{ color: "var(--text-muted)" }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DISPLAY TAB */}
      {activeTab === 'display' && (
        <div className="space-y-8">
          {/* Wall of Love Generator */}
          <ResultCard title="Wall of Love Generator">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Select testimonials to include in your embeddable Wall of Love.</p>
            {testimonials.filter(t => t.status === 'Approved' || t.status === 'Featured').length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Approve or feature some testimonials first in the Manage tab.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {testimonials.filter(t => t.status === 'Approved' || t.status === 'Featured').map(t => (
                    <label key={t.id} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={selectedForWall.includes(t.id)
                      ? { border: '1px solid var(--accent-soft)', background: 'var(--accent-soft)' }
                      : { border: '1px solid var(--border)', background: 'var(--bg-elevated)' }
                    }>
                      <input type="checkbox" checked={selectedForWall.includes(t.id)}
                        onChange={() => setSelectedForWall(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])}
                        style={{ accentColor: "var(--accent)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>{t.name}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>"{t.answers[0]?.slice(0, 60)}..."</p>
                      </div>
                      <StarRating value={t.rating} onChange={() => {}} size="sm" interactive={false} />
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={generateWallHtml} disabled={selectedForWall.length === 0}
                    className="px-4 py-2 disabled:opacity-40 font-medium rounded-lg text-sm transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                    Generate Wall HTML
                  </button>
                  {wallHtml && (
                    <>
                      <CopyButton text={wallHtml} label="Copy HTML" />
                      <button onClick={downloadWallHtml} className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-body)" }}>
                        Download HTML
                      </button>
                    </>
                  )}
                </div>
                {wallHtml && (
                  <div className="mt-4 p-4 rounded-lg max-h-48 overflow-auto" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <pre className="text-xs whitespace-pre-wrap break-all" style={{ color: "var(--text-muted)" }}>{wallHtml.slice(0, 500)}...</pre>
                  </div>
                )}
              </>
            )}
          </ResultCard>

          {/* Quote Card Generator */}
          <ResultCard title="Quote Card Generator">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Select a testimonial to generate a branded quote card image.</p>
            <select value={selectedForCard || ''} onChange={e => setSelectedForCard(e.target.value || null)}
              className="w-full sm:w-auto rounded-lg px-3 py-2 text-sm focus:outline-none mb-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}>
              <option value="">Select a testimonial...</option>
              {testimonials.filter(t => t.status !== 'Archived').map(t => (
                <option key={t.id} value={t.id}>{t.name} - "{t.answers[0]?.slice(0, 40)}..."</option>
              ))}
            </select>

            {selectedForCard && (() => {
              const t = testimonials.find(x => x.id === selectedForCard)
              if (!t) return null
              return (
                <div className="space-y-4">
                  <div ref={cardRef} className="max-w-lg mx-auto rounded-2xl p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--accent-soft)", minWidth: 400 }}>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className="w-5 h-5" viewBox="0 0 24 24" fill={s <= t.rating ? 'var(--accent)' : 'var(--bg-elevated)'} stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-lg leading-relaxed italic mb-6" style={{ color: "var(--text-heading)" }}>"{t.answers[0]}"</p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full  flex items-center justify-center font-bold text-lg">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-heading)" }}>{t.name}</p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t.role}{t.role && t.company ? ', ' : ''}{t.company}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button onClick={downloadQuoteCard} className="px-6 py-2.5 font-medium rounded-xl transition-colors text-sm" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                      Download as PNG
                    </button>
                  </div>
                </div>
              )
            })()}
          </ResultCard>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResultCard>
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: "var(--accent)" }}>{testimonials.length}</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Total Testimonials</p>
              </div>
            </ResultCard>
            <ResultCard>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-4xl font-bold" style={{ color: "var(--warning)" }}>{avgRating}</p>
                  <StarRating value={Math.round(avgRating)} onChange={() => {}} size="sm" interactive={false} />
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Average Rating</p>
              </div>
            </ResultCard>
            <ResultCard>
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: "var(--info)" }}>{testimonials.filter(t => t.status === 'Featured').length}</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Featured</p>
              </div>
            </ResultCard>
          </div>

          <ResultCard title="Status Breakdown">
            <div className="space-y-3">
              {STATUS_OPTIONS.map(s => {
                const count = testimonials.filter(t => t.status === s).length
                const pct = testimonials.length ? Math.round((count / testimonials.length) * 100) : 0
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium min-w-[80px] text-center" style={STATUS_COLORS[s]}>{s}</span>
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      <div className="h-full rounded-full transition-all" style={{ background: "var(--accent)", width: `${pct}%` }} />
                    </div>
                    <span className="text-sm min-w-[40px] text-right" style={{ color: "var(--text-muted)" }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </ResultCard>

          <ResultCard title="Most Common Positive Keywords">
            {positiveKeywords.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No keywords found yet. Add more testimonials!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {positiveKeywords.map(([word, count]) => (
                  <span key={word} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-soft)" }}>
                    {word} <span style={{ color: "var(--accent)", opacity: 0.6 }}>({count})</span>
                  </span>
                ))}
              </div>
            )}
          </ResultCard>

          <ResultCard title="Rating Distribution">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(r => {
                const count = testimonials.filter(t => t.rating === r).length
                const pct = testimonials.length ? Math.round((count / testimonials.length) * 100) : 0
                return (
                  <div key={r} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[60px]">
                      <span className="text-sm" style={{ color: "var(--text-heading)" }}>{r}</span>
                      <svg className="w-4 h-4" style={{ color: "var(--accent)" }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      <div className="h-full rounded-full transition-all" style={{ background: "var(--accent)", width: `${pct}%` }} />
                    </div>
                    <span className="text-sm min-w-[40px] text-right" style={{ color: "var(--text-muted)" }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </ResultCard>
        </div>
      )}
    </ToolLayout>
  )
}
