import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useToast } from '../shared/Toast'

const PERSONAS = [
  'CEO',
  'Marketing Director',
  'Founder',
  'VP of Sales',
  'CTO',
  'Operations Manager',
  'Head of Growth',
  'Product Manager',
  'Director of Engineering',
  'CMO',
]

const INDUSTRIES = [
  'SaaS / Tech',
  'E-commerce',
  'Healthcare',
  'Real Estate',
  'Financial Services',
  'Education',
  'Agency / Consulting',
  'Manufacturing',
  'Hospitality',
  'Non-profit',
]

function generateSequence(persona, industry, service, valueProp) {
  const p = persona || 'decision-maker'
  const ind = industry || 'your industry'
  const svc = service || 'our service'
  const vp = valueProp || 'drive meaningful results'

  return [
    {
      day: 0,
      label: 'Initial Outreach',
      subject: `Quick question about [COMPANY]'s ${ind.toLowerCase()} strategy`,
      body: `Hi [PROSPECT_NAME],

I came across [COMPANY] and was impressed by what you're building in the ${ind.toLowerCase()} space.

As a ${p}, I imagine you're constantly looking for ways to ${vp.toLowerCase()}. We've helped similar companies in ${ind.toLowerCase()} achieve exactly that through ${svc.toLowerCase()}.

I'd love to share a quick idea that could help [COMPANY] - would you be open to a 15-minute call this week?

Best,
[YOUR_NAME]

P.S. No pitch, just a genuine conversation about what's working for others in ${ind.toLowerCase()}.`,
    },
    {
      day: 3,
      label: 'Follow-up with Social Proof',
      subject: `Re: [COMPANY] + [YOUR_NAME] - quick update`,
      body: `Hi [PROSPECT_NAME],

Following up on my last note. I wanted to share a quick win:

We recently helped a ${ind.toLowerCase()} company similar to [COMPANY] achieve [RESULT] in just 90 days using ${svc.toLowerCase()}.

Here's what their ${p} said: "Working with [YOUR_NAME]'s team was a game-changer. We saw results within the first month."

Would it be worth 15 minutes to explore if we could get similar results for [COMPANY]?

Best,
[YOUR_NAME]`,
    },
    {
      day: 7,
      label: 'Value-Add Content',
      subject: `[Free resource] ${ind} growth playbook for ${p}s`,
      body: `Hi [PROSPECT_NAME],

I put together a quick guide specifically for ${p}s in ${ind.toLowerCase()} on how to ${vp.toLowerCase()}.

Here are the top 3 takeaways:

1. Most ${ind.toLowerCase()} companies waste 30% of their budget on channels that don't convert. We help identify and eliminate those.

2. The highest-performing companies in your space are leveraging ${svc.toLowerCase()} to outpace competitors by 2-3x.

3. A simple framework for measuring ROI that takes 10 minutes to set up but saves hours per week.

Happy to send over the full guide if you're interested - just reply "send it."

Best,
[YOUR_NAME]`,
    },
    {
      day: 14,
      label: 'Case Study Share',
      subject: `How [similar company] grew revenue 3x with ${svc}`,
      body: `Hi [PROSPECT_NAME],

I thought you might find this relevant:

THE CHALLENGE:
A ${ind.toLowerCase()} company similar to [COMPANY] was struggling with the same challenges most ${p}s face - limited bandwidth, unclear ROI, and competitive pressure.

THE SOLUTION:
We implemented a tailored ${svc.toLowerCase()} strategy focused on their specific goals to ${vp.toLowerCase()}.

THE RESULTS:
- [RESULT] within the first 90 days
- 3x revenue growth in 6 months
- 40% reduction in customer acquisition costs

I genuinely believe we could achieve similar outcomes for [COMPANY]. Would you be open to a quick conversation?

Best,
[YOUR_NAME]`,
    },
    {
      day: 21,
      label: 'Break-up Email',
      subject: `Should I close your file, [PROSPECT_NAME]?`,
      body: `Hi [PROSPECT_NAME],

I've reached out a few times and haven't heard back - totally understand, you're busy running things at [COMPANY].

I don't want to be that person who won't take a hint, so this will be my last email.

If ${svc.toLowerCase()} is ever on your radar and you'd like to explore how it could help ${vp.toLowerCase()}, my door is always open.

Quick reply options:
1 - "Not interested" (I'll stop reaching out)
2 - "Bad timing, try me in [X] months"
3 - "Let's talk" (I'll send a calendar link)

Either way, I wish [COMPANY] continued success.

Best,
[YOUR_NAME]`,
    },
  ]
}

function EmailCard({ email, index, onUpdate, personalization }) {
  const [isEditing, setIsEditing] = useState(false)

  const personalizedBody = useMemo(() => {
    let text = email.body
    Object.entries(personalization).forEach(([token, value]) => {
      if (value) {
        text = text.replace(new RegExp(`\\[${token}\\]`, 'g'), value)
      }
    })
    return text
  }, [email.body, personalization])

  const personalizedSubject = useMemo(() => {
    let text = email.subject
    Object.entries(personalization).forEach(([token, value]) => {
      if (value) {
        text = text.replace(new RegExp(`\\[${token}\\]`, 'g'), value)
      }
    })
    return text
  }, [email.subject, personalization])

  const fullText = `Subject: ${personalizedSubject}\n\n${personalizedBody}`

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{email.label}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day {email.day}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all"
            style={{ background: 'var(--bg-card)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <CopyButton text={fullText} label="Copy" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4" style={{ background: 'var(--bg-card)' }}>
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Subject Line</label>
              <input
                type="text"
                value={email.subject}
                onChange={e => onUpdate({ ...email, subject: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Body</label>
              <textarea
                value={email.body}
                onChange={e => onUpdate({ ...email, body: e.target.value })}
                rows={12}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-y font-mono"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Subject: </span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{personalizedSubject}</span>
            </div>
            <pre
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--text-body)', fontFamily: 'inherit' }}
            >
              {personalizedBody}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [persona, setPersona] = useLocalStorage('skynet-cold-outreach-persona', 'CEO')
  const [industry, setIndustry] = useLocalStorage('skynet-cold-outreach-industry', 'SaaS / Tech')
  const [service, setService] = useLocalStorage('skynet-cold-outreach-service', 'performance marketing')
  const [valueProp, setValueProp] = useLocalStorage('skynet-cold-outreach-valueProp', 'increase qualified leads by 3x')
  const [prospectName, setProspectName] = useLocalStorage('skynet-cold-outreach-prospect', '')
  const [companyName, setCompanyName] = useLocalStorage('skynet-cold-outreach-company', '')
  const [yourName, setYourName] = useLocalStorage('skynet-cold-outreach-yourName', '')
  const [resultText, setResultText] = useLocalStorage('skynet-cold-outreach-result', '')
  const [sequence, setSequence] = useLocalStorage('skynet-cold-outreach-sequence', null)
  const toast = useToast()

  const personalization = useMemo(() => ({
    PROSPECT_NAME: prospectName,
    COMPANY: companyName,
    YOUR_NAME: yourName,
    SERVICE: service,
    RESULT: resultText,
  }), [prospectName, companyName, yourName, service, resultText])

  const handleGenerate = () => {
    const newSequence = generateSequence(persona, industry, service, valueProp)
    setSequence(newSequence)
    if (toast) toast('Outreach sequence generated!', 'success')
  }

  const updateEmail = (index, updated) => {
    setSequence(prev => prev.map((e, i) => i === index ? updated : e))
  }

  const exportFullSequence = () => {
    if (!sequence) return ''
    let text = `Cold Outreach Sequence\n${'='.repeat(24)}\n\n`
    text += `Target: ${persona} in ${industry}\n`
    text += `Service: ${service}\n`
    text += `Value Prop: ${valueProp}\n\n`
    text += `---\n\n`

    sequence.forEach((email, i) => {
      let subject = email.subject
      let body = email.body
      Object.entries(personalization).forEach(([token, value]) => {
        if (value) {
          subject = subject.replace(new RegExp(`\\[${token}\\]`, 'g'), value)
          body = body.replace(new RegExp(`\\[${token}\\]`, 'g'), value)
        }
      })
      text += `EMAIL ${i + 1}: ${email.label} (Day ${email.day})\n`
      text += `Subject: ${subject}\n\n`
      text += `${body}\n\n`
      text += `---\n\n`
    })
    return text
  }

  return (
    <ToolLayout
      title="Cold Outreach Sequence Builder"
      description="Build a personalized 5-email outreach sequence with proven frameworks and customizable templates."
      category="Ad Creative & Marketing"
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResultCard title="Sequence Settings" icon="&#9881;">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Target Persona</label>
                <select
                  value={persona}
                  onChange={e => setPersona(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                >
                  {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Industry</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                >
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Your Service</label>
                <input
                  type="text"
                  value={service}
                  onChange={e => setService(e.target.value)}
                  placeholder="e.g., performance marketing, web development..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Value Proposition</label>
                <input
                  type="text"
                  value={valueProp}
                  onChange={e => setValueProp(e.target.value)}
                  placeholder="e.g., increase qualified leads by 3x..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
              >
                Generate 5-Email Sequence
              </button>
            </div>
          </ResultCard>

          <ResultCard title="Personalization Tokens" icon="&#128100;">
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Fill in these fields to auto-replace tokens in your emails. Leave blank to keep the [TOKEN] placeholders.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>[PROSPECT_NAME]</label>
                <input
                  type="text"
                  value={prospectName}
                  onChange={e => setProspectName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>[COMPANY]</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>[YOUR_NAME]</label>
                <input
                  type="text"
                  value={yourName}
                  onChange={e => setYourName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>[RESULT]</label>
                <input
                  type="text"
                  value={resultText}
                  onChange={e => setResultText(e.target.value)}
                  placeholder="e.g., 150% increase in qualified leads"
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
            </div>
          </ResultCard>
        </div>

        {/* Timeline Visualization */}
        {sequence && (
          <ResultCard title="Sequence Timeline" icon="&#128197;">
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-4 top-0 bottom-0 w-0.5"
                style={{ background: 'var(--border)' }}
              />

              <div className="space-y-4">
                {sequence.map((email, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {/* Timeline dot */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10"
                      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                    >
                      D{email.day}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                          {email.label}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                        >
                          Day {email.day}
                        </span>
                        {idx > 0 && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            ({email.day - sequence[idx - 1].day} days after previous)
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                        Subject: {email.subject}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResultCard>
        )}

        {/* Email Sequence */}
        {sequence && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Email Sequence</h3>
              <CopyButton text={exportFullSequence()} label="Copy All Emails" />
            </div>

            {sequence.map((email, idx) => (
              <EmailCard
                key={idx}
                email={email}
                index={idx}
                onUpdate={updated => updateEmail(idx, updated)}
                personalization={personalization}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!sequence && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">&#9993;</div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>No Sequence Yet</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Fill in the settings above and click "Generate 5-Email Sequence" to create your outreach campaign.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
