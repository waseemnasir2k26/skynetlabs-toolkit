import { useState } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ShareButton from '../shared/ShareButton'

const MEETING_TYPES = ['Kickoff', 'Check-in', 'Review', 'Sales call', 'Scope discussion']

const AGENDA_TEMPLATES = {
  Kickoff: {
    blocks: [
      { time: '5 min', title: 'Welcome & Introductions', points: ['Introduce team members and roles', 'Set meeting ground rules'] },
      { time: '10 min', title: 'Project Overview & Goals', points: ['Review project objectives', 'Align on success metrics', 'Confirm project scope'] },
      { time: '15 min', title: 'Deliverables & Timeline', points: ['Walk through project phases', 'Review key milestones', 'Discuss dependencies and risks'] },
      { time: '10 min', title: 'Communication & Process', points: ['Agree on communication channels', 'Set meeting cadence', 'Define approval workflow'] },
      { time: '5 min', title: 'Tools & Access', points: ['Confirm tool access (project management, files, etc.)', 'Share relevant credentials and links'] },
      { time: '5 min', title: 'Next Steps & Action Items', points: ['Assign immediate action items', 'Confirm next meeting date', 'Open floor for questions'] },
    ],
    decisions: ['Project start date', 'Communication channel', 'Meeting cadence', 'Primary point of contact'],
  },
  'Check-in': {
    blocks: [
      { time: '5 min', title: 'Quick Status Update', points: ['Progress since last meeting', 'Percentage of milestones completed'] },
      { time: '10 min', title: 'Work Completed', points: ['Review completed deliverables', 'Demo any new features or assets'] },
      { time: '10 min', title: 'Upcoming Work', points: ['Preview next phase tasks', 'Identify upcoming deadlines'] },
      { time: '10 min', title: 'Blockers & Issues', points: ['Discuss any roadblocks', 'Address pending decisions', 'Review scope change requests'] },
      { time: '5 min', title: 'Action Items & Next Steps', points: ['Assign follow-up tasks', 'Confirm next check-in date'] },
    ],
    decisions: ['Approval of completed work', 'Priority of remaining tasks', 'Resolution of blockers'],
  },
  Review: {
    blocks: [
      { time: '5 min', title: 'Meeting Purpose & Context', points: ['State review objectives', 'Set expectations for feedback'] },
      { time: '20 min', title: 'Deliverable Walkthrough', points: ['Present completed work in detail', 'Demonstrate functionality or designs', 'Highlight key decisions made'] },
      { time: '15 min', title: 'Feedback & Discussion', points: ['Gather client feedback', 'Discuss revision requests', 'Identify areas for improvement'] },
      { time: '5 min', title: 'Revision Plan & Next Steps', points: ['Summarize requested changes', 'Estimate revision timeline', 'Confirm approval criteria'] },
    ],
    decisions: ['Approval or revision of deliverables', 'Revision scope and priority', 'Timeline adjustments'],
  },
  'Sales call': {
    blocks: [
      { time: '5 min', title: 'Introduction & Rapport Building', points: ['Personal connection', 'Acknowledge their business'] },
      { time: '10 min', title: 'Discovery & Pain Points', points: ['Ask about current challenges', 'Understand their goals', 'Identify decision-making process'] },
      { time: '10 min', title: 'Solution Presentation', points: ['Present relevant services', 'Share case studies or examples', 'Connect solutions to their specific needs'] },
      { time: '10 min', title: 'Pricing & Scope Discussion', points: ['Present pricing structure', 'Discuss project scope options', 'Address budget considerations'] },
      { time: '5 min', title: 'Objection Handling & Q&A', points: ['Address concerns', 'Provide additional information', 'Share testimonials or references'] },
      { time: '5 min', title: 'Next Steps & Close', points: ['Propose next action', 'Set follow-up timeline', 'Send proposal or materials'] },
    ],
    decisions: ['Interest level and fit', 'Budget range', 'Decision timeline', 'Next step commitment'],
  },
  'Scope discussion': {
    blocks: [
      { time: '5 min', title: 'Current Scope Review', points: ['Review existing SOW or project scope', 'Identify what has changed'] },
      { time: '15 min', title: 'Change Request Details', points: ['Document requested changes', 'Understand the business reason', 'Assess impact on existing deliverables'] },
      { time: '10 min', title: 'Impact Assessment', points: ['Timeline impact', 'Budget impact', 'Resource impact', 'Risk assessment'] },
      { time: '10 min', title: 'Options & Recommendations', points: ['Present scope options', 'Discuss trade-offs', 'Recommend approach'] },
      { time: '5 min', title: 'Decision & Next Steps', points: ['Agree on scope changes', 'Update timeline and budget', 'Document change order'] },
    ],
    decisions: ['Scope change approval', 'Budget adjustment', 'Timeline modification', 'Priority re-ordering'],
  },
}

function generateAgenda(clientName, meetingType, topicsText) {
  const template = AGENDA_TEMPLATES[meetingType] || AGENDA_TEMPLATES['Check-in']
  const topics = topicsText.split('\n').map((t) => t.trim()).filter(Boolean)

  // Merge user topics into agenda blocks
  const blocks = template.blocks.map((block, i) => {
    const additionalPoints = []
    topics.forEach((topic) => {
      const lower = topic.toLowerCase()
      const blockLower = block.title.toLowerCase()
      // Match topics to relevant blocks by keyword proximity
      if (
        (blockLower.includes('status') && (lower.includes('update') || lower.includes('progress') || lower.includes('status'))) ||
        (blockLower.includes('deliverable') && (lower.includes('deliver') || lower.includes('feature') || lower.includes('design') || lower.includes('build'))) ||
        (blockLower.includes('feedback') && (lower.includes('feedback') || lower.includes('review') || lower.includes('opinion'))) ||
        (blockLower.includes('blocker') && (lower.includes('block') || lower.includes('issue') || lower.includes('problem') || lower.includes('risk'))) ||
        (blockLower.includes('timeline') && (lower.includes('deadline') || lower.includes('timeline') || lower.includes('schedule') || lower.includes('date'))) ||
        ((blockLower.includes('budget') || blockLower.includes('pricing')) && (lower.includes('budget') || lower.includes('cost') || lower.includes('price'))) ||
        (blockLower.includes('scope') && (lower.includes('scope') || lower.includes('change') || lower.includes('add') || lower.includes('remove'))) ||
        (blockLower.includes('discovery') && (lower.includes('goal') || lower.includes('challenge') || lower.includes('pain') || lower.includes('need'))) ||
        (blockLower.includes('next') && (lower.includes('next') || lower.includes('action') || lower.includes('follow')))
      ) {
        additionalPoints.push(`Discuss: ${topic}`)
      }
    })
    return { ...block, points: [...block.points, ...additionalPoints] }
  })

  // Any unmatched topics go into a custom discussion block
  const matchedTopics = new Set()
  blocks.forEach((block) => {
    block.points.forEach((p) => {
      if (p.startsWith('Discuss: ')) matchedTopics.add(p.replace('Discuss: ', ''))
    })
  })
  const unmatched = topics.filter((t) => !matchedTopics.has(t))
  if (unmatched.length > 0) {
    blocks.splice(blocks.length - 1, 0, {
      time: `${Math.max(5, unmatched.length * 3)} min`,
      title: 'Additional Discussion Topics',
      points: unmatched.map((t) => `Discuss: ${t}`),
    })
  }

  const totalMinutes = blocks.reduce((sum, b) => sum + parseInt(b.time), 0)

  return {
    clientName,
    meetingType,
    blocks,
    decisions: template.decisions,
    totalMinutes,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  }
}

function agendaToText(agenda) {
  let text = `MEETING AGENDA\n${'='.repeat(40)}\n`
  text += `Client: ${agenda.clientName}\n`
  text += `Type: ${agenda.meetingType}\n`
  text += `Date: ${agenda.date}\n`
  text += `Duration: ~${agenda.totalMinutes} minutes\n\n`

  agenda.blocks.forEach((block, i) => {
    text += `[${block.time}] ${block.title}\n`
    block.points.forEach((p) => { text += `  - ${p}\n` })
    text += '\n'
  })

  text += `DECISIONS NEEDED\n${'-'.repeat(30)}\n`
  agenda.decisions.forEach((d) => { text += `  [ ] ${d}\n` })

  return text
}

// Post-meeting processing
const ACTION_KEYWORDS = ['will', 'should', 'need to', 'must', 'going to', 'has to', 'assigned to', 'responsible for', 'action:', 'todo:', 'task:', 'follow up', 'follow-up', 'send', 'create', 'build', 'deliver', 'prepare', 'schedule', 'set up', 'setup', 'complete', 'finish', 'update', 'review', 'approve']
const DECISION_KEYWORDS = ['decided', 'agreed', 'approved', 'confirmed', 'selected', 'chose', 'will go with', 'decision:', 'we\'ll', 'we will', 'final', 'signed off', 'greenlit']
const QUESTION_KEYWORDS = ['?', 'tbd', 'to be determined', 'need to clarify', 'unclear', 'pending', 'open question', 'still need', 'waiting on', 'don\'t know', 'unsure']

function processNotes(clientName, rawNotes) {
  const lines = rawNotes.split('\n').map((l) => l.trim()).filter(Boolean)

  const decisions = []
  const actionItems = []
  const questions = []
  const summaryPoints = []

  lines.forEach((line) => {
    const lower = line.toLowerCase()
    const cleanLine = line.replace(/^[-*>#\d.)\]]+\s*/, '').trim()
    if (!cleanLine) return

    let isDecision = false
    let isAction = false
    let isQuestion = false

    // Check for decisions
    for (const kw of DECISION_KEYWORDS) {
      if (lower.includes(kw)) { isDecision = true; break }
    }

    // Check for action items
    for (const kw of ACTION_KEYWORDS) {
      if (lower.includes(kw)) { isAction = true; break }
    }

    // Check for questions
    for (const kw of QUESTION_KEYWORDS) {
      if (lower.includes(kw)) { isQuestion = true; break }
    }

    if (isDecision) decisions.push(cleanLine)
    if (isAction && !isDecision) {
      // Try to extract who/what
      let who = 'TBD'
      let deadline = 'TBD'
      const whoPatterns = [
        /(\w+)\s+will\b/i,
        /(\w+)\s+should\b/i,
        /(\w+)\s+needs?\s+to\b/i,
        /assigned\s+to\s+(\w+)/i,
        /(\w+)\s+is\s+going\s+to\b/i,
        /(\w+)\s+has\s+to\b/i,
      ]
      for (const p of whoPatterns) {
        const match = cleanLine.match(p)
        if (match) { who = match[1].charAt(0).toUpperCase() + match[1].slice(1); break }
      }
      // Try to extract deadline
      const deadlinePatterns = [
        /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
        /by\s+(next\s+week|end\s+of\s+week|end\s+of\s+day|eod|eow|tomorrow)/i,
        /by\s+(\d{1,2}\/\d{1,2})/i,
        /due\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
        /due\s+(\d{1,2}\/\d{1,2})/i,
        /(asap|urgent|immediately)/i,
      ]
      for (const p of deadlinePatterns) {
        const match = cleanLine.match(p)
        if (match) { deadline = match[1]; break }
      }
      actionItems.push({ who, what: cleanLine, deadline })
    }
    if (isQuestion) questions.push(cleanLine)
    if (!isDecision && !isAction && !isQuestion) {
      summaryPoints.push(cleanLine)
    }
  })

  // Generate follow-up email
  const email = generateFollowUpEmail(clientName, decisions, actionItems, questions, summaryPoints)

  return { decisions, actionItems, questions, summaryPoints, email }
}

function generateFollowUpEmail(clientName, decisions, actionItems, questions, summaryPoints) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  let email = `Subject: Meeting Follow-Up - ${today}\n\n`
  email += `Hi ${clientName},\n\n`
  email += `Thank you for your time today. Here is a summary of our discussion and the agreed-upon next steps.\n\n`

  if (summaryPoints.length > 0) {
    email += `KEY DISCUSSION POINTS:\n`
    summaryPoints.slice(0, 5).forEach((p) => { email += `  - ${p}\n` })
    email += '\n'
  }

  if (decisions.length > 0) {
    email += `DECISIONS MADE:\n`
    decisions.forEach((d) => { email += `  - ${d}\n` })
    email += '\n'
  }

  if (actionItems.length > 0) {
    email += `ACTION ITEMS:\n`
    actionItems.forEach((a) => {
      email += `  - ${a.what}`
      if (a.who !== 'TBD') email += ` (Owner: ${a.who})`
      if (a.deadline !== 'TBD') email += ` [Due: ${a.deadline}]`
      email += '\n'
    })
    email += '\n'
  }

  if (questions.length > 0) {
    email += `OPEN QUESTIONS (to be resolved):\n`
    questions.forEach((q) => { email += `  - ${q}\n` })
    email += '\n'
  }

  email += `Please review the above and let me know if I missed anything or if any corrections are needed.\n\n`
  email += `Looking forward to our continued collaboration.\n\n`
  email += `Best regards`

  return email
}

function PreMeetingTab() {
  const [clientName, setClientName] = useLocalStorage('skynet-meeting-pre-client', '')
  const [meetingType, setMeetingType] = useLocalStorage('skynet-meeting-pre-type', 'Check-in')
  const [topics, setTopics] = useLocalStorage('skynet-meeting-pre-topics', '')
  const [agenda, setAgenda] = useLocalStorage('skynet-meeting-pre-agenda', null)

  const canGenerate = clientName.trim()

  const handleGenerate = () => {
    if (!canGenerate) return
    setAgenda(generateAgenda(clientName.trim(), meetingType, topics))
  }

  const inputClass = 'w-full rounded-lg px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 transition text-sm'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)', '--tw-ring-color': 'var(--accent-soft)' }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <ResultCard title="Meeting Setup" icon="📅">
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Client Name *</label>
            <input type="text" className={inputClass} style={inputStyle} placeholder="e.g., Acme Corp" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Meeting Type</label>
            <select className={inputClass} style={inputStyle} value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
              {MEETING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Key Topics (one per line)</label>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              style={inputStyle}
              placeholder="e.g.,&#10;Website redesign progress&#10;Budget review for Q2&#10;New feature request"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={5}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-2.5 font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Generate Agenda
          </button>
        </div>
      </ResultCard>

      {/* Output */}
      <div>
        {agenda ? (
          <ResultCard title="Generated Agenda" icon="📋">
            <div className="flex gap-2 mb-4">
              <CopyButton text={agendaToText(agenda)} label="Copy Agenda" />
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Client: <span style={{ color: 'var(--text-heading)' }}>{agenda.clientName}</span></p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Type: <span style={{ color: 'var(--text-heading)' }}>{agenda.meetingType}</span></p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Date: <span style={{ color: 'var(--text-heading)' }}>{agenda.date}</span></p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Estimated Duration: <span style={{ color: 'var(--text-heading)' }}>~{agenda.totalMinutes} min</span></p>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {agenda.blocks.map((block, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{block.time}</span>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{block.title}</h4>
                  </div>
                  <ul className="space-y-1">
                    {block.points.map((p, j) => (
                      <li key={j} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="mt-0.5 text-xs" style={{ color: 'var(--accent)' }}>&#8226;</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Decisions Needed */}
              <div className="rounded-lg p-3" style={{ background: 'var(--warning-soft)', border: '1px solid color-mix(in srgb, var(--warning) 20%, transparent)' }}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--warning)' }}>Decisions Needed</h4>
                <ul className="space-y-1">
                  {agenda.decisions.map((d, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span className="mt-0.5" style={{ color: 'var(--warning)' }}>&#9744;</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ResultCard>
        ) : (
          <ResultCard title="Agenda Preview" icon="📋">
            <div className="text-center py-16">
              <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No agenda generated yet</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter a client name and click "Generate Agenda" to create a structured meeting agenda.</p>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  )
}

function PostMeetingTab() {
  const [clientName, setClientName] = useLocalStorage('skynet-meeting-post-client', '')
  const [rawNotes, setRawNotes] = useLocalStorage('skynet-meeting-post-notes', '')
  const [result, setResult] = useLocalStorage('skynet-meeting-post-result', null)

  const canProcess = clientName.trim() && rawNotes.trim()

  const handleProcess = () => {
    if (!canProcess) return
    setResult(processNotes(clientName.trim(), rawNotes))
  }

  const inputClass = 'w-full rounded-lg px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 transition text-sm'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)', '--tw-ring-color': 'var(--accent-soft)' }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <ResultCard title="Meeting Notes" icon="📝">
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Client Name *</label>
            <input type="text" className={inputClass} style={inputStyle} placeholder="e.g., Acme Corp" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Raw Meeting Notes *</label>
            <textarea
              className={`${inputClass} min-h-[200px] resize-y`}
              style={inputStyle}
              placeholder="Paste your raw meeting notes here...&#10;&#10;e.g.,&#10;Discussed the new homepage design. John will send updated wireframes by Friday.&#10;Decided to go with Option B for the color scheme.&#10;Budget is TBD - need to clarify with finance team.&#10;Sarah needs to review the content by next week."
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              rows={10}
            />
          </div>
          <button
            onClick={handleProcess}
            disabled={!canProcess}
            className="w-full py-2.5 font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Process Notes
          </button>
        </div>
      </ResultCard>

      {/* Output */}
      <div className="space-y-4">
        {result ? (
          <>
            {/* Decisions */}
            {result.decisions.length > 0 && (
              <ResultCard title="Decisions Made" icon="&#9989;">
                <ul className="space-y-1.5">
                  {result.decisions.map((d, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-body)' }}>
                      <span className="mt-0.5" style={{ color: 'var(--success)' }}>&#10003;</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {/* Action Items */}
            {result.actionItems.length > 0 && (
              <ResultCard title="Action Items" icon="&#128203;">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>Who</th>
                        <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>What</th>
                        <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.actionItems.map((a, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-2 pr-3 font-medium whitespace-nowrap" style={{ color: 'var(--accent)' }}>{a.who}</td>
                          <td className="py-2 pr-3" style={{ color: 'var(--text-body)' }}>{a.what}</td>
                          <td className="py-2 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{a.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ResultCard>
            )}

            {/* Open Questions */}
            {result.questions.length > 0 && (
              <ResultCard title="Open Questions" icon="&#10067;">
                <ul className="space-y-1.5">
                  {result.questions.map((q, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-body)' }}>
                      <span className="mt-0.5" style={{ color: 'var(--warning)' }}>?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {/* Follow-up Email */}
            <ResultCard title="Follow-Up Email" icon="&#9993;">
              <div className="flex gap-2 mb-3">
                <CopyButton text={result.email} label="Copy Email" />
              </div>
              <pre className="rounded-lg p-4 text-sm whitespace-pre-wrap font-sans overflow-x-auto max-h-[40vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-body)' }}>
                {result.email}
              </pre>
            </ResultCard>

            {result.decisions.length === 0 && result.actionItems.length === 0 && result.questions.length === 0 && (
              <ResultCard>
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No structured items were extracted. Try adding more detail to your notes with action words like "will", "decided", "need to", etc.</p>
                </div>
              </ResultCard>
            )}
          </>
        ) : (
          <ResultCard title="Processed Notes" icon="&#128203;">
            <div className="text-center py-16">
              <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No notes processed yet</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Paste your raw meeting notes and click "Process Notes" to extract decisions, action items, and generate a follow-up email.</p>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('pre')

  return (
    <ToolLayout
      title="AI Meeting Lifecycle Manager"
      description="Prepare structured agendas before meetings and process raw notes into actionable items afterward."
    >
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 mb-6 w-fit" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('pre')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition"
          style={activeTab === 'pre'
            ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
            : { color: 'var(--text-muted)' }
          }
        >
          Pre-Meeting
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition"
          style={activeTab === 'post'
            ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
            : { color: 'var(--text-muted)' }
          }
        >
          Post-Meeting
        </button>
        <ShareButton getShareURL={() => window.location.href} />
      </div>

      {activeTab === 'pre' ? <PreMeetingTab /> : <PostMeetingTab />}
    </ToolLayout>
  )
}
