import { useState, useMemo, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useToast } from '../shared/Toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const SERVICE_TYPES = ['Web Development', 'Design', 'SEO', 'Social Media', 'Content Writing', 'Consulting', 'Advertising', 'Email Marketing', 'Video Production', 'Other']

const EMPTY_CLIENT = { name: '', email: '', lastProject: '', serviceType: SERVICE_TYPES[0], lastContactDate: '', projectValue: '' }

const daysBetween = (d1, d2) => Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))

const getSegment = (lastContactDate) => {
  const days = daysBetween(new Date(lastContactDate), new Date())
  if (days <= 90) return { label: 'Recently Dormant', range: '1-3 months', color: 'var(--success)', order: 0 }
  if (days <= 180) return { label: 'Medium Dormant', range: '3-6 months', color: 'var(--info)', order: 1 }
  if (days <= 365) return { label: 'Long Dormant', range: '6-12 months', color: 'var(--warning)', order: 2 }
  return { label: 'Very Dormant', range: '12+ months', color: 'var(--danger)', order: 3 }
}

const EMAIL_TEMPLATES = {
  0: [
    {
      subject: 'Quick thought about {last_project}',
      body: `Hi {client_name},\n\nI was just reviewing some of the work we did together on {last_project}, and I wanted to reach out because I had a few ideas on how we could build on that success.\n\nSince we last worked together, I've been helping clients with some exciting {service} projects, and I thought of you.\n\nWould you be open to a quick 15-minute chat this week to explore some possibilities?\n\nBest,\n[Your Name]`
    },
    {
      subject: 'New {service} trends I thought you should know about',
      body: `Hi {client_name},\n\nHope you're doing well! I've been seeing some major shifts in {service} lately, and I immediately thought about how they could benefit your business.\n\nHere are 2-3 quick wins I think could move the needle for you:\n- [Specific improvement based on {service}]\n- [Emerging trend relevant to their industry]\n- [Quick optimization opportunity]\n\nWant me to put together a quick plan? No commitment needed - just want to make sure you don't miss out.\n\nCheers,\n[Your Name]`
    },
    {
      subject: 'A small thank you (and something for you)',
      body: `Hi {client_name},\n\nI was organizing my portfolio and came across our work on {last_project}. I just wanted to say thanks again - it was one of my favorite projects.\n\nAs a thank you, I'd love to offer you a complimentary {service} audit. No strings attached - just my way of staying connected and making sure everything is still performing well.\n\nInterested? Just reply and we'll set something up.\n\nWarmly,\n[Your Name]`
    },
  ],
  1: [
    {
      subject: 'It\'s been a while - checking in on {last_project}',
      body: `Hi {client_name},\n\nIt's been a few months since we wrapped up {last_project}, and I wanted to check in to see how things are going on your end.\n\nA lot has changed in the {service} space since then, and I've picked up some new skills and tools that could really help take things to the next level for you.\n\nI've set aside some availability this month specifically for past clients. Would you be interested in a catch-up call?\n\nLooking forward to hearing from you,\n[Your Name]`
    },
    {
      subject: 'I have a {service} idea specifically for you',
      body: `Hi {client_name},\n\nI know it's been a little while, but I was brainstorming ideas for a new project and your business kept coming to mind.\n\nBased on what I remember from {last_project}, here's what I'd recommend as a next step:\n\n[2-3 specific, actionable recommendations related to {service}]\n\nI've actually mapped out a rough plan. Want me to send it over? It's on the house.\n\nBest,\n[Your Name]`
    },
    {
      subject: 'Special offer for valued past clients',
      body: `Hi {client_name},\n\nI'm reaching out to a small group of past clients I really enjoyed working with, and you're on that list.\n\nI'm currently offering a special rate on {service} projects for returning clients - 15% off our standard pricing. I wanted to make sure you had first dibs before I open it up more broadly.\n\nThis would be perfect if you've been thinking about:\n- Refreshing or upgrading what we built with {last_project}\n- Starting something new in the {service} space\n- Getting a fresh audit of your current setup\n\nInterested? Let's chat.\n\nCheers,\n[Your Name]`
    },
  ],
  2: [
    {
      subject: 'Remember {last_project}? I have an update for you',
      body: `Hi {client_name},\n\nIt's been a while since our work on {last_project}, and I hope you're doing great.\n\nI've been thinking about your project because the {service} landscape has evolved significantly. Many of the strategies from last year have new, more effective alternatives, and I'd hate for you to fall behind.\n\nI put together a brief comparison of where things were vs. where they are now. Would you like me to share it?\n\nNo pressure at all - just want to make sure you're set up for success.\n\nBest regards,\n[Your Name]`
    },
    {
      subject: 'Your {service} might need a refresh - free assessment',
      body: `Hi {client_name},\n\nBased on when we completed {last_project}, your {service} setup is now 6-12 months old. In this industry, that's a lifetime.\n\nI'm offering free assessments to past clients to identify:\n- What's still working well\n- What might be holding you back\n- Quick wins you can implement immediately\n\nThe assessment takes about 30 minutes and you'll walk away with actionable insights regardless of whether we work together again.\n\nWant me to schedule one for you?\n\nCheers,\n[Your Name]`
    },
    {
      subject: 'Can I be honest with you, {client_name}?',
      body: `Hi {client_name},\n\nI'll be straightforward - I miss working with clients like you. Our {last_project} project was genuinely enjoyable and I was proud of the results.\n\nI've grown a lot since then. My {service} capabilities have expanded significantly, and I've got some new approaches that I think could really benefit your business.\n\nI'd love to reconnect, even if just for a coffee chat (virtual works too). No pitch, no pressure - just catching up and seeing where things stand.\n\nWhat do you say?\n\nWarmly,\n[Your Name]`
    },
  ],
  3: [
    {
      subject: 'Blast from the past - {client_name}, are you still in the game?',
      body: `Hi {client_name},\n\nIt's been over a year since we worked on {last_project} together, and I've been meaning to reach out.\n\nThe {service} world has changed dramatically since then. I'd genuinely love to know how things have been going for you and whether there's anything I can help with.\n\nEven if you're all set, I'd enjoy catching up. What do you say - 10 minutes for old times' sake?\n\nBest,\n[Your Name]`
    },
    {
      subject: 'I found something from our {last_project} work',
      body: `Hi {client_name},\n\nI was going through my archives and found our work from {last_project}. It brought back great memories of the project.\n\nIt also got me thinking - a lot has changed in {service} since then. If you haven't updated your approach, you might be leaving opportunities on the table.\n\nI've put together a quick "then vs. now" comparison that might interest you. Want me to send it over?\n\nHope you're well,\n[Your Name]`
    },
    {
      subject: 'Exclusive comeback offer for {client_name}',
      body: `Hi {client_name},\n\nI know it's been a long time, and I completely understand if priorities have shifted. But I wanted to make you an offer I don't typically extend.\n\nFor past clients I've worked with, I'm offering:\n- A free comprehensive {service} audit (valued at $500+)\n- 20% off any new project in the next 60 days\n- Priority scheduling and dedicated support\n\nI valued our work on {last_project} and would love the chance to work together again.\n\nNo strings attached on the audit - even if we don't move forward, you'll walk away with a roadmap.\n\nInterested?\n\n[Your Name]`
    },
  ],
}

export default function App() {
  const [clients, setClients] = useState([{ ...EMPTY_CLIENT, id: Date.now() }])
  const [editedEmails, setEditedEmails] = useState({})
  const [generated, setGenerated] = useState(false)
  const [csvError, setCsvError] = useState('')
  const exportRef = useRef(null)
  const toast = useToast()

  const addClient = () => setClients((prev) => [...prev, { ...EMPTY_CLIENT, id: Date.now() }])
  const removeClient = (id) => setClients((prev) => prev.filter((c) => c.id !== id))
  const updateClient = (id, field, value) => setClients((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c))

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target.result
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
        if (lines.length < 2) { setCsvError('CSV must have a header row and at least one data row.'); return }
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
        const nameIdx = headers.findIndex((h) => h.includes('name') && !h.includes('service'))
        const emailIdx = headers.findIndex((h) => h.includes('email'))
        const projectIdx = headers.findIndex((h) => h.includes('project'))
        const serviceIdx = headers.findIndex((h) => h.includes('service'))
        const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('contact'))
        const valueIdx = headers.findIndex((h) => h.includes('value') || h.includes('amount') || h.includes('revenue'))

        if (nameIdx === -1) { setCsvError('Could not find a "name" column in the CSV headers.'); return }

        const newClients = lines.slice(1).map((line) => {
          const cols = line.split(',').map((c) => c.trim())
          return {
            id: Date.now() + Math.random(),
            name: cols[nameIdx] || '',
            email: emailIdx >= 0 ? cols[emailIdx] : '',
            lastProject: projectIdx >= 0 ? cols[projectIdx] : '',
            serviceType: serviceIdx >= 0 ? (SERVICE_TYPES.find((s) => s.toLowerCase().includes(cols[serviceIdx]?.toLowerCase())) || cols[serviceIdx] || SERVICE_TYPES[0]) : SERVICE_TYPES[0],
            lastContactDate: dateIdx >= 0 ? cols[dateIdx] : '',
            projectValue: valueIdx >= 0 ? cols[valueIdx].replace(/[^0-9.]/g, '') : '',
          }
        }).filter((c) => c.name)

        if (newClients.length === 0) { setCsvError('No valid client data found in CSV.'); return }
        setClients(newClients)
      } catch {
        setCsvError('Failed to parse CSV file. Please check the format.')
      }
    }
    reader.readAsText(file)
  }

  const validClients = useMemo(() => clients.filter((c) => c.name && c.lastContactDate), [clients])

  const segmented = useMemo(() => {
    if (!generated || validClients.length === 0) return null
    const segments = {}
    validClients.forEach((c) => {
      const seg = getSegment(c.lastContactDate)
      if (!segments[seg.order]) segments[seg.order] = { ...seg, clients: [] }
      segments[seg.order].clients.push(c)
    })
    return Object.values(segments).sort((a, b) => a.order - b.order)
  }, [validClients, generated])

  const totalPotentialRevenue = useMemo(() => {
    if (!validClients.length) return 0
    return validClients.reduce((sum, c) => sum + (Number(c.projectValue) || 0), 0)
  }, [validClients])

  const personalizeEmail = (template, client) => {
    const key = `${client.id}-${template.subject}`
    if (editedEmails[key]) return editedEmails[key]
    return {
      subject: template.subject.replace(/{client_name}/g, client.name).replace(/{last_project}/g, client.lastProject || 'our last project').replace(/{service}/g, client.serviceType),
      body: template.body.replace(/{client_name}/g, client.name).replace(/{last_project}/g, client.lastProject || 'our last project').replace(/{service}/g, client.serviceType),
    }
  }

  const updateEmail = (clientId, templateSubject, field, value) => {
    const key = `${clientId}-${templateSubject}`
    setEditedEmails((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }))
  }

  const handleExportPDF = async () => {
    const el = exportRef.current
    if (!el) return
    const orig = { overflow: el.style.overflow, height: el.style.height, maxHeight: el.style.maxHeight }
    el.style.overflow = 'visible'
    el.style.height = 'auto'
    el.style.maxHeight = 'none'
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#f4f5f7' : '#050507' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ratio = pw / canvas.width
      const totalH = canvas.height * ratio
      let pos = 0
      while (pos < totalH) {
        if (pos > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -pos, pw, totalH)
        pos += ph
      }
      pdf.save('win-back-campaigns.pdf')
      if (toast) toast('Campaigns exported as PDF!', 'success')
    } finally {
      el.style.overflow = orig.overflow
      el.style.height = orig.height
      el.style.maxHeight = orig.maxHeight
    }
  }

  const [expandedClients, setExpandedClients] = useState(new Set())
  const toggleExpand = (id) => setExpandedClients((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <ToolLayout
      title="Win-Back Campaign Generator"
      description="Generate personalized email sequences to re-engage past clients, segmented by dormancy period."
    >
      {/* Input Section */}
      <ResultCard title="Past Clients" icon="📋" className="mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer" style={{ color: "var(--accent)", border: "1px solid var(--accent-soft)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          {csvError && <p className="text-sm self-center" style={{ color: "var(--danger)" }}>{csvError}</p>}
        </div>

        <div className="space-y-3 mb-4">
          {clients.map((client, idx) => (
            <div key={client.id} className="rounded-lg p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Client Name *</label>}
                  <input type="text" value={client.name} onChange={(e) => updateClient(client.id, 'name', e.target.value)} placeholder="Client name" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div>
                  {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Email</label>}
                  <input type="email" value={client.email} onChange={(e) => updateClient(client.id, 'email', e.target.value)} placeholder="email@example.com" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div>
                  {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Last Project</label>}
                  <input type="text" value={client.lastProject} onChange={(e) => updateClient(client.id, 'lastProject', e.target.value)} placeholder="Project name" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div>
                  {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Service Type</label>}
                  <select value={client.serviceType} onChange={(e) => updateClient(client.id, 'serviceType', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}>
                    {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Last Contact Date *</label>}
                  <input type="date" value={client.lastContactDate} onChange={(e) => updateClient(client.id, 'lastContactDate', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Project Value ($)</label>}
                    <input type="number" value={client.projectValue} onChange={(e) => updateClient(client.id, 'projectValue', e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                  </div>
                  <button onClick={() => removeClient(client.id)} className="py-2 px-3 rounded-lg transition-colors text-lg" style={{ color: "var(--danger)" }} title="Remove">&times;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={addClient} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: "var(--accent)", border: "1px solid var(--accent-soft)" }}>+ Add Client</button>
          <button
            onClick={() => setGenerated(true)}
            disabled={validClients.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed font-medium rounded-lg transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
          >
            Generate Win-Back Campaigns
          </button>
        </div>
      </ResultCard>

      {segmented && (
        <div ref={exportRef}>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {segmented.map((seg) => (
              <div key={seg.order} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <div className="text-2xl font-bold" style={{ color: seg.color }}>{seg.clients.length}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{seg.label}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{seg.range}</div>
              </div>
            ))}
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--accent-soft)" }}>
              <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>${totalPotentialRevenue.toLocaleString()}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Potential Revenue</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>to recover</div>
            </div>
          </div>

          {/* Segments with email sequences */}
          {segmented.map((seg) => (
            <ResultCard key={seg.order} title={`${seg.label} (${seg.range})`} icon="📧" className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{seg.clients.length} client{seg.clients.length !== 1 ? 's' : ''}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>|</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>${seg.clients.reduce((s, c) => s + (Number(c.projectValue) || 0), 0).toLocaleString()} potential</span>
              </div>

              {seg.clients.map((client) => (
                <div key={client.id} className="mb-4 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <button
                    onClick={() => toggleExpand(client.id)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors" style={{ background: "var(--bg-elevated)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium" style={{ color: "var(--text-heading)" }}>{client.name}</span>
                      {client.email && <span className="text-sm" style={{ color: "var(--text-muted)" }}>{client.email}</span>}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${expandedClients.has(client.id) ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedClients.has(client.id) && (
                    <div className="p-4 space-y-4">
                      {EMAIL_TEMPLATES[seg.order].map((template, emailIdx) => {
                        const email = personalizeEmail(template, client)
                        const key = `${client.id}-${template.subject}`
                        const editedSubject = editedEmails[key]?.subject
                        const editedBody = editedEmails[key]?.body
                        const displaySubject = editedSubject !== undefined ? editedSubject : email.subject
                        const displayBody = editedBody !== undefined ? editedBody : email.body
                        return (
                          <div key={emailIdx} className="rounded-lg p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>Email {emailIdx + 1} of 3</span>
                              <CopyButton text={`Subject: ${displaySubject}\n\n${displayBody}`} label="Copy" />
                            </div>
                            <div className="mb-2">
                              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Subject</label>
                              <input
                                type="text"
                                value={displaySubject}
                                onChange={(e) => updateEmail(client.id, template.subject, 'subject', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                              />
                            </div>
                            <div>
                              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Body</label>
                              <textarea
                                value={displayBody}
                                onChange={(e) => updateEmail(client.id, template.subject, 'body', e.target.value)}
                                rows={8}
                                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </ResultCard>
          ))}

          <div className="flex justify-center">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export All Sequences PDF
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
