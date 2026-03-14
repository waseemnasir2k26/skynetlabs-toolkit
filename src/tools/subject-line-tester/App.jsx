import { useState, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import CopyButton from '../shared/CopyButton'
import ScoreGauge from '../shared/ScoreGauge'
import { generateId } from '../shared/utils'

// ─── Data Sets ────────────────────────────────────────────────

const POWER_WORDS = [
  'free', 'new', 'proven', 'secret', 'you', 'instant', 'how', 'now',
  'announcing', 'introducing', 'improvement', 'amazing', 'sensational',
  'remarkable', 'revolutionary', 'startling', 'miracle', 'offer',
  'quick', 'easy', 'hurry', 'limited', 'exclusive', 'guaranteed',
  'discover', 'save', 'results', 'powerful', 'ultimate', 'bonus',
  'alert', 'breaking', 'urgent', 'important', 'unlock', 'insider',
  'transform', 'boost', 'skyrocket', 'dominate', 'crush', 'hack',
  'effortless', 'jaw-dropping', 'mind-blowing', 'game-changing',
  'breakthrough', 'epic', 'massive', 'explosive', 'proven', 'tested',
]

const SPAM_TRIGGERS = [
  'buy now', 'act now', 'click here', 'limited time', 'order now',
  'winner', 'congratulations', 'cash', 'earn money', 'make money',
  'double your', 'no obligation', '100% free', 'risk-free', 'no cost',
  'credit card', 'subscribe', 'unsubscribe', 'dear friend', 'as seen on',
  '$$$', '!!!', 'all caps', 'guarantee', 'no catch', 'apply now',
  'lowest price', 'million dollars', 'once in a lifetime', 'this is not spam',
]

const URGENCY_WORDS = [
  'now', 'today', 'hurry', 'urgent', 'limited', 'deadline', 'expires',
  'last chance', 'final', 'ending', 'running out', "don't miss", 'before',
  'tonight', 'tomorrow', 'hours left', 'closing', 'soon', 'only',
  'remaining', 'countdown', 'tick', 'while supplies last',
]

const CURIOSITY_PATTERNS = [
  /^why\s/i, /^how\s/i, /^what\s/i, /^did you know/i, /^guess what/i,
  /the (?:real |true |secret |surprising )?reason/i, /you won't believe/i,
  /here'?s? (?:why|how|what)/i, /the truth about/i, /\.\.\./,
  /this is (?:why|how|what)/i, /nobody (?:talks|tells|knows)/i,
  /what (?:no one|nobody) tells you/i, /the \d+ (?:things|ways|secrets)/i,
]

const POSITIVE_WORDS = [
  'love', 'great', 'amazing', 'awesome', 'happy', 'excited', 'beautiful',
  'wonderful', 'fantastic', 'brilliant', 'perfect', 'best', 'win', 'winning',
  'celebrate', 'congrats', 'thank', 'thanks', 'welcome', 'good', 'better',
  'growth', 'success', 'successful', 'thrive', 'thriving', 'improve',
]

const NEGATIVE_WORDS = [
  'stop', 'fail', 'failing', 'lose', 'losing', 'wrong', 'mistake', 'mistakes',
  'problem', 'problems', 'warning', 'danger', 'risk', 'afraid', 'fear',
  'miss', 'missing', 'bad', 'worse', 'worst', 'avoid', 'never', 'don\'t',
  'struggle', 'struggling', 'pain', 'painful', 'broken', 'dying', 'kill',
]

const INDUSTRY_BENCHMARKS = [
  { name: 'SaaS / Tech', avgOpen: 21.3, avgScore: 62 },
  { name: 'E-commerce', avgOpen: 15.7, avgScore: 55 },
  { name: 'Agency / Services', avgOpen: 19.2, avgScore: 58 },
  { name: 'Health & Fitness', avgOpen: 21.5, avgScore: 60 },
  { name: 'Finance', avgOpen: 20.2, avgScore: 57 },
  { name: 'Education', avgOpen: 23.4, avgScore: 64 },
  { name: 'Real Estate', avgOpen: 18.8, avgScore: 54 },
  { name: 'Nonprofit', avgOpen: 25.2, avgScore: 66 },
  { name: 'Marketing / Ads', avgOpen: 17.4, avgScore: 56 },
  { name: 'Media / News', avgOpen: 22.1, avgScore: 63 },
]

const DEVICE_LIMITS = [
  { name: 'iPhone (Mail)', chars: 41, icon: '📱' },
  { name: 'Gmail (Mobile)', chars: 43, icon: '📱' },
  { name: 'Gmail (Desktop)', chars: 70, icon: '🖥️' },
  { name: 'Outlook (Desktop)', chars: 60, icon: '💻' },
  { name: 'Outlook (Mobile)', chars: 40, icon: '📱' },
  { name: 'Yahoo Mail', chars: 46, icon: '📧' },
  { name: 'Apple Watch', chars: 18, icon: '⌚' },
]

// ─── Analysis Engine ──────────────────────────────────────────

function analyzeSubjectLine(subject) {
  if (!subject.trim()) {
    return {
      overall: 0,
      length: { score: 0, detail: 'Enter a subject line to analyze' },
      powerWords: { score: 0, detail: '', words: [] },
      personalization: { score: 0, detail: '' },
      urgency: { score: 0, detail: '', words: [] },
      emoji: { score: 0, detail: '' },
      spam: { score: 0, detail: '', triggers: [] },
      curiosity: { score: 0, detail: '' },
      readability: { score: 0, detail: '', gradeLevel: 0 },
      sentiment: { score: 0, detail: '', type: 'neutral' },
      tips: [],
      wordMap: [],
    }
  }

  const words = subject.toLowerCase().split(/\s+/)
  const wordCount = words.length
  const charCount = subject.length

  // 1. Length score
  let lengthScore = 0
  let lengthDetail = ''
  if (wordCount >= 6 && wordCount <= 10) {
    lengthScore = 100
    lengthDetail = `${wordCount} words, ${charCount} chars — Perfect length`
  } else if (wordCount >= 4 && wordCount <= 12) {
    lengthScore = 70
    lengthDetail = `${wordCount} words — ${wordCount < 6 ? 'Slightly short' : 'Slightly long'}`
  } else if (wordCount >= 2 && wordCount <= 15) {
    lengthScore = 40
    lengthDetail = `${wordCount} words — ${wordCount < 4 ? 'Too short, add context' : 'Too long, gets cut on mobile'}`
  } else {
    lengthScore = 15
    lengthDetail = `${wordCount} words — ${wordCount < 2 ? 'Way too short' : 'Way too long'}`
  }
  if (charCount > 60) {
    lengthScore = Math.max(10, lengthScore - 20)
    lengthDetail += ` (${charCount} chars — may truncate)`
  }

  // 2. Power words
  const foundPower = POWER_WORDS.filter(pw => words.includes(pw) || subject.toLowerCase().includes(pw))
  let powerScore = foundPower.length >= 3 ? 100 : foundPower.length === 2 ? 75 : foundPower.length === 1 ? 45 : 10
  let powerDetail = foundPower.length >= 3 ? `${foundPower.length} power words — Excellent!`
    : foundPower.length === 2 ? '2 power words — Good trigger'
    : foundPower.length === 1 ? '1 power word — Add more'
    : 'No power words — Add emotional triggers'

  // 3. Personalization
  const hasName = /\{(first_?name|name|fname)\}|\[(first_?name|name|fname)\]/i.test(subject)
  const hasYou = /your |you |you're/i.test(subject)
  let personalizationScore = hasName ? 100 : hasYou ? 70 : 20
  let personalizationDetail = hasName ? 'Name merge tag found — Great!'
    : hasYou ? '"You/your" detected — Good connection'
    : 'No personalization — Add "you" or {first_name}'

  // 4. Urgency
  const foundUrgency = URGENCY_WORDS.filter(uw => subject.toLowerCase().includes(uw))
  let urgencyScore = foundUrgency.length >= 2 ? 90 : foundUrgency.length === 1 ? 60 : 25
  let urgencyDetail = foundUrgency.length >= 2 ? `${foundUrgency.length} urgency cues — Strong FOMO`
    : foundUrgency.length === 1 ? '1 urgency cue — Creates FOMO'
    : 'No urgency — Consider adding time pressure'

  // 5. Emoji
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
  const emojis = subject.match(emojiRegex) || []
  let emojiScore = emojis.length === 1 ? 90 : emojis.length === 2 ? 65 : emojis.length >= 3 ? 25 : 50
  let emojiDetail = emojis.length === 1 ? '1 emoji — Perfect, stands out'
    : emojis.length === 2 ? '2 emojis — Acceptable, 1 is optimal'
    : emojis.length >= 3 ? `${emojis.length} emojis — Too many, looks spammy`
    : 'No emoji — Adding 1 can boost opens 5-10%'

  // 6. Spam check
  const foundSpam = SPAM_TRIGGERS.filter(st => subject.toLowerCase().includes(st))
  const hasAllCaps = /[A-Z]{4,}/.test(subject) && subject !== subject.toLowerCase()
  const hasExcessivePunctuation = /[!?]{2,}/.test(subject)
  if (hasAllCaps) foundSpam.push('ALL CAPS WORDS')
  if (hasExcessivePunctuation) foundSpam.push('Excessive punctuation')
  let spamScore = foundSpam.length === 0 ? 100 : foundSpam.length <= 2 ? 55 : 10
  let spamDetail = foundSpam.length === 0 ? 'No spam triggers — Clean!'
    : foundSpam.length <= 2 ? `${foundSpam.length} spam triggers — May affect deliverability`
    : `${foundSpam.length} spam triggers! — High risk of spam folder`

  // 7. Curiosity (NEW)
  const curiosityMatches = CURIOSITY_PATTERNS.filter(p => p.test(subject))
  const hasQuestion = /\?/.test(subject)
  const hasNumbers = /\d/.test(subject)
  const hasBrackets = /\[.*?\]/.test(subject) && !/\[(first_?name|name|fname)\]/i.test(subject)
  let curiosityScore = 0
  let curiosityDetail = ''
  const curiosityPoints = curiosityMatches.length * 25 + (hasQuestion ? 20 : 0) + (hasNumbers ? 15 : 0) + (hasBrackets ? 15 : 0)
  curiosityScore = Math.min(100, Math.max(10, curiosityPoints))
  if (curiosityScore >= 80) curiosityDetail = 'Strong curiosity gap — Recipients will want to open'
  else if (curiosityScore >= 50) curiosityDetail = 'Moderate curiosity — Good hook'
  else if (curiosityScore >= 25) curiosityDetail = 'Low curiosity — Try a question, number, or teaser'
  else curiosityDetail = 'No curiosity trigger — Add "how", "why", numbers, or a question mark'

  // 8. Readability (NEW)
  const avgWordLength = words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / wordCount
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0)
  const avgSyllables = syllableCount / wordCount
  // Simplified Flesch-Kincaid
  const gradeLevel = Math.max(1, Math.min(18, Math.round(0.39 * wordCount + 11.8 * avgSyllables - 15.59)))
  let readabilityScore = 0
  let readabilityDetail = ''
  if (gradeLevel <= 6) {
    readabilityScore = 100
    readabilityDetail = `Grade ${gradeLevel} — Easy to scan, perfect for email`
  } else if (gradeLevel <= 8) {
    readabilityScore = 80
    readabilityDetail = `Grade ${gradeLevel} — Good readability`
  } else if (gradeLevel <= 10) {
    readabilityScore = 55
    readabilityDetail = `Grade ${gradeLevel} — Slightly complex, simplify words`
  } else {
    readabilityScore = 25
    readabilityDetail = `Grade ${gradeLevel} — Too complex, use shorter words`
  }
  if (avgWordLength > 7) {
    readabilityScore = Math.max(10, readabilityScore - 15)
    readabilityDetail += ' (long words detected)'
  }

  // 9. Sentiment (NEW)
  const posCount = POSITIVE_WORDS.filter(w => words.includes(w)).length
  const negCount = NEGATIVE_WORDS.filter(w => words.includes(w)).length
  let sentimentType = 'neutral'
  let sentimentScore = 60
  let sentimentDetail = ''
  if (posCount > negCount) {
    sentimentType = 'positive'
    sentimentScore = 85
    sentimentDetail = `Positive tone (${posCount} positive words) — Feels welcoming`
  } else if (negCount > posCount) {
    sentimentType = 'negative'
    sentimentScore = 70
    sentimentDetail = `Negative/fear tone (${negCount} negative words) — Can work for urgency`
  } else if (posCount > 0 && negCount > 0) {
    sentimentType = 'mixed'
    sentimentScore = 75
    sentimentDetail = 'Mixed tone — Creates contrast, can be effective'
  } else {
    sentimentDetail = 'Neutral tone — Consider adding emotional language'
  }

  // Word map (color-code each word)
  const wordMap = subject.split(/(\s+)/).map(token => {
    const lower = token.toLowerCase().trim()
    if (!lower) return { text: token, type: 'space' }
    if (SPAM_TRIGGERS.some(st => lower.includes(st))) return { text: token, type: 'spam' }
    if (POWER_WORDS.includes(lower)) return { text: token, type: 'power' }
    if (URGENCY_WORDS.some(uw => lower === uw || lower.includes(uw))) return { text: token, type: 'urgency' }
    if (POSITIVE_WORDS.includes(lower)) return { text: token, type: 'positive' }
    if (NEGATIVE_WORDS.includes(lower)) return { text: token, type: 'negative' }
    if (/\{.*?\}|\[.*?\]/.test(token)) return { text: token, type: 'personalization' }
    return { text: token, type: 'neutral' }
  })

  // Overall score (weighted)
  const overall = Math.round(
    (lengthScore * 0.15) +
    (powerScore * 0.15) +
    (personalizationScore * 0.10) +
    (urgencyScore * 0.10) +
    (emojiScore * 0.08) +
    (spamScore * 0.17) +
    (curiosityScore * 0.10) +
    (readabilityScore * 0.08) +
    (sentimentScore * 0.07)
  )

  // Generate tips
  const tips = []
  if (lengthScore < 70) tips.push({ icon: '📏', text: `Aim for 6-10 words (currently ${wordCount}). Short subjects get 21% more opens.` })
  if (powerScore < 50) tips.push({ icon: '💪', text: `Add power words like: "${POWER_WORDS.slice(0, 5).join('", "')}" to trigger emotion.` })
  if (personalizationScore < 50) tips.push({ icon: '👤', text: 'Use "you/your" or add {first_name} merge tags. Personalized subjects get 26% more opens.' })
  if (urgencyScore < 50) tips.push({ icon: '⏰', text: 'Add time pressure: "today only", "last chance", "before midnight" to create FOMO.' })
  if (emojiScore < 50) tips.push({ icon: '✨', text: 'Add a single relevant emoji at the start or end. Keep it to one.' })
  if (spamScore < 70) tips.push({ icon: '🚫', text: `Remove spam triggers: "${foundSpam.slice(0, 3).join('", "')}". These hurt deliverability.` })
  if (curiosityScore < 40) tips.push({ icon: '🧠', text: 'Create a curiosity gap: use "how", "why", a question mark, or a number to tease the content.' })
  if (readabilityScore < 60) tips.push({ icon: '📖', text: `Grade level ${gradeLevel} is too high. Use shorter, simpler words for quick scanning.` })
  if (charCount > 50) tips.push({ icon: '✂️', text: `At ${charCount} characters, your subject may be truncated on mobile. Trim to under 50.` })
  if (subject.startsWith('Re:') || subject.startsWith('Fwd:')) tips.push({ icon: '⚠️', text: 'Fake "Re:" or "Fwd:" tricks are deceptive and hurt trust.' })
  if (!hasQuestion && !hasNumbers) tips.push({ icon: '🔢', text: 'Subjects with numbers or questions get 36% higher open rates. Try "5 ways..." or "Did you know...?"' })
  if (hasBrackets) tips.push({ icon: '📌', text: 'Brackets like [Video] or [Guide] set expectations and boost open rates by 9%.' })

  return {
    overall,
    length: { score: lengthScore, detail: lengthDetail },
    powerWords: { score: powerScore, detail: powerDetail, words: foundPower },
    personalization: { score: personalizationScore, detail: personalizationDetail },
    urgency: { score: urgencyScore, detail: urgencyDetail, words: foundUrgency },
    emoji: { score: emojiScore, detail: emojiDetail },
    spam: { score: spamScore, detail: spamDetail, triggers: foundSpam },
    curiosity: { score: curiosityScore, detail: curiosityDetail },
    readability: { score: readabilityScore, detail: readabilityDetail, gradeLevel },
    sentiment: { score: sentimentScore, detail: sentimentDetail, type: sentimentType },
    tips,
    wordMap,
    meta: { wordCount, charCount, hasQuestion, hasNumbers, hasBrackets, sentimentType },
  }
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 2) return 1
  word = word.replace(/e$/, '')
  const matches = word.match(/[aeiouy]+/g)
  return matches ? Math.max(1, matches.length) : 1
}

// ─── Variation Generator ──────────────────────────────────────

function generateVariations(subject) {
  if (!subject.trim()) return []
  const words = subject.split(/\s+/)
  const core = words.slice(0, 6).join(' ')
  const variations = []

  // Question flip
  if (!/\?$/.test(subject)) {
    variations.push({ label: 'Question Hook', subject: `Did you know? ${subject}`, reason: 'Questions boost open rates by 10-15%' })
  } else {
    variations.push({ label: 'Statement Flip', subject: subject.replace(/\?$/, ' — here\'s how'), reason: 'Statements with dashes create intrigue' })
  }

  // Number prefix
  if (!/\d/.test(subject)) {
    variations.push({ label: 'Number Hook', subject: `5 ways to ${core.toLowerCase()}`, reason: 'Numbers in subjects get 36% more opens' })
  }

  // Urgency add
  if (!URGENCY_WORDS.some(uw => subject.toLowerCase().includes(uw))) {
    variations.push({ label: 'Urgency Add', subject: `${subject} (before it's too late)`, reason: 'FOMO drives 22% more clicks' })
  }

  // Bracket prefix
  if (!/\[.*?\]/.test(subject)) {
    variations.push({ label: 'Bracket Tag', subject: `[New] ${subject}`, reason: 'Bracket tags boost open rates by 9%' })
  }

  // Emoji version
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
  if (!(subject.match(emojiRegex) || []).length) {
    variations.push({ label: 'Emoji Start', subject: `🔥 ${subject}`, reason: 'One emoji can increase opens 5-10%' })
  }

  // Shorter version
  if (words.length > 8) {
    variations.push({ label: 'Shorter Cut', subject: words.slice(0, 7).join(' ') + '...', reason: 'Shorter subjects perform better on mobile' })
  }

  // Personalized
  if (!/you|your/i.test(subject)) {
    variations.push({ label: 'Personal Touch', subject: `{first_name}, ${subject.charAt(0).toLowerCase() + subject.slice(1)}`, reason: 'Personalization boosts opens 26%' })
  }

  // Curiosity gap
  variations.push({ label: 'Curiosity Gap', subject: `The real reason ${core.toLowerCase()}...`, reason: 'Open loops drive irresistible curiosity' })

  return variations.slice(0, 6)
}

// ─── UI Components ────────────────────────────────────────────

function ScoreBar({ label, score, detail, icon }) {
  const getColor = (s) => {
    if (s >= 80) return 'var(--success)'
    if (s >= 60) return 'var(--info)'
    if (s >= 40) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
          {icon && <span className="mr-1.5">{icon}</span>}{label}
        </span>
        <span className="text-sm font-bold" style={{ color: getColor(score) }}>{score}/100</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: getColor(score) }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{detail}</p>
    </div>
  )
}

function WordHighlightMap({ wordMap }) {
  const typeColors = {
    power: { bg: 'rgba(0, 229, 160, 0.15)', color: 'var(--success)', label: 'Power' },
    urgency: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: 'Urgency' },
    spam: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', label: 'Spam' },
    positive: { bg: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)', label: 'Positive' },
    negative: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'Negative' },
    personalization: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', label: 'Merge Tag' },
  }

  const usedTypes = new Set(wordMap.filter(w => w.type !== 'neutral' && w.type !== 'space').map(w => w.type))

  return (
    <div>
      <div className="flex flex-wrap gap-0.5 p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        {wordMap.map((item, i) => {
          if (item.type === 'space') return <span key={i}>{item.text}</span>
          const style = typeColors[item.type]
          if (!style) return <span key={i} className="text-sm" style={{ color: 'var(--text-heading)' }}>{item.text}</span>
          return (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-sm font-medium"
              style={{ background: style.bg, color: style.color }}
              title={style.label}
            >
              {item.text}
            </span>
          )
        })}
      </div>
      {usedTypes.size > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {Array.from(usedTypes).map(type => {
            const style = typeColors[type]
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: style.bg, border: `1px solid ${style.color}` }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{style.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DevicePreview({ subject }) {
  return (
    <div className="space-y-3">
      {DEVICE_LIMITS.map(device => {
        const truncated = subject.length > device.chars
        const displayText = truncated ? subject.slice(0, device.chars) + '...' : subject
        return (
          <div key={device.name} className="flex items-center gap-3">
            <div className="w-36 flex-shrink-0 flex items-center gap-1.5">
              <span className="text-sm">{device.icon}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{device.name}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="rounded-lg px-3 py-2 text-sm truncate"
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${truncated ? 'var(--warning)' : 'var(--border)'}`,
                  color: 'var(--text-heading)',
                }}
              >
                {displayText}
              </div>
            </div>
            <span className="text-xs flex-shrink-0 w-8 text-right" style={{ color: truncated ? 'var(--warning)' : 'var(--success)' }}>
              {truncated ? '✂️' : '✓'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function InboxMockup({ subject, variant }) {
  const configs = {
    gmail: { sender: 'Your Name', avatar: 'YN', preview: 'Preview text shows here. The first line of your email body...', time: '10:32 AM', bg: 'var(--bg-elevated)' },
    outlook: { sender: 'Your Name', avatar: 'YN', preview: 'This is the preview text that recipients see in Outlook...', time: '10:32 AM', bg: 'var(--bg-elevated)' },
    iphone: { sender: 'Your Name', avatar: 'YN', preview: 'Preview text visible on iPhone lock screen and notification...', time: '10:32', bg: 'var(--bg-elevated)' },
  }
  const config = configs[variant] || configs.gmail
  const charLimit = variant === 'iphone' ? 41 : variant === 'outlook' ? 60 : 70
  const truncatedSubject = subject.length > charLimit ? subject.slice(0, charLimit) + '...' : subject

  return (
    <div className="rounded-lg p-4" style={{ background: config.bg, border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          {variant === 'gmail' ? 'Gmail' : variant === 'outlook' ? 'Outlook' : 'iPhone'}
        </span>
        {subject.length > charLimit && (
          <span className="text-xs" style={{ color: 'var(--warning)' }}>Truncated at {charLimit} chars</span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          {config.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{config.sender}</p>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{config.time}</span>
          </div>
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>
            {truncatedSubject}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {config.preview}
          </p>
        </div>
      </div>
    </div>
  )
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  if (score >= 30) return 'Needs Work'
  return 'Poor'
}

function getScoreColor(s) {
  if (s >= 80) return 'var(--success)'
  if (s >= 60) return 'var(--info)'
  if (s >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

// ─── Main App ─────────────────────────────────────────────────

export default function App() {
  const [subject, setSubject] = useLocalStorage('skynet-subject-line-subject', '')
  const [subjectB, setSubjectB] = useLocalStorage('skynet-subject-line-subject-b', '')
  const [history, setHistory] = useLocalStorage('skynet-subject-line-history', [])
  const [mode, setMode] = useState('single') // single | ab | bulk
  const [bulkText, setBulkText] = useState('')
  const [activeTab, setActiveTab] = useState('analysis') // analysis | preview | variations | benchmark
  const [selectedIndustry, setSelectedIndustry] = useState(0)

  const { generateShareURL } = useShareableURL(
    { subject },
    { subject: setSubject }
  )

  const analysis = useMemo(() => analyzeSubjectLine(subject), [subject])
  const analysisB = useMemo(() => analyzeSubjectLine(subjectB), [subjectB])
  const variations = useMemo(() => generateVariations(subject), [subject])

  const bulkResults = useMemo(() => {
    if (!bulkText.trim()) return []
    return bulkText.split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => ({
        subject: line,
        analysis: analyzeSubjectLine(line),
      }))
      .sort((a, b) => b.analysis.overall - a.analysis.overall)
  }, [bulkText])

  const handleTest = useCallback(() => {
    if (!subject.trim()) return
    const entry = {
      id: generateId(),
      subject: subject.trim(),
      score: analysis.overall,
      wordCount: analysis.meta?.wordCount || 0,
      sentiment: analysis.meta?.sentimentType || 'neutral',
      testedAt: new Date().toLocaleString(),
    }
    setHistory(prev => {
      const updated = [entry, ...(prev || [])].slice(0, 20)
      return updated
    })
  }, [subject, analysis, setHistory])

  const avgHistoryScore = useMemo(() => {
    if (!history || history.length === 0) return 0
    return Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length)
  }, [history])

  const abWinner = useMemo(() => {
    if (!subject.trim() || !subjectB.trim()) return null
    if (analysis.overall > analysisB.overall) return 'A'
    if (analysisB.overall > analysis.overall) return 'B'
    return 'TIE'
  }, [analysis, analysisB, subject, subjectB])

  return (
    <ToolLayout
      title="Email Subject Line Tester"
      description="Score, compare, and optimize your email subject lines with deep analysis across 9 dimensions. A/B test variants, preview across devices, get smart variations, and benchmark against industry averages."
      category="Ad Creative & Marketing"
      icon="📧"
      proTip="The best subject lines are 6-10 words, include 1 emoji, use 'you/your', and create curiosity or urgency. A/B test your top 2 subjects with a small segment before sending to your full list."
    >
      <div id="subject-line-results">

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'single', label: 'Single Test', icon: '🎯' },
            { key: 'ab', label: 'A/B Compare', icon: '⚔️' },
            { key: 'bulk', label: 'Bulk Test', icon: '📋' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={mode === m.key
                ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        {/* ─── SINGLE MODE ──────────────────────────────── */}
        {mode === 'single' && (
          <>
            {/* Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>
                Enter Your Subject Line
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g., You are missing out on 10x growth (here is how)"
                  className="flex-1 rounded-lg py-3 px-4 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  onKeyDown={e => { if (e.key === 'Enter') handleTest() }}
                />
                <button
                  onClick={handleTest}
                  className="px-5 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                  style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                >
                  Save & Test
                </button>
                <button
                  onClick={() => setSubject('')}
                  className="px-4 py-3 rounded-lg font-medium text-sm transition-all"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
                >
                  Clear
                </button>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-xs" style={{ color: subject.split(/\s+/).filter(Boolean).length >= 6 && subject.split(/\s+/).filter(Boolean).length <= 10 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {subject.split(/\s+/).filter(Boolean).length} words
                </span>
                <span className="text-xs" style={{ color: subject.length <= 50 ? 'var(--success)' : subject.length <= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                  {subject.length} / 50 characters
                </span>
                {analysis.meta?.hasQuestion && <span className="text-xs" style={{ color: 'var(--info)' }}>? Question</span>}
                {analysis.meta?.hasNumbers && <span className="text-xs" style={{ color: 'var(--info)' }}># Number</span>}
                {analysis.meta?.hasBrackets && <span className="text-xs" style={{ color: 'var(--info)' }}>[ ] Bracket</span>}
              </div>
            </div>

            {subject.trim() && (
              <>
                {/* Word Highlight Map */}
                <div className="mb-6">
                  <ResultCard title="Word Analysis Map" icon="🔍">
                    <WordHighlightMap wordMap={analysis.wordMap} />
                  </ResultCard>
                </div>

                {/* Sub-Tabs */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  {[
                    { key: 'analysis', label: 'Score Breakdown', icon: '📊' },
                    { key: 'preview', label: 'Device Previews', icon: '📱' },
                    { key: 'variations', label: 'Smart Variations', icon: '💡' },
                    { key: 'benchmark', label: 'Industry Benchmark', icon: '📈' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={activeTab === tab.key
                        ? { background: 'var(--bg-card)', color: 'var(--text-heading)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                        : { color: 'var(--text-muted)' }
                      }
                    >
                      <span>{tab.icon}</span> {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB: Analysis */}
                {activeTab === 'analysis' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT: Score Gauge */}
                    <div className="space-y-6">
                      <ResultCard title="Overall Score" icon="🎯">
                        <div className="flex flex-col items-center py-4">
                          <ScoreGauge score={analysis.overall} label={getScoreLabel(analysis.overall)} />
                          <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-body)' }}>
                            {analysis.overall >= 80 && 'This subject line is ready to send! Strong emotional triggers and clean formatting.'}
                            {analysis.overall >= 60 && analysis.overall < 80 && 'Good foundation. Apply the tips below to push it past 80.'}
                            {analysis.overall >= 40 && analysis.overall < 60 && 'Average. Needs more work before sending.'}
                            {analysis.overall < 40 && 'Needs significant improvement. See tips below.'}
                          </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                            <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{analysis.meta?.wordCount || 0}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Words</p>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                            <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{analysis.meta?.charCount || 0}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Characters</p>
                          </div>
                          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                            <p className="text-lg font-bold capitalize" style={{ color: getScoreColor(analysis.sentiment.score) }}>{analysis.sentiment.type}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sentiment</p>
                          </div>
                        </div>
                      </ResultCard>

                      {/* Inbox Preview */}
                      <ResultCard title="Inbox Preview" icon="📬">
                        <div className="space-y-3">
                          <InboxMockup subject={subject} variant="gmail" />
                          <InboxMockup subject={subject} variant="iphone" />
                        </div>
                      </ResultCard>
                    </div>

                    {/* RIGHT: Score Bars + Tips */}
                    <div className="space-y-6">
                      <ResultCard title="9-Factor Breakdown" icon="📊">
                        <ScoreBar icon="📏" label="Length" score={analysis.length.score} detail={analysis.length.detail} />
                        <ScoreBar icon="💪" label="Power Words" score={analysis.powerWords.score} detail={analysis.powerWords.detail} />
                        {analysis.powerWords.words.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4 -mt-2">
                            {analysis.powerWords.words.map(w => (
                              <span key={w} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{w}</span>
                            ))}
                          </div>
                        )}
                        <ScoreBar icon="👤" label="Personalization" score={analysis.personalization.score} detail={analysis.personalization.detail} />
                        <ScoreBar icon="⏰" label="Urgency" score={analysis.urgency.score} detail={analysis.urgency.detail} />
                        {analysis.urgency.words.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4 -mt-2">
                            {analysis.urgency.words.map(w => (
                              <span key={w} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>{w}</span>
                            ))}
                          </div>
                        )}
                        <ScoreBar icon="✨" label="Emoji Usage" score={analysis.emoji.score} detail={analysis.emoji.detail} />
                        <ScoreBar icon="🚫" label="Spam Check" score={analysis.spam.score} detail={analysis.spam.detail} />
                        {analysis.spam.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4 -mt-2">
                            {analysis.spam.triggers.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>{t}</span>
                            ))}
                          </div>
                        )}
                        <ScoreBar icon="🧠" label="Curiosity" score={analysis.curiosity.score} detail={analysis.curiosity.detail} />
                        <ScoreBar icon="📖" label="Readability" score={analysis.readability.score} detail={analysis.readability.detail} />
                        <ScoreBar icon="💬" label="Sentiment" score={analysis.sentiment.score} detail={analysis.sentiment.detail} />
                      </ResultCard>

                      {analysis.tips.length > 0 && (
                        <ResultCard title="How to Improve" icon="💡">
                          <ul className="space-y-3">
                            {analysis.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="text-base flex-shrink-0 mt-0.5">{tip.icon}</span>
                                <span className="text-sm" style={{ color: 'var(--text-body)' }}>{tip.text}</span>
                              </li>
                            ))}
                          </ul>
                        </ResultCard>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: Device Previews */}
                {activeTab === 'preview' && (
                  <div className="space-y-6">
                    <ResultCard title="How Your Subject Looks Across Devices" icon="📱">
                      <DevicePreview subject={subject} />
                    </ResultCard>

                    <ResultCard title="Full Inbox Mockups" icon="📬">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InboxMockup subject={subject} variant="gmail" />
                        <InboxMockup subject={subject} variant="outlook" />
                        <InboxMockup subject={subject} variant="iphone" />
                      </div>
                    </ResultCard>

                    <ResultCard title="Character Count Guide" icon="📏">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Your Subject', value: subject.length, color: subject.length <= 50 ? 'var(--success)' : 'var(--warning)' },
                          { label: 'Optimal', value: '30-50', color: 'var(--success)' },
                          { label: 'Mobile Safe', value: '< 41', color: 'var(--info)' },
                          { label: 'Desktop Max', value: '< 70', color: 'var(--text-muted)' },
                        ].map(stat => (
                          <div key={stat.label} className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </ResultCard>
                  </div>
                )}

                {/* TAB: Variations */}
                {activeTab === 'variations' && (
                  <div className="space-y-6">
                    <ResultCard title="AI-Generated Variations" icon="💡">
                      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                        Based on your original subject line, here are optimized alternatives. Click any to test it.
                      </p>
                      <div className="space-y-3">
                        {variations.map((v, i) => {
                          const vAnalysis = analyzeSubjectLine(v.subject)
                          const scoreDiff = vAnalysis.overall - analysis.overall
                          return (
                            <div
                              key={i}
                              className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                              onClick={() => setSubject(v.subject)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                  {v.label}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold" style={{ color: getScoreColor(vAnalysis.overall) }}>
                                    {vAnalysis.overall}/100
                                  </span>
                                  {scoreDiff !== 0 && (
                                    <span className="text-xs font-bold" style={{ color: scoreDiff > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                      {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-heading)' }}>
                                {v.subject}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.reason}</p>
                            </div>
                          )
                        })}
                      </div>
                    </ResultCard>

                    <ResultCard title="Original vs Best Variation" icon="⚔️">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>ORIGINAL</p>
                          <p className="text-2xl font-bold mb-1" style={{ color: getScoreColor(analysis.overall) }}>{analysis.overall}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-body)' }}>{subject}</p>
                        </div>
                        {variations.length > 0 && (() => {
                          const best = variations.reduce((best, v) => {
                            const score = analyzeSubjectLine(v.subject).overall
                            return score > best.score ? { ...v, score } : best
                          }, { score: 0 })
                          return (
                            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-elevated)', border: `1px solid ${best.score > analysis.overall ? 'var(--success)' : 'var(--border)'}` }}>
                              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>BEST VARIATION</p>
                              <p className="text-2xl font-bold mb-1" style={{ color: getScoreColor(best.score) }}>{best.score}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--text-body)' }}>{best.subject}</p>
                            </div>
                          )
                        })()}
                      </div>
                    </ResultCard>
                  </div>
                )}

                {/* TAB: Industry Benchmark */}
                {activeTab === 'benchmark' && (
                  <div className="space-y-6">
                    <ResultCard title="Your Score vs Industry Average" icon="📈">
                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Select Your Industry</label>
                        <div className="flex flex-wrap gap-2">
                          {INDUSTRY_BENCHMARKS.map((ind, i) => (
                            <button
                              key={ind.name}
                              onClick={() => setSelectedIndustry(i)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              style={selectedIndustry === i
                                ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                              }
                            >
                              {ind.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>YOUR SCORE</p>
                          <p className="text-3xl font-bold" style={{ color: getScoreColor(analysis.overall) }}>{analysis.overall}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>INDUSTRY AVG</p>
                          <p className="text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>{INDUSTRY_BENCHMARKS[selectedIndustry].avgScore}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl" style={{
                          background: 'var(--bg-elevated)',
                          border: `1px solid ${analysis.overall > INDUSTRY_BENCHMARKS[selectedIndustry].avgScore ? 'var(--success)' : 'var(--warning)'}`,
                        }}>
                          <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>DIFFERENCE</p>
                          <p className="text-3xl font-bold" style={{
                            color: analysis.overall > INDUSTRY_BENCHMARKS[selectedIndustry].avgScore ? 'var(--success)' : 'var(--warning)',
                          }}>
                            {analysis.overall > INDUSTRY_BENCHMARKS[selectedIndustry].avgScore ? '+' : ''}{analysis.overall - INDUSTRY_BENCHMARKS[selectedIndustry].avgScore}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-body)' }}>
                          {analysis.overall > INDUSTRY_BENCHMARKS[selectedIndustry].avgScore + 15
                            ? `Your subject line scores significantly above the ${INDUSTRY_BENCHMARKS[selectedIndustry].name} industry average. You're in the top 10% — expect above-average open rates!`
                            : analysis.overall > INDUSTRY_BENCHMARKS[selectedIndustry].avgScore
                            ? `You're beating the ${INDUSTRY_BENCHMARKS[selectedIndustry].name} average. Keep optimizing with the suggestions tab to push even higher.`
                            : analysis.overall === INDUSTRY_BENCHMARKS[selectedIndustry].avgScore
                            ? `You're right at the ${INDUSTRY_BENCHMARKS[selectedIndustry].name} industry average. Apply the tips to stand out from competitors.`
                            : `You're below the ${INDUSTRY_BENCHMARKS[selectedIndustry].name} average by ${INDUSTRY_BENCHMARKS[selectedIndustry].avgScore - analysis.overall} points. Use the variations and tips to improve.`
                          }
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          Average open rate for {INDUSTRY_BENCHMARKS[selectedIndustry].name}: {INDUSTRY_BENCHMARKS[selectedIndustry].avgOpen}%
                        </p>
                      </div>
                    </ResultCard>

                    <ResultCard title="All Industries Comparison" icon="📊">
                      <div className="space-y-2">
                        {INDUSTRY_BENCHMARKS.map((ind, i) => {
                          const diff = analysis.overall - ind.avgScore
                          return (
                            <div
                              key={ind.name}
                              className="flex items-center gap-3 p-3 rounded-lg transition-all"
                              style={{
                                background: i === selectedIndustry ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                                border: i === selectedIndustry ? '1px solid var(--accent)' : '1px solid transparent',
                              }}
                            >
                              <span className="text-sm flex-shrink-0 w-36 font-medium" style={{ color: 'var(--text-body)' }}>{ind.name}</span>
                              <div className="flex-1">
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${ind.avgScore}%`, background: 'var(--text-muted)', opacity: 0.4 }} />
                                </div>
                              </div>
                              <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--text-muted)' }}>{ind.avgScore}</span>
                              <span className="text-xs font-bold w-10 text-right" style={{ color: diff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {diff >= 0 ? '+' : ''}{diff}
                              </span>
                            </div>
                          )
                        })}
                        <div className="flex items-center gap-3 p-3 rounded-lg mt-2" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                          <span className="text-sm flex-shrink-0 w-36 font-bold" style={{ color: 'var(--accent)' }}>Your Score</span>
                          <div className="flex-1">
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                              <div className="h-full rounded-full" style={{ width: `${analysis.overall}%`, background: 'var(--accent)' }} />
                            </div>
                          </div>
                          <span className="text-sm font-bold w-8 text-right" style={{ color: 'var(--accent)' }}>{analysis.overall}</span>
                          <span className="w-10" />
                        </div>
                      </div>
                    </ResultCard>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ─── A/B COMPARE MODE ─────────────────────────── */}
        {mode === 'ab' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
                  Subject Line A
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Enter subject line A..."
                  className="w-full rounded-lg py-3 px-4 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
                  Subject Line B
                </label>
                <input
                  type="text"
                  value={subjectB}
                  onChange={e => setSubjectB(e.target.value)}
                  placeholder="Enter subject line B..."
                  className="w-full rounded-lg py-3 px-4 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
            </div>

            {subject.trim() && subjectB.trim() && (
              <>
                {/* Winner Banner */}
                {abWinner && (
                  <div className="mb-6 p-4 rounded-xl text-center" style={{
                    background: abWinner === 'TIE' ? 'var(--bg-elevated)' : 'var(--accent-soft)',
                    border: `2px solid ${abWinner === 'TIE' ? 'var(--border)' : 'var(--accent)'}`,
                  }}>
                    <p className="text-2xl font-bold mb-1" style={{ color: abWinner === 'TIE' ? 'var(--text-heading)' : 'var(--accent)' }}>
                      {abWinner === 'TIE' ? "It's a Tie!" : `Subject ${abWinner} Wins!`}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {abWinner === 'TIE'
                        ? 'Both subjects scored the same. Try differentiating them more.'
                        : `Subject ${abWinner} scored ${Math.abs(analysis.overall - analysisB.overall)} points higher. Send this one.`
                      }
                    </p>
                  </div>
                )}

                {/* Side by Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject A */}
                  <div className={`space-y-4 ${abWinner === 'A' ? 'ring-2 ring-offset-2 rounded-2xl' : ''}`} style={abWinner === 'A' ? { '--tw-ring-color': 'var(--accent)', '--tw-ring-offset-color': 'var(--bg)' } : {}}>
                    <ResultCard title={`Subject A ${abWinner === 'A' ? '— WINNER' : ''}`} icon={abWinner === 'A' ? '🏆' : '🅰️'}>
                      <div className="flex flex-col items-center py-4">
                        <ScoreGauge score={analysis.overall} label={getScoreLabel(analysis.overall)} />
                      </div>
                      <div className="mt-4">
                        <ScoreBar icon="📏" label="Length" score={analysis.length.score} detail={analysis.length.detail} />
                        <ScoreBar icon="💪" label="Power Words" score={analysis.powerWords.score} detail={`${analysis.powerWords.words.length} found`} />
                        <ScoreBar icon="👤" label="Personal" score={analysis.personalization.score} detail={analysis.personalization.detail} />
                        <ScoreBar icon="⏰" label="Urgency" score={analysis.urgency.score} detail={`${analysis.urgency.words.length} cues`} />
                        <ScoreBar icon="🧠" label="Curiosity" score={analysis.curiosity.score} detail={analysis.curiosity.detail} />
                        <ScoreBar icon="🚫" label="Spam" score={analysis.spam.score} detail={`${analysis.spam.triggers.length} triggers`} />
                        <ScoreBar icon="📖" label="Readability" score={analysis.readability.score} detail={`Grade ${analysis.readability.gradeLevel}`} />
                        <ScoreBar icon="💬" label="Sentiment" score={analysis.sentiment.score} detail={analysis.sentiment.type} />
                      </div>
                    </ResultCard>
                  </div>

                  {/* Subject B */}
                  <div className={`space-y-4 ${abWinner === 'B' ? 'ring-2 ring-offset-2 rounded-2xl' : ''}`} style={abWinner === 'B' ? { '--tw-ring-color': 'var(--accent)', '--tw-ring-offset-color': 'var(--bg)' } : {}}>
                    <ResultCard title={`Subject B ${abWinner === 'B' ? '— WINNER' : ''}`} icon={abWinner === 'B' ? '🏆' : '🅱️'}>
                      <div className="flex flex-col items-center py-4">
                        <ScoreGauge score={analysisB.overall} label={getScoreLabel(analysisB.overall)} />
                      </div>
                      <div className="mt-4">
                        <ScoreBar icon="📏" label="Length" score={analysisB.length.score} detail={analysisB.length.detail} />
                        <ScoreBar icon="💪" label="Power Words" score={analysisB.powerWords.score} detail={`${analysisB.powerWords.words.length} found`} />
                        <ScoreBar icon="👤" label="Personal" score={analysisB.personalization.score} detail={analysisB.personalization.detail} />
                        <ScoreBar icon="⏰" label="Urgency" score={analysisB.urgency.score} detail={`${analysisB.urgency.words.length} cues`} />
                        <ScoreBar icon="🧠" label="Curiosity" score={analysisB.curiosity.score} detail={analysisB.curiosity.detail} />
                        <ScoreBar icon="🚫" label="Spam" score={analysisB.spam.score} detail={`${analysisB.spam.triggers.length} triggers`} />
                        <ScoreBar icon="📖" label="Readability" score={analysisB.readability.score} detail={`Grade ${analysisB.readability.gradeLevel}`} />
                        <ScoreBar icon="💬" label="Sentiment" score={analysisB.sentiment.score} detail={analysisB.sentiment.type} />
                      </div>
                    </ResultCard>
                  </div>
                </div>

                {/* Factor-by-Factor Comparison Table */}
                <div className="mt-6">
                  <ResultCard title="Head-to-Head Comparison" icon="⚔️">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th className="text-left py-2 px-3" style={{ color: 'var(--text-muted)' }}>Factor</th>
                            <th className="text-center py-2 px-3" style={{ color: 'var(--text-heading)' }}>A</th>
                            <th className="text-center py-2 px-3" style={{ color: 'var(--text-heading)' }}>B</th>
                            <th className="text-center py-2 px-3" style={{ color: 'var(--text-muted)' }}>Winner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Length', a: analysis.length.score, b: analysisB.length.score },
                            { name: 'Power Words', a: analysis.powerWords.score, b: analysisB.powerWords.score },
                            { name: 'Personalization', a: analysis.personalization.score, b: analysisB.personalization.score },
                            { name: 'Urgency', a: analysis.urgency.score, b: analysisB.urgency.score },
                            { name: 'Emoji', a: analysis.emoji.score, b: analysisB.emoji.score },
                            { name: 'Spam Check', a: analysis.spam.score, b: analysisB.spam.score },
                            { name: 'Curiosity', a: analysis.curiosity.score, b: analysisB.curiosity.score },
                            { name: 'Readability', a: analysis.readability.score, b: analysisB.readability.score },
                            { name: 'Sentiment', a: analysis.sentiment.score, b: analysisB.sentiment.score },
                          ].map(factor => (
                            <tr key={factor.name} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td className="py-2 px-3 font-medium" style={{ color: 'var(--text-body)' }}>{factor.name}</td>
                              <td className="py-2 px-3 text-center font-bold" style={{ color: factor.a >= factor.b ? 'var(--success)' : 'var(--text-muted)' }}>{factor.a}</td>
                              <td className="py-2 px-3 text-center font-bold" style={{ color: factor.b >= factor.a ? 'var(--success)' : 'var(--text-muted)' }}>{factor.b}</td>
                              <td className="py-2 px-3 text-center">
                                {factor.a > factor.b ? '🅰️' : factor.b > factor.a ? '🅱️' : '🤝'}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold" style={{ background: 'var(--bg-elevated)' }}>
                            <td className="py-3 px-3" style={{ color: 'var(--text-heading)' }}>OVERALL</td>
                            <td className="py-3 px-3 text-center" style={{ color: getScoreColor(analysis.overall) }}>{analysis.overall}</td>
                            <td className="py-3 px-3 text-center" style={{ color: getScoreColor(analysisB.overall) }}>{analysisB.overall}</td>
                            <td className="py-3 px-3 text-center text-lg">
                              {analysis.overall > analysisB.overall ? '🏆 A' : analysisB.overall > analysis.overall ? '🏆 B' : '🤝'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </ResultCard>
                </div>
              </>
            )}
          </>
        )}

        {/* ─── BULK MODE ────────────────────────────────── */}
        {mode === 'bulk' && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-body)' }}>
                Paste Multiple Subject Lines (one per line)
              </label>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={"Subject line 1\nSubject line 2\nSubject line 3\n..."}
                rows={6}
                className="w-full rounded-lg py-3 px-4 text-sm focus:outline-none resize-y"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {bulkText.split('\n').filter(l => l.trim()).length} subject lines entered
                </span>
                <button
                  onClick={() => setBulkText('')}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {bulkResults.length > 0 && (
              <ResultCard title={`Leaderboard (${bulkResults.length} subjects ranked)`} icon="🏆">
                <div className="space-y-2">
                  {bulkResults.map((result, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                      style={{
                        background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                        border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
                      }}
                      onClick={() => { setSubject(result.subject); setMode('single') }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{
                        background: i === 0 ? 'var(--accent)' : 'var(--bg-card)',
                        color: i === 0 ? 'var(--text-on-accent)' : 'var(--text-muted)',
                        border: i > 0 ? '1px solid var(--border)' : 'none',
                      }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{result.subject}</p>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.analysis.meta?.wordCount} words</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.analysis.meta?.charCount} chars</span>
                          <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{result.analysis.sentiment.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: getScoreColor(result.analysis.overall) }}>
                          {result.analysis.overall}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</p>
                      </div>
                    </div>
                  ))}
                </div>

                {bulkResults.length >= 2 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>{bulkResults[0]?.analysis.overall}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best Score</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                        {Math.round(bulkResults.reduce((s, r) => s + r.analysis.overall, 0) / bulkResults.length)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Average</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-lg font-bold" style={{ color: 'var(--danger)' }}>{bulkResults[bulkResults.length - 1]?.analysis.overall}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Worst Score</p>
                    </div>
                  </div>
                )}

                <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  Click any subject to deep-analyze it in Single Test mode
                </p>
              </ResultCard>
            )}
          </>
        )}

        {/* ─── HISTORY ──────────────────────────────────── */}
        {history && history.length > 0 && (
          <div className="mt-8">
            <ResultCard title={`Test History (${history.length} tests)`} icon="📋">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Score:</span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(avgHistoryScore) }}>{avgHistoryScore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Best:</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>{Math.max(...history.map(h => h.score))}</span>
                  </div>
                </div>
                <button
                  onClick={() => setHistory([])}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-2">
                {history.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                    onClick={() => { setSubject(entry.subject); setMode('single') }}
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-card)', border: `2px solid ${getScoreColor(entry.score)}` }}
                    >
                      <span className="text-sm font-bold" style={{ color: getScoreColor(entry.score) }}>{entry.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{entry.subject}</p>
                      <div className="flex gap-3">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.testedAt}</p>
                        {entry.wordCount && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.wordCount} words</p>}
                        {entry.sentiment && <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{entry.sentiment}</p>}
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to re-test</span>
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="subject-line-results" filename="subject-line-analysis.pdf" label="Export as PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
