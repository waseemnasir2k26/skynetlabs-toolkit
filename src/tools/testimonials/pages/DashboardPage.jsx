import { useState, useMemo } from 'react'
import {
  Star, Check, X, Trash2, Edit3, Copy, Download, Upload,
  Link2, Mail, Filter, Search, TrendingUp, MessageSquare,
  Clock, Award, ChevronDown, BarChart3, Plus
} from 'lucide-react'
import { useTestimonials } from '../contexts/TestimonialContext'
import StarRating from '../components/StarRating'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import {
  exportTestimonialsJSON, exportTestimonialsCSV,
  importTestimonialsJSON, generateCollectionLink, generateEmailTemplate,
} from '../utils/storage'

export default function DashboardPage() {
  const { testimonials, settings, stats, updateTestimonial, deleteTestimonial } = useTestimonials()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRating, setFilterRating] = useState(0)
  const [filterService, setFilterService] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [toast, setToast] = useState(null)

  const filteredTestimonials = useMemo(() => {
    let result = [...testimonials]

    if (filterStatus !== 'all') {
      if (filterStatus === 'starred') {
        result = result.filter(t => t.starred)
      } else {
        result = result.filter(t => t.status === filterStatus)
      }
    }

    if (filterRating > 0) {
      result = result.filter(t => t.rating >= filterRating)
    }

    if (filterService) {
      result = result.filter(t => t.service === filterService)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.testimonial || '').toLowerCase().includes(q) ||
        (t.company || '').toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0)
      return 0
    })

    return result
  }, [testimonials, filterStatus, filterRating, filterService, searchQuery, sortBy])

  const uniqueServices = [...new Set(testimonials.map(t => t.service).filter(Boolean))]

  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleApprove = (id) => {
    updateTestimonial(id, { status: 'approved' })
    showToast('Testimonial approved')
  }

  const handleReject = (id) => {
    updateTestimonial(id, { status: 'rejected' })
    showToast('Testimonial rejected')
  }

  const handleStar = (id, starred) => {
    updateTestimonial(id, { starred: !starred })
    showToast(starred ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonial(id)
      showToast('Testimonial deleted')
    }
  }

  const handleEdit = (t) => {
    setEditingId(t.id)
    setEditText(t.testimonial)
  }

  const handleSaveEdit = () => {
    updateTestimonial(editingId, { testimonial: editText })
    setEditingId(null)
    showToast('Testimonial updated')
  }

  const handleCopyText = (t) => {
    const text = `"${t.testimonial}"\n\n- ${t.name}${t.company ? `, ${t.company}` : ''}${t.rating ? ` (${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)})` : ''}`
    navigator.clipboard.writeText(text)
    showToast('Copied to clipboard')
  }

  const handleCopyLink = () => {
    const link = generateCollectionLink(settings)
    navigator.clipboard.writeText(link)
    showToast('Collection link copied')
  }

  const handleExportJSON = () => {
    const data = exportTestimonialsJSON()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'testimonials.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported as JSON')
  }

  const handleExportCSV = () => {
    const data = exportTestimonialsCSV()
    const blob = new Blob([data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'testimonials.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported as CSV')
  }

  const handleImport = () => {
    try {
      const result = importTestimonialsJSON(importText)
      showToast(`Imported ${result.imported} testimonials (${result.skipped} skipped)`)
      setShowImportModal(false)
      setImportText('')
      window.location.reload()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return dateStr }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: MessageSquare, color: 'var(--info, #3b82f6)' },
          { label: 'Approved', value: stats.approved, icon: Check, color: 'var(--accent)' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'var(--warning)' },
          { label: 'Rejected', value: stats.rejected, icon: X, color: 'var(--danger)' },
          { label: 'Starred', value: stats.starred, icon: Star, color: 'var(--warning)' },
          { label: 'Avg Rating', value: stats.averageRating, icon: TrendingUp, color: 'var(--accent)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color }}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-dark-50">{value}</p>
              <p className="text-xs text-dark-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={handleCopyLink} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Link2 className="w-4 h-4" /> Copy Collection Link
        </button>
        <button onClick={() => setShowEmailModal(true)} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <Mail className="w-4 h-4" /> Email Template
        </button>
        <button onClick={handleExportJSON} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <Download className="w-4 h-4" /> Export JSON
        </button>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={() => setShowImportModal(true)} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <Upload className="w-4 h-4" /> Import
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-dark-300">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-9 py-2 text-sm w-48"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="input-field py-2 text-sm w-auto"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="starred">Starred</option>
          </select>

          <select
            className="input-field py-2 text-sm w-auto"
            value={filterRating}
            onChange={e => setFilterRating(Number(e.target.value))}
          >
            <option value="0">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>

          {uniqueServices.length > 0 && (
            <select
              className="input-field py-2 text-sm w-auto"
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
            >
              <option value="">All Services</option>
              {uniqueServices.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          <select
            className="input-field py-2 text-sm w-auto"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Testimonial List */}
      {filteredTestimonials.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-200 mb-2">
            {testimonials.length === 0 ? 'No testimonials yet' : 'No matches found'}
          </h3>
          <p className="text-dark-400 mb-4">
            {testimonials.length === 0
              ? 'Share your collection link with clients to start gathering testimonials.'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {testimonials.length === 0 && (
            <button onClick={handleCopyLink} className="btn-primary inline-flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Copy Collection Link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTestimonials.map(t => (
            <div key={t.id} className="glass-card p-4 sm:p-5 transition-all duration-200 hover:border-dark-400/40">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Left: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-primary-500/20 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0">
                        {(t.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-dark-50">{t.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={
                            t.status === 'approved' ? { background: 'var(--success-soft)', color: 'var(--success)' } :
                            t.status === 'rejected' ? { background: 'var(--danger-soft)', color: 'var(--danger)' } :
                            { background: '#f59e0b20', color: 'var(--warning)' }
                          }>
                          {t.status}
                        </span>
                        {t.starred && <Star className="w-3.5 h-3.5" style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />}
                      </div>
                      <p className="text-sm text-dark-400">
                        {t.company && <span>{t.company}</span>}
                        {t.company && t.createdAt && <span> &middot; </span>}
                        {t.createdAt && <span>{formatDate(t.createdAt)}</span>}
                      </p>
                    </div>
                  </div>

                  {t.rating > 0 && (
                    <div className="mb-2 ml-[52px]">
                      <StarRating rating={t.rating} readOnly size="sm" />
                    </div>
                  )}

                  {editingId === t.id ? (
                    <div className="ml-[52px]">
                      <textarea
                        className="input-field text-sm min-h-[80px] mb-2"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="btn-primary text-xs py-1.5 px-3">Save</button>
                        <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-dark-200 text-sm leading-relaxed ml-[52px]">
                      "{t.testimonial}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 ml-[52px] flex-wrap">
                    {t.service && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                        {t.service}
                      </span>
                    )}
                    {t.projectName && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-dark-600 text-dark-300">
                        {t.projectName}
                      </span>
                    )}
                    {t.videoUrl && (
                      <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 underline">
                        Video
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center gap-1 flex-shrink-0">
                  {t.status !== 'approved' && (
                    <button onClick={() => handleApprove(t.id)} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }} title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {t.status !== 'rejected' && (
                    <button onClick={() => handleReject(t.id)} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }} title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleStar(t.id, t.starred)} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }} title="Star">
                    <Star className="w-4 h-4" style={t.starred ? { fill: 'var(--warning)', color: 'var(--warning)' } : {}} />
                  </button>
                  <button onClick={() => handleEdit(t)} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }} title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleCopyText(t)} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }} title="Copy">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }} title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Template Modal */}
      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Request Testimonial Email" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20 text-sm text-primary-300">
            <Award className="w-4 h-4 inline mr-2" />
            Tip: Send this within 48 hours of project completion for the best response rate!
          </div>
          <textarea
            className="input-field text-sm min-h-[300px] font-mono"
            value={generateEmailTemplate(settings)}
            readOnly
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateEmailTemplate(settings))
                showToast('Email template copied')
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy Template
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateCollectionLink(settings))
                showToast('Collection link copied')
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" /> Copy Link Only
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Testimonials">
        <div className="space-y-4">
          <p className="text-sm text-dark-300">Paste exported JSON data below to import testimonials.</p>
          <textarea
            className="input-field text-sm min-h-[200px] font-mono"
            placeholder='{"testimonials": [...], "settings": {...}}'
            value={importText}
            onChange={e => setImportText(e.target.value)}
          />
          <button onClick={handleImport} className="btn-primary w-full flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
