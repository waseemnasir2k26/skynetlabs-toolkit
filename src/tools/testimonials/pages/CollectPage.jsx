import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Upload, CheckCircle, Camera, Sparkles } from 'lucide-react'
import StarRating from '../components/StarRating'
import { useTestimonials } from '../contexts/TestimonialContext'

export default function CollectPage() {
  const { addTestimonial, settings } = useTestimonials()
  const [searchParams] = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const agencyName = searchParams.get('agency') || settings.agencyName
  const servicesParam = searchParams.get('services')
  const services = servicesParam ? servicesParam.split('|') : settings.services

  const [form, setForm] = useState({
    name: '',
    company: '',
    photoUrl: '',
    rating: 0,
    testimonial: '',
    service: '',
    videoUrl: '',
    permission: false,
    projectName: '',
    projectDate: '',
  })

  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setPhotoPreview(dataUrl)
      updateField('photoUrl', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.rating === 0) errs.rating = 'Please select a rating'
    if (!form.testimonial.trim()) errs.testimonial = 'Please write a testimonial'
    if (form.testimonial.trim().length < 10) errs.testimonial = 'Please write at least 10 characters'
    if (!form.permission) errs.permission = 'Permission is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    addTestimonial({
      ...form,
      testimonial: form.testimonial.trim(),
      name: form.name.trim(),
      company: form.company.trim(),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-primary-500/20 border-2 border-primary-500/40 flex items-center justify-center mx-auto mb-6 animate-glow">
            <CheckCircle className="w-12 h-12 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-dark-50 mb-3">Thank You!</h2>
          <p className="text-dark-300 max-w-md mx-auto text-lg">
            Your testimonial has been submitted successfully. We truly appreciate you taking the time to share your experience!
          </p>
          <div className="mt-8">
            <Sparkles className="w-6 h-6 text-primary-400 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-dark-50 mb-2">
          Share Your Experience
        </h1>
        <p className="text-dark-300">
          {settings.collectFormMessage || `Tell us about your experience working with ${agencyName}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={`input-field ${errors.name ? 'border-red-500/50' : ''}`}
            placeholder="John Doe"
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Company / Role
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="CEO at Acme Inc."
            value={form.company}
            onChange={e => updateField('company', e.target.value)}
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            {(photoPreview || form.photoUrl) && (
              <img
                src={photoPreview || form.photoUrl}
                alt="Preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-primary-500/30"
              />
            )}
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer text-sm">
                <Camera className="w-4 h-4" />
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
              </label>
              <input
                type="url"
                className="input-field text-sm"
                placeholder="Or paste image URL..."
                value={photoPreview ? '' : form.photoUrl}
                onChange={e => { setPhotoPreview(null); updateField('photoUrl', e.target.value) }}
              />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Rating <span className="text-red-400">*</span>
          </label>
          <StarRating rating={form.rating} onChange={(r) => updateField('rating', r)} size="lg" />
          {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
        </div>

        {/* Testimonial */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Your Testimonial <span className="text-red-400">*</span>
          </label>
          <textarea
            className={`input-field min-h-[120px] resize-y ${errors.testimonial ? 'border-red-500/50' : ''}`}
            placeholder="Tell us about your experience... What problem did we help solve? How did our work impact your business?"
            value={form.testimonial}
            onChange={e => updateField('testimonial', e.target.value)}
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            {errors.testimonial ? (
              <p className="text-red-400 text-xs">{errors.testimonial}</p>
            ) : (
              <p className="text-dark-400 text-xs">Aim for 50-300 characters for the best impact</p>
            )}
            <p className={`text-xs ${form.testimonial.length > 1800 ? 'text-yellow-400' : 'text-dark-400'}`}>
              {form.testimonial.length}/2000
            </p>
          </div>
        </div>

        {/* Service */}
        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Service Received
            </label>
            <select
              className="input-field"
              value={form.service}
              onChange={e => updateField('service', e.target.value)}
            >
              <option value="">Select a service...</option>
              {services.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Project Name & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Project Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Website Redesign"
              value={form.projectName}
              onChange={e => updateField('projectName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Project Date
            </label>
            <input
              type="date"
              className="input-field"
              value={form.projectDate}
              onChange={e => updateField('projectDate', e.target.value)}
            />
          </div>
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Video Testimonial URL
          </label>
          <input
            type="url"
            className="input-field"
            placeholder="YouTube or Loom link..."
            value={form.videoUrl}
            onChange={e => updateField('videoUrl', e.target.value)}
          />
          <p className="text-dark-400 text-xs mt-1">Supports YouTube and Loom links</p>
        </div>

        {/* Permission */}
        <div>
          <label className={`flex items-start gap-3 cursor-pointer ${errors.permission ? 'text-red-400' : ''}`}>
            <input
              type="checkbox"
              checked={form.permission}
              onChange={e => updateField('permission', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-dark-400 bg-dark-700 text-primary-500 focus:ring-primary-500/30"
            />
            <span className="text-sm text-dark-200">
              I allow {agencyName} to use this testimonial on their website and marketing materials. <span className="text-red-400">*</span>
            </span>
          </label>
          {errors.permission && <p className="text-red-400 text-xs mt-1">{errors.permission}</p>}
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          Submit Testimonial
        </button>
      </form>
    </div>
  )
}
