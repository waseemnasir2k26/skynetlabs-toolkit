import { useState, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'
import ScoreGauge from '../shared/ScoreGauge'
import FormInput from '../shared/FormInput'
import FormSelect from '../shared/FormSelect'
import FormTextarea from '../shared/FormTextarea'
import { generateId } from '../shared/utils'
import { useToast } from '../shared/Toast'

// ─── Constants ───────────────────────────────────────────────────────────────

const PERSONAS = [
  'CEO', 'Marketing Director', 'Founder', 'VP of Sales', 'CTO',
  'Operations Manager', 'Head of Growth', 'Product Manager',
  'Director of Engineering', 'CMO',
]

const INDUSTRIES = [
  'SaaS / Tech', 'E-commerce', 'Healthcare', 'Real Estate',
  'Financial Services', 'Education', 'Agency / Consulting',
  'Manufacturing', 'Hospitality', 'Non-profit',
]

const CHANNELS = {
  email: { label: 'Email', icon: '\u2709\uFE0F', color: 'var(--info)', charLimit: null },
  linkedin_connect: { label: 'LinkedIn Connection', icon: '\uD83D\uDD17', color: '#0A66C2', charLimit: 300 },
  linkedin_message: { label: 'LinkedIn Message', icon: '\uD83D\uDCAC', color: '#0A66C2', charLimit: null },
  linkedin_comment: { label: 'LinkedIn Comment', icon: '\uD83D\uDCDD', color: '#0A66C2', charLimit: null },
  twitter_dm: { label: 'Twitter/X DM', icon: '\uD83D\uDC26', color: '#1DA1F2', charLimit: 10000 },
  call_script: { label: 'Follow-up Call', icon: '\uD83D\uDCDE', color: 'var(--success)', charLimit: null },
}

const CHANNEL_OPTIONS = Object.entries(CHANNELS).map(([value, ch]) => ({
  value,
  label: `${ch.icon} ${ch.label}`,
}))

const TOKENS = [
  { token: 'PROSPECT_NAME', placeholder: 'John Smith', label: '[PROSPECT_NAME]' },
  { token: 'COMPANY', placeholder: 'Acme Corp', label: '[COMPANY]' },
  { token: 'YOUR_NAME', placeholder: 'Your Name', label: '[YOUR_NAME]' },
  { token: 'RESULT', placeholder: '150% increase in leads', label: '[RESULT]' },
  { token: 'ROLE', placeholder: 'VP of Marketing', label: '[ROLE]' },
  { token: 'INDUSTRY', placeholder: 'SaaS', label: '[INDUSTRY]' },
  { token: 'MUTUAL_CONNECTION', placeholder: 'Sarah Johnson', label: '[MUTUAL_CONNECTION]' },
  { token: 'RECENT_POST', placeholder: 'your post about AI trends', label: '[RECENT_POST]' },
]

const POWER_WORDS = [
  'exclusive', 'proven', 'results', 'growth', 'revenue', 'transform',
  'breakthrough', 'strategy', 'opportunity', 'insights', 'quick',
  'free', 'limited', 'guaranteed', 'secret', 'powerful', 'boost',
  'unlock', 'discover', 'instantly', 'save', 'accelerate',
]

const RESPONSE_RATES = {
  email: 0.08,
  linkedin_connect: 0.30,
  linkedin_message: 0.18,
  linkedin_comment: 0.05,
  twitter_dm: 0.06,
  call_script: 0.12,
}

// ─── Campaign Template Generators ────────────────────────────────────────────

function buildTemplateSteps(persona, industry, service, valueProp) {
  const p = persona || 'decision-maker'
  const ind = industry || 'your industry'
  const svc = service || 'our service'
  const vp = valueProp || 'drive meaningful results'

  return {
    'linkedin-first': [
      {
        id: generateId(), day: 0, channel: 'linkedin_connect', label: 'LinkedIn Connection Request',
        subject: '',
        body: `Hi [PROSPECT_NAME], I came across [COMPANY] and was impressed by what you're building in ${ind.toLowerCase()}. As someone working with ${p}s in this space, I'd love to connect and share ideas. - [YOUR_NAME]`,
        subjectB: '',
      },
      {
        id: generateId(), day: 1, channel: 'linkedin_message', label: 'LinkedIn Message',
        subject: `Quick idea for [COMPANY]`,
        body: `Hi [PROSPECT_NAME], thanks for connecting! I noticed [COMPANY] is doing great work in ${ind.toLowerCase()}.\n\nI recently helped a similar company achieve [RESULT] through ${svc.toLowerCase()}, and I had a quick idea that could help you ${vp.toLowerCase()}.\n\nWould you be open to a 15-minute chat this week?\n\nBest,\n[YOUR_NAME]`,
        subjectB: '',
      },
      {
        id: generateId(), day: 3, channel: 'email', label: 'Email #1 - Introduction',
        subject: `Quick question about [COMPANY]'s ${ind.toLowerCase()} strategy`,
        body: `Hi [PROSPECT_NAME],\n\nI reached out on LinkedIn earlier - wanted to follow up here as well.\n\nAs a ${p}, I imagine you're constantly looking for ways to ${vp.toLowerCase()}. We've helped similar companies in ${ind.toLowerCase()} achieve exactly that through ${svc.toLowerCase()}.\n\nI'd love to share a quick idea that could help [COMPANY] - would you be open to a 15-minute call this week?\n\nBest,\n[YOUR_NAME]\n\nP.S. No pitch, just a genuine conversation about what's working for others in ${ind.toLowerCase()}.`,
        subjectB: `[PROSPECT_NAME], a thought on [COMPANY]'s growth`,
      },
      {
        id: generateId(), day: 7, channel: 'email', label: 'Email #2 - Value Add',
        subject: `[Free resource] ${ind} growth playbook for ${p}s`,
        body: `Hi [PROSPECT_NAME],\n\nI put together a quick guide specifically for ${p}s in ${ind.toLowerCase()} on how to ${vp.toLowerCase()}.\n\nHere are the top 3 takeaways:\n\n1. Most ${ind.toLowerCase()} companies waste 30% of their budget on channels that don't convert.\n\n2. The highest-performing companies in your space are leveraging ${svc.toLowerCase()} to outpace competitors by 2-3x.\n\n3. A simple framework for measuring ROI that takes 10 minutes to set up.\n\nHappy to send over the full guide - just reply "send it."\n\nBest,\n[YOUR_NAME]`,
        subjectB: `${p}s in ${ind.toLowerCase()} are doing this differently`,
      },
      {
        id: generateId(), day: 14, channel: 'call_script', label: 'Follow-up Call',
        subject: '',
        body: `CALL SCRIPT - [PROSPECT_NAME] at [COMPANY]\n\nOpening:\n"Hi [PROSPECT_NAME], this is [YOUR_NAME]. I sent you a couple of messages about ${svc.toLowerCase()} - do you have a quick minute?"\n\nIf yes:\n"Great. I'll be brief. We recently helped a company similar to [COMPANY] achieve [RESULT] through ${svc.toLowerCase()}. I had a specific idea for how you could ${vp.toLowerCase()} and wanted to see if it'd be worth a 15-minute deeper dive."\n\nIf not now:\n"Totally understand. When would be a better time for a 5-minute call? I promise to keep it short."\n\nObjection handling:\n- "Not interested" -> "I completely understand. Mind if I ask - is it the timing, or is ${svc.toLowerCase()} just not a priority right now?"\n- "Send me an email" -> "Absolutely. I'll send something short with a case study that might be relevant. What's the best email?"\n- "We already have a solution" -> "Great to hear you're investing in this. Out of curiosity, are you seeing the results you expected? We often help teams optimize what they already have."`,
        subjectB: '',
      },
    ],
    'email-blitz': [
      {
        id: generateId(), day: 0, channel: 'email', label: 'Email #1 - Initial Outreach',
        subject: `Quick question about [COMPANY]'s ${ind.toLowerCase()} strategy`,
        body: `Hi [PROSPECT_NAME],\n\nI came across [COMPANY] and was impressed by what you're building in the ${ind.toLowerCase()} space.\n\nAs a ${p}, I imagine you're constantly looking for ways to ${vp.toLowerCase()}. We've helped similar companies in ${ind.toLowerCase()} achieve exactly that through ${svc.toLowerCase()}.\n\nI'd love to share a quick idea that could help [COMPANY] - would you be open to a 15-minute call this week?\n\nBest,\n[YOUR_NAME]\n\nP.S. No pitch, just a genuine conversation about what's working for others in ${ind.toLowerCase()}.`,
        subjectB: `Idea for [COMPANY]'s ${ind.toLowerCase()} growth`,
      },
      {
        id: generateId(), day: 3, channel: 'email', label: 'Email #2 - Social Proof',
        subject: `Re: [COMPANY] + [YOUR_NAME] - quick update`,
        body: `Hi [PROSPECT_NAME],\n\nFollowing up on my last note. I wanted to share a quick win:\n\nWe recently helped a ${ind.toLowerCase()} company similar to [COMPANY] achieve [RESULT] in just 90 days using ${svc.toLowerCase()}.\n\nHere's what their ${p} said: "Working with [YOUR_NAME]'s team was a game-changer. We saw results within the first month."\n\nWould it be worth 15 minutes to explore if we could get similar results for [COMPANY]?\n\nBest,\n[YOUR_NAME]`,
        subjectB: `How a company like [COMPANY] achieved [RESULT]`,
      },
      {
        id: generateId(), day: 7, channel: 'email', label: 'Email #3 - Value-Add Content',
        subject: `[Free resource] ${ind} growth playbook for ${p}s`,
        body: `Hi [PROSPECT_NAME],\n\nI put together a quick guide specifically for ${p}s in ${ind.toLowerCase()} on how to ${vp.toLowerCase()}.\n\nTop 3 takeaways:\n\n1. Most ${ind.toLowerCase()} companies waste 30% of their budget on channels that don't convert. We help identify and eliminate those.\n\n2. The highest-performing companies in your space are leveraging ${svc.toLowerCase()} to outpace competitors by 2-3x.\n\n3. A simple framework for measuring ROI that takes 10 minutes to set up but saves hours per week.\n\nHappy to send over the full guide if you're interested - just reply "send it."\n\nBest,\n[YOUR_NAME]`,
        subjectB: `3 insights for ${p}s in ${ind.toLowerCase()}`,
      },
      {
        id: generateId(), day: 14, channel: 'email', label: 'Email #4 - Case Study',
        subject: `How [similar company] grew revenue 3x with ${svc}`,
        body: `Hi [PROSPECT_NAME],\n\nI thought you might find this relevant:\n\nTHE CHALLENGE:\nA ${ind.toLowerCase()} company similar to [COMPANY] was struggling with the same challenges most ${p}s face - limited bandwidth, unclear ROI, and competitive pressure.\n\nTHE SOLUTION:\nWe implemented a tailored ${svc.toLowerCase()} strategy focused on their specific goals to ${vp.toLowerCase()}.\n\nTHE RESULTS:\n- [RESULT] within the first 90 days\n- 3x revenue growth in 6 months\n- 40% reduction in customer acquisition costs\n\nI genuinely believe we could achieve similar outcomes for [COMPANY]. Would you be open to a quick conversation?\n\nBest,\n[YOUR_NAME]`,
        subjectB: `Case study: ${ind.toLowerCase()} company achieves [RESULT]`,
      },
      {
        id: generateId(), day: 21, channel: 'email', label: 'Email #5 - Break-up',
        subject: `Should I close your file, [PROSPECT_NAME]?`,
        body: `Hi [PROSPECT_NAME],\n\nI've reached out a few times and haven't heard back - totally understand, you're busy running things at [COMPANY].\n\nI don't want to be that person who won't take a hint, so this will be my last email.\n\nIf ${svc.toLowerCase()} is ever on your radar and you'd like to explore how it could help ${vp.toLowerCase()}, my door is always open.\n\nQuick reply options:\n1 - "Not interested" (I'll stop reaching out)\n2 - "Bad timing, try me in [X] months"\n3 - "Let's talk" (I'll send a calendar link)\n\nEither way, I wish [COMPANY] continued success.\n\nBest,\n[YOUR_NAME]`,
        subjectB: `Closing the loop, [PROSPECT_NAME]`,
      },
    ],
    'social-warmup': [
      {
        id: generateId(), day: 0, channel: 'linkedin_comment', label: 'LinkedIn Comment on Their Post',
        subject: '',
        body: `Great insight, [PROSPECT_NAME]! I've seen the same trend in ${ind.toLowerCase()} - especially around ${svc.toLowerCase()}. The companies getting ahead are the ones investing early. Would love to hear more about how [COMPANY] is approaching this.`,
        subjectB: '',
      },
      {
        id: generateId(), day: 2, channel: 'linkedin_connect', label: 'LinkedIn Connection Request',
        subject: '',
        body: `Hi [PROSPECT_NAME], I really enjoyed [RECENT_POST]. As someone who works with ${p}s in ${ind.toLowerCase()}, I'd love to connect and exchange ideas. - [YOUR_NAME]`,
        subjectB: '',
      },
      {
        id: generateId(), day: 4, channel: 'linkedin_message', label: 'LinkedIn DM - Value First',
        subject: `Thought of [COMPANY] when I saw this`,
        body: `Hi [PROSPECT_NAME], thanks for connecting!\n\nI recently put together some research on how ${ind.toLowerCase()} companies are using ${svc.toLowerCase()} to ${vp.toLowerCase()}. Thought it might be relevant for [COMPANY].\n\nHappy to share it - no strings attached.\n\nBest,\n[YOUR_NAME]`,
        subjectB: '',
      },
      {
        id: generateId(), day: 7, channel: 'twitter_dm', label: 'Twitter/X DM',
        subject: '',
        body: `Hey [PROSPECT_NAME]! Loved your recent thoughts on ${ind.toLowerCase()} trends. I work with ${p}s like yourself on ${svc.toLowerCase()} - helped one company achieve [RESULT] recently. Would you be open to a quick chat? No pitch, just ideas.`,
        subjectB: '',
      },
      {
        id: generateId(), day: 10, channel: 'email', label: 'Email - Warm Introduction',
        subject: `Following up from LinkedIn, [PROSPECT_NAME]`,
        body: `Hi [PROSPECT_NAME],\n\nWe've been connecting on LinkedIn and I wanted to reach out directly.\n\nI specialize in helping ${p}s in ${ind.toLowerCase()} ${vp.toLowerCase()} through ${svc.toLowerCase()}. Recently helped a similar company achieve [RESULT].\n\nI have a couple of specific ideas for [COMPANY] that I think could be valuable. Would you be open to a 15-minute call?\n\nBest,\n[YOUR_NAME]`,
        subjectB: `[PROSPECT_NAME], quick idea for [COMPANY]`,
      },
      {
        id: generateId(), day: 14, channel: 'email', label: 'Email - Case Study Follow-up',
        subject: `How a ${ind.toLowerCase()} company achieved [RESULT]`,
        body: `Hi [PROSPECT_NAME],\n\nQuick follow-up with a concrete example:\n\nA company similar to [COMPANY] was struggling to ${vp.toLowerCase()}. After implementing ${svc.toLowerCase()}, they achieved [RESULT] in 90 days.\n\nI'd love to walk you through what they did - it's directly applicable to [COMPANY].\n\n15 minutes this week?\n\nBest,\n[YOUR_NAME]`,
        subjectB: `[COMPANY] could see similar results`,
      },
      {
        id: generateId(), day: 17, channel: 'email', label: 'Email - Break-up',
        subject: `Closing the loop, [PROSPECT_NAME]`,
        body: `Hi [PROSPECT_NAME],\n\nI've tried a few channels to reach you and I respect your time. This will be my last message.\n\nIf ${svc.toLowerCase()} ever becomes a priority for [COMPANY], I'm just a reply away.\n\nWishing you continued success,\n[YOUR_NAME]`,
        subjectB: `Last note from me, [PROSPECT_NAME]`,
      },
      {
        id: generateId(), day: 21, channel: 'call_script', label: 'Follow-up Call (Final Attempt)',
        subject: '',
        body: `CALL SCRIPT - [PROSPECT_NAME] at [COMPANY]\n\nOpening:\n"Hi [PROSPECT_NAME], this is [YOUR_NAME]. We've connected on LinkedIn and I sent a couple of messages about ${svc.toLowerCase()}. Do you have just 2 minutes?"\n\nValue pitch:\n"I'll be super brief. We helped a company in ${ind.toLowerCase()} achieve [RESULT] through ${svc.toLowerCase()}, and I had a specific idea for [COMPANY]. Worth a 15-minute call to explore?"\n\nClose:\n"Would [suggest two specific times] work for a quick chat?"`,
        subjectB: '',
      },
    ],
    'conference-followup': [
      {
        id: generateId(), day: 0, channel: 'email', label: 'Email - Conference Follow-up',
        subject: `Great meeting you at [EVENT], [PROSPECT_NAME]!`,
        body: `Hi [PROSPECT_NAME],\n\nIt was great meeting you at the conference! I really enjoyed our conversation about ${ind.toLowerCase()} and the challenges ${p}s face.\n\nAs I mentioned, we specialize in ${svc.toLowerCase()} and have been helping companies like [COMPANY] ${vp.toLowerCase()}.\n\nI'd love to continue our conversation - would you be open to a 20-minute call this week to explore how we might be able to help?\n\nBest,\n[YOUR_NAME]`,
        subjectB: `Following up from [EVENT] - [YOUR_NAME]`,
      },
      {
        id: generateId(), day: 1, channel: 'linkedin_connect', label: 'LinkedIn Connection',
        subject: '',
        body: `Hi [PROSPECT_NAME]! Great meeting you at the conference. Enjoyed our chat about ${ind.toLowerCase()} - would love to stay connected. - [YOUR_NAME]`,
        subjectB: '',
      },
      {
        id: generateId(), day: 4, channel: 'email', label: 'Email - Value-Add Follow-up',
        subject: `The resource I mentioned, [PROSPECT_NAME]`,
        body: `Hi [PROSPECT_NAME],\n\nFollowing up on our conversation - I wanted to share the case study I mentioned where we helped a ${ind.toLowerCase()} company achieve [RESULT] through ${svc.toLowerCase()}.\n\nKey takeaways:\n- 3x improvement in core metrics within 90 days\n- 40% cost reduction in customer acquisition\n- Scalable framework that works across ${ind.toLowerCase()}\n\nWould love to walk you through how this could apply to [COMPANY]. Got 15 minutes this week?\n\nBest,\n[YOUR_NAME]`,
        subjectB: `That case study for [COMPANY], [PROSPECT_NAME]`,
      },
      {
        id: generateId(), day: 7, channel: 'linkedin_message', label: 'LinkedIn Follow-up',
        subject: `Following up`,
        body: `Hi [PROSPECT_NAME], hope you're doing well since the conference!\n\nI sent over a case study by email that I think would be really relevant for [COMPANY]. Did you get a chance to look at it?\n\nHappy to jump on a quick call to discuss.\n\nBest,\n[YOUR_NAME]`,
        subjectB: '',
      },
      {
        id: generateId(), day: 10, channel: 'call_script', label: 'Follow-up Call',
        subject: '',
        body: `CALL SCRIPT - [PROSPECT_NAME] at [COMPANY]\n\nOpening:\n"Hi [PROSPECT_NAME], this is [YOUR_NAME] - we met at [EVENT] and chatted about ${svc.toLowerCase()}. How are you?"\n\nTransition:\n"I sent over a case study that I think is really relevant for [COMPANY]. I wanted to quickly walk you through the key points - do you have 5 minutes?"\n\nPitch:\n"A company very similar to [COMPANY] was facing [challenge]. Through ${svc.toLowerCase()}, they achieved [RESULT]. I had a couple of specific ideas for how [COMPANY] could see similar results."\n\nClose:\n"Would it make sense to block 20 minutes next week to dive deeper?"`,
        subjectB: '',
      },
    ],
  }
}

const TEMPLATE_OPTIONS = [
  { value: 'linkedin-first', label: '\uD83D\uDD17 LinkedIn-First' },
  { value: 'email-blitz', label: '\u2709\uFE0F Email Blitz (Classic 5-Email)' },
  { value: 'social-warmup', label: '\uD83C\uDF10 Social Warm-Up' },
  { value: 'conference-followup', label: '\uD83C\uDF9F\uFE0F Conference Follow-Up' },
]

// ─── Utility Functions ───────────────────────────────────────────────────────

function applyTokens(text, personalization) {
  let result = text
  Object.entries(personalization).forEach(([token, value]) => {
    if (value) {
      result = result.replace(new RegExp(`\\[${token}\\]`, 'g'), value)
    }
  })
  return result
}

function scoreSubjectLine(subject) {
  if (!subject) return 0
  let score = 30
  if (subject.length >= 20 && subject.length <= 60) score += 20
  else if (subject.length >= 10 && subject.length <= 80) score += 10
  const lowerSubject = subject.toLowerCase()
  const powerWordCount = POWER_WORDS.filter(w => lowerSubject.includes(w)).length
  score += Math.min(powerWordCount * 10, 25)
  const hasToken = /\[.+?\]/.test(subject)
  if (hasToken) score += 25
  return Math.min(score, 100)
}

function computeCampaignScore(steps) {
  if (!steps || steps.length === 0) return 0
  let score = 0
  const channelTypes = new Set(steps.map(s => s.channel))
  if (channelTypes.size >= 3) score += 25
  else if (channelTypes.size >= 2) score += 15
  const allText = steps.map(s => `${s.subject || ''} ${s.body || ''}`).join(' ')
  const tokenCount = (allText.match(/\[.+?\]/g) || []).length
  if (tokenCount >= 6) score += 20
  else if (tokenCount >= 3) score += 12
  else if (tokenCount >= 1) score += 6
  const days = steps.map(s => s.day).sort((a, b) => a - b)
  if (days.length >= 2) {
    const gaps = []
    for (let i = 1; i < days.length; i++) gaps.push(days[i] - days[i - 1])
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
    if (avgGap >= 2 && avgGap <= 5) score += 20
    else if (avgGap >= 1 && avgGap <= 7) score += 12
    else score += 5
  }
  if (steps.length >= 7 && steps.length <= 10) score += 15
  else if (steps.length >= 5 && steps.length <= 12) score += 10
  else if (steps.length >= 3) score += 5
  const hasBreakup = steps.some(s =>
    (s.label || '').toLowerCase().includes('break') ||
    (s.body || '').toLowerCase().includes('last email') ||
    (s.body || '').toLowerCase().includes('last message') ||
    (s.body || '').toLowerCase().includes('close your file')
  )
  if (hasBreakup) score += 10
  const hasCall = steps.some(s => s.channel === 'call_script')
  if (hasCall) score += 10
  return Math.min(score, 100)
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Good'
  if (score >= 30) return 'Needs Work'
  return 'Weak'
}

// ─── StepCard Component ──────────────────────────────────────────────────────

function StepCard({ step, index, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast, personalization }) {
  const [isEditing, setIsEditing] = useState(false)
  const channel = CHANNELS[step.channel] || CHANNELS.email
  const isEmail = step.channel === 'email'
  const isLinkedInConnect = step.channel === 'linkedin_connect'

  const personalizedBody = useMemo(() => applyTokens(step.body, personalization), [step.body, personalization])
  const personalizedSubject = useMemo(() => applyTokens(step.subject || '', personalization), [step.subject, personalization])
  const charCount = step.body ? step.body.length : 0
  const overLimit = channel.charLimit && charCount > channel.charLimit

  const scoreA = useMemo(() => isEmail ? scoreSubjectLine(step.subject) : 0, [isEmail, step.subject])
  const scoreB = useMemo(() => isEmail && step.subjectB ? scoreSubjectLine(step.subjectB) : 0, [isEmail, step.subjectB])

  const fullText = step.subject
    ? `Subject: ${personalizedSubject}\n\n${personalizedBody}`
    : personalizedBody

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            {channel.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{step.label}</p>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-page)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                {channel.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day {step.day}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!isFirst && (
            <button onClick={onMoveUp} className="p-1.5 rounded-md transition-all" style={{ color: 'var(--text-muted)' }} title="Move up">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
          )}
          {!isLast && (
            <button onClick={onMoveDown} className="p-1.5 rounded-md transition-all" style={{ color: 'var(--text-muted)' }} title="Move down">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all"
            style={{ background: 'var(--bg-card)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <CopyButton text={fullText} label="Copy" />
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md transition-all"
            style={{ color: 'var(--danger)' }}
            title="Remove step"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" style={{ background: 'var(--bg-card)' }}>
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput
                label="Day"
                type="number"
                value={step.day}
                onChange={e => onUpdate({ ...step, day: parseInt(e.target.value) || 0 })}
              />
              <FormSelect
                label="Channel"
                value={step.channel}
                options={CHANNEL_OPTIONS}
                placeholder=""
                onChange={e => onUpdate({ ...step, channel: e.target.value })}
              />
              <FormInput
                label="Step Label"
                value={step.label}
                onChange={e => onUpdate({ ...step, label: e.target.value })}
              />
            </div>
            {step.channel !== 'linkedin_connect' && step.channel !== 'linkedin_comment' && step.channel !== 'twitter_dm' && step.channel !== 'call_script' && (
              <div className="space-y-2">
                <FormInput
                  label="Subject Line (Version A)"
                  value={step.subject}
                  onChange={e => onUpdate({ ...step, subject: e.target.value })}
                  placeholder="Enter subject line..."
                />
                {isEmail && (
                  <FormInput
                    label="Subject Line (Version B) - A/B Test"
                    value={step.subjectB || ''}
                    onChange={e => onUpdate({ ...step, subjectB: e.target.value })}
                    placeholder="Optional A/B variant..."
                    helpText="Leave blank to skip A/B testing for this step"
                  />
                )}
                {isEmail && step.subject && (
                  <div className="flex flex-wrap gap-4 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>A score:</span>
                      <span className="text-xs font-bold" style={{ color: scoreA >= 60 ? 'var(--success)' : scoreA >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                        {scoreA}/100
                      </span>
                    </div>
                    {step.subjectB && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>B score:</span>
                        <span className="text-xs font-bold" style={{ color: scoreB >= 60 ? 'var(--success)' : scoreB >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                          {scoreB}/100
                        </span>
                        {scoreB > scoreA && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Recommended</span>}
                        {scoreA > scoreB && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>A is stronger</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <FormTextarea
              label="Body"
              value={step.body}
              onChange={e => onUpdate({ ...step, body: e.target.value })}
              rows={isLinkedInConnect ? 4 : 10}
              maxLength={channel.charLimit || undefined}
              error={overLimit ? `Over the ${channel.charLimit} character limit` : undefined}
            />
          </div>
        ) : (
          <div>
            {step.subject && (
              <div className="mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Subject: </span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{personalizedSubject}</span>
                {isEmail && step.subjectB && (
                  <div className="mt-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Subject B: </span>
                    <span className="text-sm" style={{ color: 'var(--text-body)' }}>{applyTokens(step.subjectB, personalization)}</span>
                    {scoreB > scoreA
                      ? <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Recommended</span>
                      : <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>A/B Variant</span>
                    }
                  </div>
                )}
              </div>
            )}
            <pre
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--text-body)', fontFamily: 'inherit' }}
            >
              {personalizedBody}
            </pre>
            {channel.charLimit && (
              <p className="mt-2 text-xs" style={{ color: overLimit ? 'var(--danger)' : 'var(--text-muted)' }}>
                {charCount}/{channel.charLimit} characters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [persona, setPersona] = useLocalStorage('skynet-cold-outreach-persona', 'CEO')
  const [industry, setIndustry] = useLocalStorage('skynet-cold-outreach-industry', 'SaaS / Tech')
  const [service, setService] = useLocalStorage('skynet-cold-outreach-service', 'performance marketing')
  const [valueProp, setValueProp] = useLocalStorage('skynet-cold-outreach-valueProp', 'increase qualified leads by 3x')
  const [selectedTemplate, setSelectedTemplate] = useLocalStorage('skynet-cold-outreach-template', 'linkedin-first')
  const [steps, setSteps] = useLocalStorage('skynet-cold-outreach-steps', null)
  const [savedCampaigns, setSavedCampaigns] = useLocalStorage('skynet-cold-outreach-saved', [])
  const [campaignName, setCampaignName] = useLocalStorage('skynet-cold-outreach-campaignName', '')
  const [activeTab, setActiveTab] = useState('builder')

  // Personalization tokens
  const [tokenValues, setTokenValues] = useLocalStorage('skynet-cold-outreach-tokens', {
    PROSPECT_NAME: '', COMPANY: '', YOUR_NAME: '', RESULT: '',
    ROLE: '', INDUSTRY: '', MUTUAL_CONNECTION: '', RECENT_POST: '',
  })

  const toast = useToast()

  const personalization = useMemo(() => tokenValues, [tokenValues])

  const updateToken = useCallback((key, value) => {
    setTokenValues(prev => ({ ...prev, [key]: value }))
  }, [setTokenValues])

  // ─── Generate Campaign ──────────────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    const templates = buildTemplateSteps(persona, industry, service, valueProp)
    const selected = templates[selectedTemplate]
    if (selected) {
      setSteps(selected.map(s => ({ ...s, id: generateId() })))
      if (toast) toast('Campaign generated!', 'success')
    }
  }, [persona, industry, service, valueProp, selectedTemplate, setSteps, toast])

  // ─── Step Management ────────────────────────────────────────────────────

  const updateStep = useCallback((index, updated) => {
    setSteps(prev => prev.map((s, i) => i === index ? updated : s))
  }, [setSteps])

  const removeStep = useCallback((index) => {
    setSteps(prev => prev.filter((_, i) => i !== index))
    if (toast) toast('Step removed', 'info')
  }, [setSteps, toast])

  const moveStep = useCallback((index, direction) => {
    setSteps(prev => {
      const arr = [...prev]
      const target = index + direction
      if (target < 0 || target >= arr.length) return arr
      ;[arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })
  }, [setSteps])

  const addStep = useCallback(() => {
    const lastDay = steps && steps.length > 0 ? steps[steps.length - 1].day : 0
    const newStep = {
      id: generateId(),
      day: lastDay + 3,
      channel: 'email',
      label: `Step ${(steps?.length || 0) + 1}`,
      subject: '',
      body: '',
      subjectB: '',
    }
    setSteps(prev => [...(prev || []), newStep])
  }, [steps, setSteps])

  // ─── Save / Load Campaigns ─────────────────────────────────────────────

  const saveCampaign = useCallback(() => {
    if (!steps || steps.length === 0) return
    const name = campaignName.trim() || `Campaign ${new Date().toLocaleDateString()}`
    const campaign = {
      id: generateId(),
      name,
      steps: [...steps],
      persona, industry, service, valueProp,
      createdAt: new Date().toISOString(),
    }
    setSavedCampaigns(prev => [campaign, ...prev])
    if (toast) toast(`Campaign "${name}" saved!`, 'success')
  }, [steps, campaignName, persona, industry, service, valueProp, setSavedCampaigns, toast])

  const loadCampaign = useCallback((campaign) => {
    setSteps(campaign.steps)
    setPersona(campaign.persona)
    setIndustry(campaign.industry)
    setService(campaign.service)
    setValueProp(campaign.valueProp)
    setCampaignName(campaign.name)
    setActiveTab('builder')
    if (toast) toast(`Loaded "${campaign.name}"`, 'success')
  }, [setSteps, setPersona, setIndustry, setService, setValueProp, setCampaignName, toast])

  const deleteCampaign = useCallback((id) => {
    setSavedCampaigns(prev => prev.filter(c => c.id !== id))
    if (toast) toast('Campaign deleted', 'info')
  }, [setSavedCampaigns, toast])

  // ─── Campaign Score ─────────────────────────────────────────────────────

  const campaignScore = useMemo(() => computeCampaignScore(steps), [steps])

  // ─── Analytics Estimator ────────────────────────────────────────────────

  const analytics = useMemo(() => {
    if (!steps || steps.length === 0) return null
    let cumulativeNoResponse = 1
    const stepAnalytics = steps.map(s => {
      const rate = RESPONSE_RATES[s.channel] || 0.05
      const stepResponse = cumulativeNoResponse * rate
      cumulativeNoResponse *= (1 - rate)
      return { ...s, responseRate: rate, expectedResponse: stepResponse }
    })
    const totalResponse = 1 - cumulativeNoResponse
    const estimatedMeetings = Math.round(totalResponse * 100 * 0.3)
    return { stepAnalytics, totalResponse, estimatedMeetings }
  }, [steps])

  // ─── Export ─────────────────────────────────────────────────────────────

  const exportFullCampaign = useCallback(() => {
    if (!steps) return ''
    let text = `Cold Outreach Campaign\n${'='.repeat(30)}\n\n`
    text += `Target: ${persona} in ${industry}\n`
    text += `Service: ${service}\n`
    text += `Value Prop: ${valueProp}\n`
    text += `Steps: ${steps.length} | Score: ${campaignScore}/100\n\n`
    text += `${'─'.repeat(30)}\n\n`

    steps.forEach((step, i) => {
      const ch = CHANNELS[step.channel] || CHANNELS.email
      let subject = step.subject ? applyTokens(step.subject, personalization) : ''
      let body = applyTokens(step.body, personalization)
      text += `STEP ${i + 1}: ${step.label} [${ch.label}] (Day ${step.day})\n`
      if (subject) text += `Subject: ${subject}\n`
      if (step.subjectB) text += `Subject B: ${applyTokens(step.subjectB, personalization)}\n`
      text += `\n${body}\n\n`
      text += `${'─'.repeat(30)}\n\n`
    })

    if (analytics) {
      text += `CAMPAIGN ANALYTICS ESTIMATE\n`
      text += `Cumulative Response Rate: ${(analytics.totalResponse * 100).toFixed(1)}%\n`
      text += `Est. Meetings per 100 prospects: ${analytics.estimatedMeetings}\n`
    }
    return text
  }, [steps, persona, industry, service, valueProp, campaignScore, personalization, analytics])

  // ─── Score Breakdown ────────────────────────────────────────────────────

  const scoreBreakdown = useMemo(() => {
    if (!steps || steps.length === 0) return []
    const channelTypes = new Set(steps.map(s => s.channel))
    const allText = steps.map(s => `${s.subject || ''} ${s.body || ''}`).join(' ')
    const tokenCount = (allText.match(/\[.+?\]/g) || []).length
    const days = steps.map(s => s.day).sort((a, b) => a - b)
    let avgGap = 0
    if (days.length >= 2) {
      const gaps = []
      for (let i = 1; i < days.length; i++) gaps.push(days[i] - days[i - 1])
      avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
    }
    const hasBreakup = steps.some(s =>
      (s.label || '').toLowerCase().includes('break') ||
      (s.body || '').toLowerCase().includes('last email') ||
      (s.body || '').toLowerCase().includes('last message') ||
      (s.body || '').toLowerCase().includes('close your file')
    )
    const hasCall = steps.some(s => s.channel === 'call_script')

    return [
      { label: 'Multi-channel (2+ channels)', max: 25, earned: channelTypes.size >= 3 ? 25 : channelTypes.size >= 2 ? 15 : 0, pass: channelTypes.size >= 2 },
      { label: 'Personalization tokens', max: 20, earned: tokenCount >= 6 ? 20 : tokenCount >= 3 ? 12 : tokenCount >= 1 ? 6 : 0, pass: tokenCount >= 3 },
      { label: 'Follow-up timing (2-5 day avg)', max: 20, earned: avgGap >= 2 && avgGap <= 5 ? 20 : avgGap >= 1 && avgGap <= 7 ? 12 : 5, pass: avgGap >= 2 && avgGap <= 5 },
      { label: 'Step count (7-10 optimal)', max: 15, earned: steps.length >= 7 && steps.length <= 10 ? 15 : steps.length >= 5 ? 10 : steps.length >= 3 ? 5 : 0, pass: steps.length >= 7 && steps.length <= 10 },
      { label: 'Has breakup email', max: 10, earned: hasBreakup ? 10 : 0, pass: hasBreakup },
      { label: 'Has call script', max: 10, earned: hasCall ? 10 : 0, pass: hasCall },
    ]
  }, [steps])

  // ─── Tabs ───────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'builder', label: 'Campaign Builder', icon: '\uD83D\uDEE0\uFE0F' },
    { id: 'tokens', label: 'Personalization', icon: '\uD83C\uDFAF' },
    { id: 'analytics', label: 'Analytics', icon: '\uD83D\uDCCA' },
    { id: 'saved', label: `Saved (${savedCampaigns.length})`, icon: '\uD83D\uDCC1' },
  ]

  return (
    <ToolLayout
      title="Cold Outreach Sequence Builder"
      description="Build multi-channel outreach campaigns with LinkedIn, email, follow-ups, and A/B testing."
      category="Ad Creative & Marketing"
      icon="\uD83C\uDFAF"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 rounded-lg overflow-x-auto" style={{ background: 'var(--bg-elevated)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center"
              style={{
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-on-accent)' : 'var(--text-muted)',
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── BUILDER TAB ─────────────────────────────────────────────── */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            {/* Settings & Template Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResultCard title="Sequence Settings" icon="&#9881;">
                <div className="space-y-4">
                  <FormSelect
                    label="Target Persona"
                    value={persona}
                    onChange={e => setPersona(e.target.value)}
                    options={PERSONAS}
                    placeholder=""
                  />
                  <FormSelect
                    label="Industry"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    options={INDUSTRIES}
                    placeholder=""
                  />
                  <FormInput
                    label="Your Service"
                    value={service}
                    onChange={e => setService(e.target.value)}
                    placeholder="e.g., performance marketing, web development..."
                  />
                  <FormInput
                    label="Value Proposition"
                    value={valueProp}
                    onChange={e => setValueProp(e.target.value)}
                    placeholder="e.g., increase qualified leads by 3x..."
                  />
                </div>
              </ResultCard>

              <ResultCard title="Campaign Template" icon="&#128203;">
                <div className="space-y-4">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Choose a pre-built campaign template or customize your own after generating.
                  </p>
                  <div className="space-y-2">
                    {TEMPLATE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setSelectedTemplate(t.value)}
                        className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between"
                        style={{
                          background: selectedTemplate === t.value ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                          border: selectedTemplate === t.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                          color: selectedTemplate === t.value ? 'var(--accent)' : 'var(--text-body)',
                        }}
                      >
                        <span className="text-sm font-medium">{t.label}</span>
                        {selectedTemplate === t.value && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                  >
                    Generate Campaign
                  </button>
                </div>
              </ResultCard>
            </div>

            {/* Campaign Score + Quick Stats */}
            {steps && steps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Gauge */}
                <ResultCard title="Campaign Score" icon="&#127942;">
                  <div className="flex flex-col items-center">
                    <ScoreGauge score={campaignScore} label={getScoreLabel(campaignScore)} size={140} strokeWidth={10} />
                    <div className="mt-4 w-full space-y-1.5">
                      {scoreBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span style={{ color: item.pass ? 'var(--success)' : 'var(--text-muted)' }}>
                              {item.pass ? '\u2713' : '\u2717'}
                            </span>
                            <span style={{ color: 'var(--text-body)' }}>{item.label}</span>
                          </div>
                          <span className="font-mono" style={{ color: item.pass ? 'var(--success)' : 'var(--text-muted)' }}>
                            {item.earned}/{item.max}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ResultCard>

                {/* Quick Analytics */}
                <ResultCard title="Campaign Overview" icon="&#128200;">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Steps</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{steps.length}</span>
                    </div>
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Channels Used</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{new Set(steps.map(s => s.channel)).size}</span>
                    </div>
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Campaign Duration</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{Math.max(...steps.map(s => s.day))} days</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>A/B Tests</span>
                      <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{steps.filter(s => s.subjectB).length}</span>
                    </div>
                  </div>
                </ResultCard>

                {/* Estimated Analytics */}
                <ResultCard title="Response Estimates" icon="&#128640;">
                  {analytics && (
                    <div className="space-y-3">
                      <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                          {(analytics.totalResponse * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cumulative Response Rate</p>
                      </div>
                      <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                          ~{analytics.estimatedMeetings}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Meetings per 100 Prospects</p>
                      </div>
                      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        Based on industry average response rates
                      </p>
                    </div>
                  )}
                </ResultCard>
              </div>
            )}

            {/* Visual Timeline */}
            {steps && steps.length > 0 && (
              <ResultCard title="Campaign Timeline" icon="&#128197;">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: 'var(--border)' }} />
                  <div className="space-y-3">
                    {steps.map((step, idx) => {
                      const ch = CHANNELS[step.channel] || CHANNELS.email
                      return (
                        <div key={step.id} className="flex items-start gap-4 relative">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 z-10"
                            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                          >
                            {ch.icon}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                                {step.label}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                Day {step.day}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                {ch.label}
                              </span>
                              {idx > 0 && (
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  (+{step.day - steps[idx - 1].day}d)
                                </span>
                              )}
                            </div>
                            {step.subject && (
                              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                Subject: {step.subject}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </ResultCard>
            )}

            {/* Step Cards */}
            {steps && steps.length > 0 && (
              <div className="space-y-4" id="cold-outreach-export">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>
                    Campaign Steps ({steps.length})
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CopyButton text={exportFullCampaign()} label="Copy All" />
                    <ExportButton elementId="cold-outreach-export" filename="outreach-campaign.pdf" label="Export PDF" />
                  </div>
                </div>

                {steps.map((step, idx) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={idx}
                    onUpdate={(updated) => updateStep(idx, updated)}
                    onRemove={() => removeStep(idx)}
                    onMoveUp={() => moveStep(idx, -1)}
                    onMoveDown={() => moveStep(idx, 1)}
                    isFirst={idx === 0}
                    isLast={idx === steps.length - 1}
                    personalization={personalization}
                  />
                ))}

                <button
                  onClick={addStep}
                  className="w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '2px dashed var(--border)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Step
                </button>

                {/* Save Campaign */}
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    placeholder="Campaign name..."
                    className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                  <button
                    onClick={saveCampaign}
                    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                    style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                  >
                    Save Campaign
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!steps || steps.length === 0) && (
              <div className="text-center py-12" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div className="text-5xl mb-4">{'\uD83C\uDFAF'}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>No Campaign Yet</h3>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Configure your settings above, choose a campaign template, and click "Generate Campaign" to build your multi-channel outreach sequence.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── PERSONALIZATION TAB ─────────────────────────────────────── */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <ResultCard title="Personalization Tokens" icon="&#128100;">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Fill in these fields to auto-replace tokens in your campaign. Leave blank to keep the [TOKEN] placeholders for mail merge.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOKENS.map(t => (
                  <FormInput
                    key={t.token}
                    label={t.label}
                    value={tokenValues[t.token] || ''}
                    onChange={e => updateToken(t.token, e.target.value)}
                    placeholder={t.placeholder}
                  />
                ))}
              </div>
            </ResultCard>

            <ResultCard title="Available Tokens Reference" icon="&#128218;">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TOKENS.map(t => (
                  <div
                    key={t.token}
                    className="px-3 py-2 rounded-lg text-center text-xs font-mono"
                    style={{
                      background: tokenValues[t.token] ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      color: tokenValues[t.token] ? 'var(--accent)' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    [{t.token}]
                    {tokenValues[t.token] && (
                      <p className="mt-1 text-xs truncate" style={{ color: 'var(--text-body)', fontFamily: 'inherit' }}>
                        = {tokenValues[t.token]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>
        )}

        {/* ─── ANALYTICS TAB ──────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {steps && steps.length > 0 && analytics ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                      {(analytics.totalResponse * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total Response Rate</p>
                  </div>
                  <div className="p-5 rounded-xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>~{analytics.estimatedMeetings}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Meetings / 100 Prospects</p>
                  </div>
                  <div className="p-5 rounded-xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-3xl font-bold" style={{ color: 'var(--info)' }}>{steps.length}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total Touchpoints</p>
                  </div>
                </div>

                {/* Per-Step Breakdown */}
                <ResultCard title="Step-by-Step Response Estimates" icon="&#128202;">
                  <div className="space-y-0">
                    {analytics.stepAnalytics.map((step, idx) => {
                      const ch = CHANNELS[step.channel] || CHANNELS.email
                      const barWidth = Math.max(step.expectedResponse * 100 * 5, 2)
                      return (
                        <div key={step.id || idx} className="flex items-center gap-4 py-3" style={{ borderBottom: idx < analytics.stepAnalytics.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div className="w-8 text-center text-base flex-shrink-0">{ch.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate pr-2" style={{ color: 'var(--text-heading)' }}>
                                Day {step.day}: {step.label}
                              </span>
                              <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                                {(step.expectedResponse * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min(barWidth, 100)}%`, background: 'var(--accent)' }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    Response rates are based on industry averages: LinkedIn connection (30%), LinkedIn message (18%), follow-up call (12%), email (8%), Twitter/X DM (6%), LinkedIn comment (5%). Actual rates vary by industry, personalization quality, and timing.
                  </div>
                </ResultCard>

                {/* Campaign Score in Analytics */}
                <ResultCard title="Campaign Quality Score" icon="&#127942;">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreGauge score={campaignScore} label={getScoreLabel(campaignScore)} size={160} strokeWidth={12} />
                    <div className="flex-1 space-y-2 w-full">
                      {scoreBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-1.5">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                            style={{
                              background: item.pass ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                              color: item.pass ? 'var(--accent)' : 'var(--text-muted)',
                            }}
                          >
                            {item.pass ? '\u2713' : '\u2717'}
                          </div>
                          <span className="text-sm flex-1" style={{ color: 'var(--text-body)' }}>{item.label}</span>
                          <span className="text-sm font-mono" style={{ color: item.pass ? 'var(--success)' : 'var(--text-muted)' }}>
                            +{item.earned}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ResultCard>
              </>
            ) : (
              <div className="text-center py-12" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div className="text-5xl mb-4">{'\uD83D\uDCCA'}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>No Analytics Yet</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Generate a campaign first to see response rate estimates and scoring.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── SAVED CAMPAIGNS TAB ────────────────────────────────────── */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedCampaigns.length > 0 ? (
              savedCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="p-4 rounded-lg flex items-center justify-between flex-wrap gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>
                      {campaign.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {campaign.steps.length} steps
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {campaign.persona} in {campaign.industry}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {[...new Set(campaign.steps.map(s => s.channel))].map(ch => {
                        const channelInfo = CHANNELS[ch] || CHANNELS.email
                        return (
                          <span
                            key={ch}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                          >
                            {channelInfo.icon} {channelInfo.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadCampaign(campaign)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--danger)', border: '1px solid var(--border)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div className="text-5xl mb-4">{'\uD83D\uDCC1'}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>No Saved Campaigns</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Generate and save campaigns to access them later. Each campaign stores all steps, settings, and configurations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
