const STORAGE_KEYS = {
  TESTIMONIALS: 'skynet_testimonials',
  SETTINGS: 'skynet_testimonial_settings',
}

const defaultSettings = {
  agencyName: 'Skynet Labs',
  agencyTagline: 'AI Automation Agency',
  services: [
    'Web Development',
    'AI Automation',
    'Chatbot Development',
    'Process Automation',
    'Consulting',
    'Custom Software',
  ],
  customQuestions: [],
  wallTitle: 'Wall of Love',
  wallSubtitle: 'See what our clients are saying about working with us',
  primaryColor: '#13b973',
  collectFormMessage: 'We\'d love to hear about your experience working with us!',
}

export function getTestimonials() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTestimonials(testimonials) {
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials))
}

export function addTestimonial(testimonial) {
  const testimonials = getTestimonials()
  const newTestimonial = {
    ...testimonial,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    starred: false,
  }
  testimonials.unshift(newTestimonial)
  saveTestimonials(testimonials)
  return newTestimonial
}

export function updateTestimonial(id, updates) {
  const testimonials = getTestimonials()
  const index = testimonials.findIndex(t => t.id === id)
  if (index !== -1) {
    testimonials[index] = { ...testimonials[index], ...updates }
    saveTestimonials(testimonials)
    return testimonials[index]
  }
  return null
}

export function deleteTestimonial(id) {
  const testimonials = getTestimonials().filter(t => t.id !== id)
  saveTestimonials(testimonials)
}

export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : { ...defaultSettings }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

export function exportTestimonialsJSON() {
  const testimonials = getTestimonials()
  const settings = getSettings()
  return JSON.stringify({ testimonials, settings, exportedAt: new Date().toISOString() }, null, 2)
}

export function exportTestimonialsCSV() {
  const testimonials = getTestimonials()
  const headers = ['Name', 'Company', 'Rating', 'Testimonial', 'Service', 'Status', 'Starred', 'Date', 'Video URL', 'Project Name']
  const rows = testimonials.map(t => [
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${(t.company || '').replace(/"/g, '""')}"`,
    t.rating || '',
    `"${(t.testimonial || '').replace(/"/g, '""')}"`,
    `"${(t.service || '').replace(/"/g, '""')}"`,
    t.status || '',
    t.starred ? 'Yes' : 'No',
    t.createdAt || '',
    `"${(t.videoUrl || '').replace(/"/g, '""')}"`,
    `"${(t.projectName || '').replace(/"/g, '""')}"`,
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function importTestimonialsJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (data.testimonials && Array.isArray(data.testimonials)) {
      const existing = getTestimonials()
      const existingIds = new Set(existing.map(t => t.id))
      const newOnes = data.testimonials.filter(t => !existingIds.has(t.id))
      saveTestimonials([...newOnes, ...existing])
      if (data.settings) {
        saveSettings({ ...getSettings(), ...data.settings })
      }
      return { imported: newOnes.length, skipped: data.testimonials.length - newOnes.length }
    }
    throw new Error('Invalid format')
  } catch (e) {
    throw new Error('Failed to import: ' + e.message)
  }
}

export function generateCollectionLink(settings) {
  const base = window.location.origin + window.location.pathname
  const params = new URLSearchParams()
  if (settings.agencyName) params.set('agency', settings.agencyName)
  if (settings.services?.length) params.set('services', settings.services.join('|'))
  return `${base}#/collect?${params.toString()}`
}

export function generateEmailTemplate(settings) {
  const link = generateCollectionLink(settings)
  return `Hi [Client Name],

Thank you so much for choosing ${settings.agencyName}! We truly enjoyed working with you on [Project Name].

We'd love to hear about your experience. Your feedback helps us improve and helps other potential clients learn about our work.

Would you mind taking 2 minutes to share a quick testimonial? You can do so here:

${link}

A few prompts to help you get started:
- What problem were you trying to solve?
- How did our work help your business?
- Would you recommend us to others?

Thank you for your time and support!

Best regards,
${settings.agencyName}

---
Tip: Testimonials work best when submitted within 48 hours of project completion, while the experience is still fresh!`
}
