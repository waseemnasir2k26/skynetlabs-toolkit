import React, { useState, useMemo } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ShareButton from '../shared/ShareButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { generateId } from '../shared/utils'

const SECTIONS = {
  business_info: {
    label: 'Business Info',
    icon: '\uD83C\uDFE2',
    fields: [
      { key: 'businessName', label: 'Business Name', type: 'text' },
      { key: 'industry', label: 'Industry', type: 'text' },
      { key: 'website', label: 'Website URL', type: 'text' },
      { key: 'yearFounded', label: 'Year Founded', type: 'text' },
      { key: 'teamSize', label: 'Team Size', type: 'text' },
      { key: 'businessDescription', label: 'Business Description', type: 'textarea' },
    ],
  },
  brand_assets: {
    label: 'Brand Assets',
    icon: '\uD83C\uDFA8',
    fields: [
      { key: 'primaryColors', label: 'Primary Brand Colors', type: 'text' },
      { key: 'fonts', label: 'Brand Fonts', type: 'text' },
      { key: 'logoUrl', label: 'Logo URL / Drive Link', type: 'text' },
      { key: 'brandGuidelines', label: 'Brand Guidelines Link', type: 'text' },
      { key: 'brandVoice', label: 'Brand Voice / Tone', type: 'textarea' },
    ],
  },
  account_access: {
    label: 'Account Access',
    icon: '\uD83D\uDD11',
    fields: [
      { key: 'hostingProvider', label: 'Hosting Provider', type: 'text' },
      { key: 'domainRegistrar', label: 'Domain Registrar', type: 'text' },
      { key: 'analyticsAccess', label: 'Analytics Access (GA, etc.)', type: 'text' },
      { key: 'socialAccounts', label: 'Social Media Accounts', type: 'textarea' },
      { key: 'additionalAccess', label: 'Additional Access Needed', type: 'textarea' },
    ],
  },
  target_audience: {
    label: 'Target Audience',
    icon: '\uD83C\uDFAF',
    fields: [
      { key: 'demographics', label: 'Demographics', type: 'textarea' },
      { key: 'painPoints', label: 'Pain Points', type: 'textarea' },
      { key: 'buyingBehavior', label: 'Buying Behavior', type: 'textarea' },
      { key: 'idealCustomer', label: 'Ideal Customer Profile', type: 'textarea' },
    ],
  },
  competitor_info: {
    label: 'Competitor Info',
    icon: '\uD83D\uDD0D',
    fields: [
      { key: 'competitor1', label: 'Competitor 1 (Name & URL)', type: 'text' },
      { key: 'competitor2', label: 'Competitor 2 (Name & URL)', type: 'text' },
      { key: 'competitor3', label: 'Competitor 3 (Name & URL)', type: 'text' },
      { key: 'differentiators', label: 'What makes you different?', type: 'textarea' },
    ],
  },
  project_goals: {
    label: 'Project Goals',
    icon: '\uD83D\uDE80',
    fields: [
      { key: 'primaryGoal', label: 'Primary Goal', type: 'text' },
      { key: 'secondaryGoals', label: 'Secondary Goals', type: 'textarea' },
      { key: 'kpis', label: 'Key Performance Indicators', type: 'textarea' },
      { key: 'timeline', label: 'Desired Timeline', type: 'text' },
      { key: 'budget', label: 'Budget Range', type: 'text' },
    ],
  },
  communication: {
    label: 'Communication Preferences',
    icon: '\uD83D\uDCAC',
    fields: [
      { key: 'primaryContact', label: 'Primary Contact Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'preferredChannel', label: 'Preferred Communication Channel', type: 'text' },
      { key: 'meetingFrequency', label: 'Preferred Meeting Frequency', type: 'text' },
      { key: 'timezone', label: 'Timezone', type: 'text' },
    ],
  },
}

const ALL_SECTION_KEYS = Object.keys(SECTIONS)

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{title}</h2>
          <button onClick={onClose} className="transition-colors text-2xl leading-none hover:opacity-80" style={{ color: 'var(--text-muted)' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ field, value, onChange }) {
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }
  return (
    <div>
      <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} rows={3} className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none resize-none" style={inputStyle} placeholder={`Enter ${field.label.toLowerCase()}...`} />
      ) : (
        <input type="text" value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none" style={inputStyle} placeholder={`Enter ${field.label.toLowerCase()}...`} />
      )}
    </div>
  )
}

export default function App() {
  const [sessions, setSessions] = useLocalStorage('skynet-onboarding-sessions', [])
  const [view, setView] = useState('admin') // admin | setup | fill | preview | brief
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [setupSections, setSetupSections] = useState([...ALL_SECTION_KEYS])
  const [formName, setFormName] = useState('')

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null

  // Setup view: create new onboarding form
  const toggleSection = (key) => {
    setSetupSections((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const createSession = () => {
    if (!formName.trim()) return
    const session = {
      id: generateId(),
      name: formName.trim(),
      sections: setupSections,
      data: {},
      createdAt: new Date().toISOString(),
      status: 'in_progress',
    }
    setSessions((prev) => [...prev, session])
    setCurrentSessionId(session.id)
    setFormName('')
    setView('fill')
  }

  const updateSessionData = (sectionKey, fieldKey, value) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, data: { ...s.data, [sectionKey]: { ...(s.data[sectionKey] || {}), [fieldKey]: value } } }
          : s
      )
    )
  }

  const markComplete = () => {
    setSessions((prev) => prev.map((s) => s.id === currentSessionId ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s))
    setView('brief')
  }

  const deleteSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (currentSessionId === id) {
      setCurrentSessionId(null)
      setView('admin')
    }
  }

  // Calculate completion
  const getCompletion = (session) => {
    if (!session) return { percent: 0, filled: 0, total: 0, missing: [] }
    let total = 0
    let filled = 0
    const missing = []
    session.sections.forEach((sk) => {
      const sec = SECTIONS[sk]
      if (!sec) return
      sec.fields.forEach((f) => {
        total++
        if (session.data[sk]?.[f.key]?.trim()) {
          filled++
        } else {
          missing.push(`${sec.label}: ${f.label}`)
        }
      })
    })
    return { percent: total ? Math.round((filled / total) * 100) : 0, filled, total, missing }
  }

  // Generate project brief text
  const generateBrief = (session) => {
    if (!session) return ''
    let brief = `PROJECT BRIEF: ${session.name}\n${'='.repeat(50)}\nGenerated: ${new Date().toLocaleDateString()}\n\n`
    session.sections.forEach((sk) => {
      const sec = SECTIONS[sk]
      if (!sec) return
      brief += `\n${sec.icon} ${sec.label.toUpperCase()}\n${'-'.repeat(30)}\n`
      sec.fields.forEach((f) => {
        const val = session.data[sk]?.[f.key] || 'Not provided'
        brief += `${f.label}: ${val}\n`
      })
    })
    return brief
  }

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }

  // Admin view
  if (view === 'admin') {
    return (
      <ToolLayout title="Client Onboarding Portal" description="Create and manage client onboarding forms, track completion, and generate project briefs.">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>All Onboarding Sessions</h2>
          <button onClick={() => setView('setup')} className="px-5 py-2 rounded-xl font-medium transition-colors text-sm hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
            + New Onboarding Form
          </button>
        </div>

        {sessions.length === 0 ? (
          <ResultCard>
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No onboarding sessions yet. Create your first onboarding form to get started.</p>
          </ResultCard>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const comp = getCompletion(session)
              return (
                <div key={session.id} className="rounded-xl p-5 transition-all" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>{session.name}</h3>
                        <span className="px-2.5 py-0.5 text-xs rounded-full font-medium" style={session.status === 'completed' ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { background: 'var(--warning-soft)', color: 'var(--warning)' }}>
                          {session.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Created: {new Date(session.createdAt).toLocaleDateString()} | Sections: {session.sections.length}</p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${comp.percent}%`, background: 'var(--accent)' }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{comp.percent}%</span>
                      </div>
                      {comp.missing.length > 0 && comp.missing.length <= 5 && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Missing: {comp.missing.join(', ')}</p>
                      )}
                      {comp.missing.length > 5 && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{comp.missing.length} fields remaining</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => { setCurrentSessionId(session.id); setView('fill') }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                      >Edit</button>
                      <button
                        onClick={() => { setCurrentSessionId(session.id); setView('preview') }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                      >Preview</button>
                      {session.status === 'completed' && (
                        <button
                          onClick={() => { setCurrentSessionId(session.id); setView('brief') }}
                          className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >Brief</button>
                      )}
                      <button onClick={() => deleteSession(session.id)} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Delete</button>
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

  // Setup view
  if (view === 'setup') {
    return (
      <ToolLayout title="Client Onboarding Portal" description="Create a new onboarding form by selecting sections.">
        <button onClick={() => setView('admin')} className="text-sm mb-6 inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          &larr; Back to Sessions
        </button>

        <ResultCard title="Create Onboarding Form" icon="\uD83D\uDCCB">
          <div className="mb-6">
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Client / Session Name *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"
              style={inputStyle}
              placeholder="e.g., Acme Corp Onboarding"
            />
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Select sections to include in the onboarding form:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {ALL_SECTION_KEYS.map((key) => {
              const sec = SECTIONS[key]
              const selected = setupSections.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all text-left"
                  style={selected ? { border: '1px solid var(--accent)', background: 'var(--accent-soft)' } : { border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
                >
                  <span className="text-xl">{sec.icon}</span>
                  <div>
                    <p className="font-medium" style={{ color: selected ? 'var(--text-heading)' : 'var(--text-muted)' }}>{sec.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sec.fields.length} fields</p>
                  </div>
                  {selected && <span className="ml-auto" style={{ color: 'var(--accent)' }}>{'\u2713'}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setView('admin')} className="px-4 py-2 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            <button
              onClick={createSession}
              disabled={!formName.trim() || setupSections.length === 0}
              className="px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-colors hover:opacity-80"
              style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
            >Create Form</button>
          </div>
        </ResultCard>
      </ToolLayout>
    )
  }

  // Fill view
  if (view === 'fill' && currentSession) {
    const comp = getCompletion(currentSession)
    return (
      <ToolLayout title="Client Onboarding Portal" description={`Filling: ${currentSession.name}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setView('admin'); setCurrentSessionId(null) }} className="text-sm inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            &larr; Back to Sessions
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${comp.percent}%`, background: 'var(--accent)' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{comp.percent}%</span>
            </div>
            <button onClick={markComplete} className="px-4 py-2 rounded-xl font-medium transition-colors text-sm hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
              Mark Complete & Generate Brief
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {currentSession.sections.map((sk) => {
            const sec = SECTIONS[sk]
            if (!sec) return null
            return (
              <ResultCard key={sk} title={sec.label} icon={sec.icon}>
                <div className="space-y-4">
                  {sec.fields.map((f) => (
                    <FormField
                      key={f.key}
                      field={f}
                      value={currentSession.data[sk]?.[f.key] || ''}
                      onChange={(fieldKey, val) => updateSessionData(sk, fieldKey, val)}
                    />
                  ))}
                </div>
              </ResultCard>
            )
          })}
        </div>
      </ToolLayout>
    )
  }

  // Preview view
  if (view === 'preview' && currentSession) {
    return (
      <ToolLayout title="Client Onboarding Portal" description={`Preview: ${currentSession.name}`}>
        <button onClick={() => { setView('admin'); setCurrentSessionId(null) }} className="text-sm mb-6 inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          &larr; Back to Sessions
        </button>

        <div className="rounded-2xl p-8 max-w-3xl mx-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Client Onboarding Form</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please fill in the information below to help us get started on your project.</p>
          </div>

          {currentSession.sections.map((sk) => {
            const sec = SECTIONS[sk]
            if (!sec) return null
            return (
              <div key={sk} className="mb-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                  <span>{sec.icon}</span> {sec.label}
                </h3>
                <div className="space-y-4">
                  {sec.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                      <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        {currentSession.data[sk]?.[f.key] || 'Awaiting response...'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ToolLayout>
    )
  }

  // Brief view
  if (view === 'brief' && currentSession) {
    const briefText = generateBrief(currentSession)
    return (
      <ToolLayout title="Client Onboarding Portal" description={`Project Brief: ${currentSession.name}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setView('admin'); setCurrentSessionId(null) }} className="text-sm inline-flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            &larr; Back to Sessions
          </button>
          <div className="flex gap-3">
            <CopyButton text={briefText} label="Copy Brief" />
            <ShareButton getShareURL={() => window.location.href} />
          </div>
        </div>

        <ResultCard title="Project Brief" icon="\uD83D\uDCCB">
          <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed" style={{ color: 'var(--text-body)' }}>{briefText}</pre>
        </ResultCard>
      </ToolLayout>
    )
  }

  // Fallback
  return (
    <ToolLayout title="Client Onboarding Portal" description="Manage client onboarding forms.">
      <button onClick={() => { setView('admin'); setCurrentSessionId(null) }} className="px-4 py-2 rounded-xl" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Go to Dashboard</button>
    </ToolLayout>
  )
}
