import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import ScoreGauge from '../shared/ScoreGauge'
import { generateId } from '../shared/utils'

const POWER_WORDS = [
  'free', 'new', 'proven', 'secret', 'you', 'instant', 'how', 'now',
  'announcing', 'introducing', 'improvement', 'amazing', 'sensational',
  'remarkable', 'revolutionary', 'startling', 'miracle', 'offer',
  'quick', 'easy', 'hurry', 'limited', 'exclusive', 'guaranteed',
  'discover', 'save', 'results', 'powerful', 'ultimate', 'bonus',
  'alert', 'breaking', 'urgent', 'important', 'unlock', 'insider',
  'transform', 'boost', 'skyrocket', 'dominate', 'crush', 'hack',
]

const SPAM_TRIGGERS = [
  'buy now', 'act now', 'click here', 'limited time', 'order now',
  'winner', 'congratulations', 'cash', 'earn money', 'make money',
  'double your', 'no obligation', '100% free', 'risk-free', 'no cost',
  'credit card', 'subscribe', 'unsubscribe', 'dear friend', 'as seen on',
  '$$$', '!!!', 'all caps', 'guarantee', 'no catch', 'apply now',
]

const URGENCY_WORDS = [
  'now', 'today', 'hurry', 'urgent', 'limited', 'deadline', 'expires',
  'last chance', 'final', 'ending', 'running out', 'don\'t miss', 'before',
  'tonight', 'tomorrow', 'hours left', 'closing', 'soon',
]

function analyzeSubjectLine(subject) {
  if (!subject.trim()) {
    return {
      overall: 0,
      length: { score: 0, detail: 'Enter a subject line to analyze' },
      powerWords: { score: 0, detail: 'No subject line', words: [] },
      personalization: { score: 0, detail: 'No subject line' },
      urgency: { score: 0, detail: 'No subject line', words: [] },
      emoji: { score: 0, detail: 'No subject line' },
      spam: { score: 0, detail: 'No subject line', triggers: [] },
      tips: [],
    }
  }

  const words = subject.toLowerCase().split(/\s+/)
  const wordCount = words.length
  const charCount = subject.length

  // 1. Length score (optimal 6-10 words, 30-50 chars)
  let lengthScore = 0
  let lengthDetail = ''
  if (wordCount >= 6 && wordCount <= 10) {
    lengthScore = 100
    lengthDetail = `${wordCount} words - Perfect length for open rates`
  } else if (wordCount >= 4 && wordCount <= 12) {
    lengthScore = 70
    lengthDetail = `${wordCount} words - Good, but ${wordCount < 6 ? 'could be slightly longer' : 'could be slightly shorter'}`
  } else if (wordCount >= 2 && wordCount <= 15) {
    lengthScore = 40
    lengthDetail = `${wordCount} words - ${wordCount < 4 ? 'Too short, add more context' : 'Too long, will get cut off on mobile'}`
  } else {
    lengthScore = 15
    lengthDetail = `${wordCount} words - ${wordCount < 2 ? 'Way too short' : 'Way too long, will be truncated'}`
  }

  // Char length bonus/penalty
  if (charCount > 60) {
    lengthScore = Math.max(10, lengthScore - 20)
    lengthDetail += ` (${charCount} chars - may get cut off)`
  }

  // 2. Power words
  const foundPower = POWER_WORDS.filter(pw => words.includes(pw) || subject.toLowerCase().includes(pw))
  let powerScore = 0
  let powerDetail = ''
  if (foundPower.length >= 3) {
    powerScore = 100
    powerDetail = `${foundPower.length} power words found - Excellent!`
  } else if (foundPower.length === 2) {
    powerScore = 75
    powerDetail = '2 power words - Good emotional trigger'
  } else if (foundPower.length === 1) {
    powerScore = 45
    powerDetail = '1 power word - Add 1-2 more for impact'
  } else {
    powerScore = 10
    powerDetail = 'No power words detected - Add emotional triggers'
  }

  // 3. Personalization
  const hasPersonalization = /\{|\[|{{|your |you |you\'re/i.test(subject)
  const hasName = /\{(first_?name|name|fname)\}|\[(first_?name|name|fname)\]/i.test(subject)
  let personalizationScore = 0
  let personalizationDetail = ''
  if (hasName) {
    personalizationScore = 100
    personalizationDetail = 'Name personalization token found - Great for open rates!'
  } else if (hasPersonalization) {
    personalizationScore = 70
    personalizationDetail = 'Personalization detected (you/your) - Good connection'
  } else {
    personalizationScore = 20
    personalizationDetail = 'No personalization - Add "you" or merge tags like {first_name}'
  }

  // 4. Urgency
  const foundUrgency = URGENCY_WORDS.filter(uw => subject.toLowerCase().includes(uw))
  let urgencyScore = 0
  let urgencyDetail = ''
  if (foundUrgency.length >= 2) {
    urgencyScore = 90
    urgencyDetail = `${foundUrgency.length} urgency cues - Strong motivation to open`
  } else if (foundUrgency.length === 1) {
    urgencyScore = 60
    urgencyDetail = '1 urgency cue found - Good, creates FOMO'
  } else {
    urgencyScore = 25
    urgencyDetail = 'No urgency - Consider adding time pressure'
  }

  // 5. Emoji
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
  const emojis = subject.match(emojiRegex) || []
  let emojiScore = 0
  let emojiDetail = ''
  if (emojis.length === 1) {
    emojiScore = 90
    emojiDetail = '1 emoji - Perfect! Stands out in inbox without overdoing it'
  } else if (emojis.length === 2) {
    emojiScore = 65
    emojiDetail = '2 emojis - Acceptable, but 1 is optimal'
  } else if (emojis.length >= 3) {
    emojiScore = 25
    emojiDetail = `${emojis.length} emojis - Too many! Looks spammy`
  } else {
    emojiScore = 50
    emojiDetail = 'No emoji - Adding 1 emoji can boost open rates 5-10%'
  }

  // 6. Spam check
  const foundSpam = SPAM_TRIGGERS.filter(st => subject.toLowerCase().includes(st))
  const hasAllCaps = /[A-Z]{4,}/.test(subject) && subject !== subject.toLowerCase()
  const hasExcessivePunctuation = /[!?]{2,}/.test(subject)
  if (hasAllCaps) foundSpam.push('ALL CAPS WORDS')
  if (hasExcessivePunctuation) foundSpam.push('Excessive punctuation (!!/??)')

  let spamScore = 0
  let spamDetail = ''
  if (foundSpam.length === 0) {
    spamScore = 100
    spamDetail = 'No spam triggers - Clean subject line'
  } else if (foundSpam.length <= 2) {
    spamScore = 55
    spamDetail = `${foundSpam.length} potential spam triggers - May affect deliverability`
  } else {
    spamScore = 10
    spamDetail = `${foundSpam.length} spam triggers! - High risk of landing in spam`
  }

  // Overall score (weighted)
  const overall = Math.round(
    (lengthScore * 0.20) +
    (powerScore * 0.20) +
    (personalizationScore * 0.15) +
    (urgencyScore * 0.15) +
    (emojiScore * 0.10) +
    (spamScore * 0.20)
  )

  // Generate tips
  const tips = []
  if (lengthScore < 70) tips.push(`Aim for 6-10 words (currently ${wordCount}). Short subjects get 21% more opens.`)
  if (powerScore < 50) tips.push(`Add power words like: "${POWER_WORDS.slice(0, 5).join('", "')}" to trigger emotion.`)
  if (personalizationScore < 50) tips.push('Use "you/your" or add {first_name} merge tags. Personalized subjects get 26% more opens.')
  if (urgencyScore < 50) tips.push('Add time pressure: "today only", "last chance", "before midnight" to create FOMO.')
  if (emojiScore < 50) tips.push('Add a single relevant emoji at the start or end. Keep it to one for best results.')
  if (spamScore < 70) {
    tips.push(`Remove spam triggers: "${foundSpam.slice(0, 3).join('", "')}". These hurt deliverability.`)
  }
  if (charCount > 50) tips.push(`At ${charCount} characters, your subject may be truncated on mobile. Consider trimming.`)
  if (subject.startsWith('Re:') || subject.startsWith('Fwd:')) tips.push('Fake "Re:" or "Fwd:" tricks are deceptive and hurt trust.')

  return {
    overall,
    length: { score: lengthScore, detail: lengthDetail },
    powerWords: { score: powerScore, detail: powerDetail, words: foundPower },
    personalization: { score: personalizationScore, detail: personalizationDetail },
    urgency: { score: urgencyScore, detail: urgencyDetail, words: foundUrgency },
    emoji: { score: emojiScore, detail: emojiDetail },
    spam: { score: spamScore, detail: spamDetail, triggers: foundSpam },
    tips,
  }
}

function ScoreBar({ label, score, detail }) {
  const getColor = (s) => {
    if (s >= 80) return 'var(--success)'
    if (s >= 60) return 'var(--info)'
    if (s >= 40) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{label}</span>
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

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  if (score >= 30) return 'Needs Work'
  return 'Poor'
}

export default function App() {
  const [subject, setSubject] = useLocalStorage('skynet-subject-line-subject', '')
  const [history, setHistory] = useLocalStorage('skynet-subject-line-history', [])

  const { generateShareURL } = useShareableURL(
    { subject },
    { subject: setSubject }
  )

  const analysis = useMemo(() => analyzeSubjectLine(subject), [subject])

  const handleTest = () => {
    if (!subject.trim()) return
    const entry = {
      id: generateId(),
      subject: subject.trim(),
      score: analysis.overall,
      testedAt: new Date().toLocaleString(),
    }
    setHistory(prev => {
      const updated = [entry, ...(prev || [])].slice(0, 5)
      return updated
    })
  }

  const handleClear = () => {
    setSubject('')
  }

  return (
    <ToolLayout
      title="Email Subject Line Tester"
      description="Score your email subject lines before you send. Get actionable feedback on length, power words, personalization, urgency, and spam risk."
      category="Ad Creative & Marketing"
      icon="📧"
      proTip="The best subject lines are 6-10 words, include 1 emoji, use 'you/your', and create curiosity or urgency. A/B test your top 2 subjects with a small segment before sending to your full list."
    >
      <div id="subject-line-results">
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
              placeholder="e.g., You're missing out on 10x growth (here's how)"
              className="flex-1 rounded-lg py-3 px-4 text-sm focus:outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              onKeyDown={e => { if (e.key === 'Enter') handleTest() }}
            />
            <button
              onClick={handleTest}
              className="px-5 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-105"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              Test
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-lg font-medium text-sm transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
            >
              Clear
            </button>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {subject.split(/\s+/).filter(Boolean).length} words
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {subject.length} characters
            </span>
          </div>
        </div>

        {subject.trim() && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Score Gauge + Factor Scores */}
            <div className="space-y-6">
              {/* Overall Score */}
              <ResultCard title="Overall Score" icon="🎯">
                <div className="flex flex-col items-center py-4">
                  <ScoreGauge score={analysis.overall} label={getScoreLabel(analysis.overall)} />
                  <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-body)' }}>
                    {analysis.overall >= 80 && 'This subject line is ready to send! Strong emotional triggers and clean formatting.'}
                    {analysis.overall >= 60 && analysis.overall < 80 && 'Good foundation. Apply the tips below to push it past 80.'}
                    {analysis.overall >= 40 && analysis.overall < 60 && 'Average subject line. Needs more work before sending.'}
                    {analysis.overall < 40 && 'This subject line needs significant improvement. See tips below.'}
                  </p>
                </div>
              </ResultCard>

              {/* Preview */}
              <ResultCard title="Inbox Preview" icon="📱">
                <div
                  className="rounded-lg p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      YN
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>Your Name</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>
                        {subject || 'Your subject line here...'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Preview text goes here. This is where the first line of your email body shows...
                      </p>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>now</span>
                  </div>
                </div>
                {subject.length > 50 && (
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                    <span>&#9888;</span> Subject will be truncated on most mobile devices after ~50 characters
                  </p>
                )}
              </ResultCard>
            </div>

            {/* RIGHT: Individual Scores + Tips */}
            <div className="space-y-6">
              <ResultCard title="Score Breakdown" icon="📊">
                <ScoreBar label="Length" score={analysis.length.score} detail={analysis.length.detail} />
                <ScoreBar label="Power Words" score={analysis.powerWords.score} detail={analysis.powerWords.detail} />
                {analysis.powerWords.words.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 -mt-2">
                    {analysis.powerWords.words.map(w => (
                      <span
                        key={w}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
                <ScoreBar label="Personalization" score={analysis.personalization.score} detail={analysis.personalization.detail} />
                <ScoreBar label="Urgency" score={analysis.urgency.score} detail={analysis.urgency.detail} />
                {analysis.urgency.words.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 -mt-2">
                    {analysis.urgency.words.map(w => (
                      <span
                        key={w}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
                <ScoreBar label="Emoji Usage" score={analysis.emoji.score} detail={analysis.emoji.detail} />
                <ScoreBar label="Spam Check" score={analysis.spam.score} detail={analysis.spam.detail} />
                {analysis.spam.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 -mt-2">
                    {analysis.spam.triggers.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </ResultCard>

              {/* Tips */}
              {analysis.tips.length > 0 && (
                <ResultCard title="How to Improve" icon="💡">
                  <ul className="space-y-3">
                    {analysis.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-body)' }}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </ResultCard>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <div className="mt-6">
            <ResultCard title="Test History (Last 5)" icon="📋">
              <div className="space-y-2">
                {history.map(entry => {
                  const getColor = (s) => {
                    if (s >= 80) return 'var(--success)'
                    if (s >= 60) return 'var(--info)'
                    if (s >= 40) return 'var(--warning)'
                    return 'var(--danger)'
                  }
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                      onClick={() => setSubject(entry.subject)}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--bg-card)', border: `2px solid ${getColor(entry.score)}` }}
                      >
                        <span className="text-sm font-bold" style={{ color: getColor(entry.score) }}>{entry.score}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{entry.subject}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.testedAt}</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to re-test</span>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => setHistory([])}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Clear History
              </button>
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
