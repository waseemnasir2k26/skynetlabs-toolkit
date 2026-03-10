import { useState } from 'react'
import { Settings, Plus, X, Save, RotateCcw } from 'lucide-react'
import { useTestimonials } from '../contexts/TestimonialContext'
import Toast from '../components/Toast'

export default function SettingsPage() {
  const { settings, updateSettings } = useTestimonials()
  const [form, setForm] = useState({ ...settings })
  const [newService, setNewService] = useState('')
  const [toast, setToast] = useState(null)

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addService = () => {
    const s = newService.trim()
    if (s && !form.services.includes(s)) {
      updateField('services', [...form.services, s])
      setNewService('')
    }
  }

  const removeService = (service) => {
    updateField('services', form.services.filter(s => s !== service))
  }

  const handleSave = () => {
    updateSettings(form)
    setToast({ message: 'Settings saved successfully', type: 'success' })
  }

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      const defaults = {
        agencyName: 'Skynet Labs',
        agencyTagline: 'AI Automation Agency',
        services: ['Web Development', 'AI Automation', 'Chatbot Development', 'Process Automation', 'Consulting', 'Custom Software'],
        customQuestions: [],
        wallTitle: 'Wall of Love',
        wallSubtitle: 'See what our clients are saying about working with us',
        primaryColor: '#13b973',
        collectFormMessage: "We'd love to hear about your experience working with us!",
      }
      setForm(defaults)
      updateSettings(defaults)
      setToast({ message: 'Settings reset to defaults', type: 'info' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
          <Settings className="w-7 h-7 text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-dark-50 mb-2">Settings</h1>
        <p className="text-dark-300">Customize your testimonial collector and Wall of Love</p>
      </div>

      <div className="space-y-6">
        {/* Agency Info */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Agency Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Agency Name</label>
              <input
                type="text"
                className="input-field"
                value={form.agencyName}
                onChange={e => updateField('agencyName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Tagline</label>
              <input
                type="text"
                className="input-field"
                value={form.agencyTagline}
                onChange={e => updateField('agencyTagline', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Services</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {form.services.map(s => (
              <span key={s} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                {s}
                <button onClick={() => removeService(s)} className="hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Add a new service..."
              value={newService}
              onChange={e => setNewService(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
            />
            <button onClick={addService} className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Wall of Love Customization */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Wall of Love</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Wall Title</label>
              <input
                type="text"
                className="input-field"
                value={form.wallTitle}
                onChange={e => updateField('wallTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Wall Subtitle</label>
              <input
                type="text"
                className="input-field"
                value={form.wallSubtitle}
                onChange={e => updateField('wallSubtitle', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Collection Form */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Collection Form</h3>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Welcome Message</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              value={form.collectFormMessage}
              onChange={e => updateField('collectFormMessage', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
