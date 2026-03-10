import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

const PLATFORMS = [
  { value: 'Google Search', headline: 30, description: 90, label: 'Google Search Ads' },
  { value: 'Meta', headline: 40, primary: 125, description: 30, label: 'Meta (Facebook) Ads' },
  { value: 'Instagram', headline: 40, primary: 125, description: 30, label: 'Instagram Ads' },
  { value: 'LinkedIn', headline: 70, intro: 150, description: 100, label: 'LinkedIn Ads' },
  { value: 'TikTok', headline: 40, text: 100, label: 'TikTok Ads' },
  { value: 'YouTube', headline: 100, description: 200, label: 'YouTube Ads' },
  { value: 'X/Twitter', headline: 50, text: 280, label: 'X/Twitter Ads' },
]

const TONES = ['Professional', 'Casual', 'Urgent', 'Inspirational', 'Educational', 'Bold', 'Friendly', 'Witty']

const CTA_GOALS = ['Book a Call', 'Get a Quote', 'Start Free Trial', 'Learn More', 'Download', 'Sign Up']

const TONE_MODIFIERS = {
  Professional: { prefix: ['Trusted', 'Proven', 'Expert', 'Industry-leading', 'Reliable'], verb: ['Discover', 'Explore', 'Unlock', 'Achieve', 'Elevate'] },
  Casual: { prefix: ['Easy', 'Simple', 'Quick', 'Fun', 'Awesome'], verb: ['Try', 'Check out', 'Grab', 'Jump into', 'See why'] },
  Urgent: { prefix: ['Limited', 'Last Chance', 'Hurry', 'Act Now', 'Ending Soon'], verb: ['Grab', 'Secure', 'Claim', 'Rush to', 'Don\'t miss'] },
  Inspirational: { prefix: ['Transform', 'Reimagine', 'Empower', 'Elevate', 'Dream'], verb: ['Unlock', 'Achieve', 'Build', 'Create', 'Inspire'] },
  Educational: { prefix: ['Learn', 'Discover', 'Master', 'Understand', 'See How'], verb: ['Learn', 'Find out', 'Uncover', 'Master', 'Study'] },
  Bold: { prefix: ['Disruptive', 'Unmatched', 'Fearless', 'Next-Level', 'Game-Changing'], verb: ['Dominate', 'Crush', 'Conquer', 'Own', 'Shatter'] },
  Friendly: { prefix: ['Welcome', 'Hello', 'Hey', 'Your New', 'Meet'], verb: ['Meet', 'Welcome', 'Join', 'Come see', 'Say hi to'] },
  Witty: { prefix: ['Plot twist:', 'Spoiler:', 'Fun fact:', 'Surprise:', 'Breaking:'], verb: ['Outsmart', 'Hack', 'Shortcut', 'Skip ahead', 'Fast-track'] },
}

const GOOGLE_NEGATIVE_KEYWORDS = [
  'free', 'cheap', 'DIY', 'tutorial', 'how to', 'template', 'sample', 'example',
  'salary', 'job', 'careers', 'hiring', 'intern', 'course', 'class', 'certification',
  'review', 'complaint', 'scam', 'reddit', 'forum', 'wiki',
]

function truncate(text, maxLen) {
  return text.length <= maxLen ? text : text.substring(0, maxLen - 1) + '\u2026'
}

function generateAdCopy(form) {
  const { service, keyword, platform, tone, usp, ctaGoal } = form
  const platSpec = PLATFORMS.find(p => p.value === platform)
  const toneData = TONE_MODIFIERS[tone] || TONE_MODIFIERS.Professional
  const headlineMax = platSpec.headline || 40
  const primaryMax = platSpec.primary || platSpec.intro || platSpec.text || platSpec.description || 125

  const serviceShort = service.length > 20 ? service.substring(0, 20) : service
  const keywordShort = keyword.length > 15 ? keyword.substring(0, 15) : keyword

  // 10 Headline variations
  const headlineTemplates = [
    `${toneData.prefix[0]} ${serviceShort}`,
    `${toneData.verb[0]} ${serviceShort} Today`,
    `${keywordShort} - ${toneData.prefix[1]} Results`,
    `#1 ${serviceShort} ${toneData.prefix[2]}s`,
    `${toneData.verb[1]} ${serviceShort} Now`,
    `${toneData.prefix[3]} ${keywordShort}`,
    `${ctaGoal} | ${serviceShort}`,
    `${toneData.verb[2]} Your ${keywordShort}`,
    `${serviceShort}: ${toneData.prefix[4]}`,
    `${toneData.verb[3]} with ${serviceShort}`,
  ]

  const headlines = headlineTemplates.map(h => {
    const text = truncate(h, headlineMax)
    return { text, charCount: text.length, withinLimit: text.length <= headlineMax }
  })

  // 5 Primary text variations
  const primaryTemplates = [
    `${toneData.verb[0]} ${service} that delivers real results. ${usp ? usp.substring(0, 50) + '. ' : ''}${ctaGoal} today and see the difference.`,
    `Looking for ${keyword}? ${service} is built for businesses like yours. ${usp ? usp.substring(0, 40) + '. ' : ''}${ctaGoal} now.`,
    `${toneData.prefix[0]} ${service} trusted by businesses everywhere. ${usp ? usp.substring(0, 45) + '. ' : ''}Ready to grow? ${ctaGoal}.`,
    `Stop wasting time on ${keyword} that doesn't work. Our ${service} ${usp ? '(' + usp.substring(0, 35) + ') ' : ''}gets results. ${ctaGoal}.`,
    `${toneData.prefix[1]} ${service} for ${keyword}. ${usp ? usp.substring(0, 50) + '. ' : ''}Join hundreds of happy clients. ${ctaGoal}.`,
  ]

  const primaryTexts = primaryTemplates.map(p => {
    const text = truncate(p, primaryMax)
    return { text, charCount: text.length, withinLimit: text.length <= primaryMax }
  })

  // 5 CTA variations
  const ctaTemplates = {
    'Book a Call': ['Book Your Free Call', 'Schedule a Call', 'Talk to an Expert', 'Book Now', 'Get on a Call'],
    'Get a Quote': ['Get Your Free Quote', 'Request a Quote', 'Get Pricing', 'See Our Rates', 'Quote in 60 Seconds'],
    'Start Free Trial': ['Start Free Trial', 'Try It Free', 'Free Trial - No CC', 'Test Drive Free', 'Start Free Today'],
    'Learn More': ['Learn More', 'See How It Works', 'Explore Now', 'Find Out More', 'See Details'],
    'Download': ['Download Now', 'Get Your Copy', 'Download Free', 'Grab It Now', 'Get Instant Access'],
    'Sign Up': ['Sign Up Free', 'Join Now', 'Create Account', 'Get Started Free', 'Sign Up Today'],
  }

  const ctas = (ctaTemplates[ctaGoal] || ctaTemplates['Learn More']).map(c => ({
    text: c, charCount: c.length,
  }))

  // A/B Pair suggestions
  const abPairs = [
    { a: headlines[0].text, b: headlines[1].text, test: 'Headline: Trust vs. Action' },
    { a: primaryTexts[0].text, b: primaryTexts[3].text, test: 'Body: Benefit-led vs. Pain-led' },
    { a: ctas[0].text, b: ctas[2].text, test: 'CTA: Standard vs. Low-friction' },
  ]

  // Negative keywords (Google only)
  const negativeKeywords = platform === 'Google Search' ? GOOGLE_NEGATIVE_KEYWORDS : null

  // Platform specs reference
  const specsRef = Object.entries(platSpec)
    .filter(([k]) => k !== 'value' && k !== 'label')
    .map(([k, v]) => ({ field: k.charAt(0).toUpperCase() + k.slice(1), maxChars: v }))

  return { headlines, primaryTexts, ctas, abPairs, negativeKeywords, specsRef, platformLabel: platSpec.label }
}

export default function App() {
  const [form, setForm] = useState({
    service: '',
    keyword: '',
    platform: 'Google Search',
    tone: 'Professional',
    usp: '',
    ctaGoal: 'Book a Call',
  })
  const [results, setResults] = useState(null)

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const isValid = form.service.trim() && form.keyword.trim()

  const handleGenerate = () => {
    if (!isValid) return
    setResults(generateAdCopy(form))
  }

  const handleReset = () => {
    setForm({ service: '', keyword: '', platform: 'Google Search', tone: 'Professional', usp: '', ctaGoal: 'Book a Call' })
    setResults(null)
  }

  const getAllText = () => {
    if (!results) return ''
    let t = `=== AD COPY: ${form.platform} ===\n\n`
    t += `Service: ${form.service}\nKeyword: ${form.keyword}\nTone: ${form.tone}\nCTA Goal: ${form.ctaGoal}\n\n`
    t += '--- HEADLINES ---\n'
    results.headlines.forEach((h, i) => { t += `${i + 1}. ${h.text} (${h.charCount} chars) ${h.withinLimit ? 'OK' : 'OVER'}\n` })
    t += '\n--- PRIMARY TEXT ---\n'
    results.primaryTexts.forEach((p, i) => { t += `${i + 1}. ${p.text}\n\n` })
    t += '--- CTAs ---\n'
    results.ctas.forEach((c, i) => { t += `${i + 1}. ${c.text}\n` })
    t += '\n--- A/B PAIRS ---\n'
    results.abPairs.forEach((ab, i) => { t += `Test ${i + 1} (${ab.test}):\n  A: ${ab.a}\n  B: ${ab.b}\n\n` })
    if (results.negativeKeywords) {
      t += '--- NEGATIVE KEYWORDS ---\n' + results.negativeKeywords.join(', ')
    }
    return t
  }

  return (
    <ToolLayout
      title="AI Ad Copy Generator"
      description="Generate platform-optimized ad copy with headlines, primary text, CTAs, and A/B test suggestions tailored to character limits."
    >
      {!results ? (
        <div className="max-w-3xl mx-auto">
          <ResultCard title="Ad Copy Details" icon="✍️">
            <div className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Service / Product *</label>
                <input type="text" value={form.service} onChange={e => updateForm('service', e.target.value)}
                  placeholder="e.g., AI Automation, Web Design, SEO Services..."
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Target Keyword *</label>
                <input type="text" value={form.keyword} onChange={e => updateForm('keyword', e.target.value)}
                  placeholder="e.g., marketing agency, web developer, business consultant..."
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Platform</label>
                  <select value={form.platform} onChange={e => updateForm('platform', e.target.value)}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tone</label>
                  <select value={form.tone} onChange={e => updateForm('tone', e.target.value)}
                    className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Unique Selling Proposition (optional)</label>
                <textarea value={form.usp} onChange={e => updateForm('usp', e.target.value)} rows={2}
                  placeholder="What makes you different? e.g., 10x faster delivery, 100% money-back guarantee..."
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">CTA Goal</label>
                <select value={form.ctaGoal} onChange={e => updateForm('ctaGoal', e.target.value)}
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                  {CTA_GOALS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button onClick={handleGenerate} disabled={!isValid}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Generate Copy
              </button>
            </div>
          </ResultCard>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={handleReset} className="px-4 py-2 bg-dark-200/50 text-gray-300 rounded-lg text-sm hover:bg-dark-300 transition-colors">&larr; Start Over</button>
            <CopyButton text={getAllText()} label="Copy All" />
          </div>

          {/* Platform Specs */}
          <ResultCard title={`${results.platformLabel} - Character Limits`} icon="📐">
            <div className="flex flex-wrap gap-3">
              {results.specsRef.map(s => (
                <div key={s.field} className="bg-dark-200/30 rounded-lg px-4 py-2 border border-white/5">
                  <span className="text-gray-400 text-xs block">{s.field}</span>
                  <span className="text-primary font-semibold">{s.maxChars} chars</span>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Headlines */}
          <ResultCard title="Headline Variations" icon="🔤">
            <div className="space-y-2">
              {results.headlines.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-dark-200/30 rounded-lg px-4 py-2.5 border border-white/5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-gray-500 text-xs w-5 shrink-0">{i + 1}.</span>
                    <span className="text-white text-sm truncate">{h.text}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-mono ${h.withinLimit ? 'text-green-400' : 'text-red-400'}`}>
                      {h.charCount} {h.withinLimit ? '\u2705' : '\u274C'}
                    </span>
                    <CopyButton text={h.text} label="" />
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Primary Text */}
          <ResultCard title="Primary Text Variations" icon="📝">
            <div className="space-y-3">
              {results.primaryTexts.map((p, i) => (
                <div key={i} className="bg-dark-200/30 rounded-lg p-4 border border-white/5">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-gray-300 text-sm flex-1">{p.text}</p>
                    <CopyButton text={p.text} label="" className="shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-mono ${p.withinLimit ? 'text-green-400' : 'text-red-400'}`}>
                      {p.charCount} chars {p.withinLimit ? '\u2705' : '\u274C'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* CTAs */}
          <ResultCard title="Call-to-Action Variations" icon="🎯">
            <div className="flex flex-wrap gap-3">
              {results.ctas.map((c, i) => (
                <div key={i} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                  <span className="text-primary font-medium text-sm">{c.text}</span>
                  <span className="text-gray-500 text-xs">({c.charCount})</span>
                  <CopyButton text={c.text} label="" />
                </div>
              ))}
            </div>
          </ResultCard>

          {/* A/B Pairs */}
          <ResultCard title="A/B Test Pair Suggestions" icon="🧪">
            <div className="space-y-4">
              {results.abPairs.map((ab, i) => (
                <div key={i} className="bg-dark-200/30 rounded-lg p-4 border border-white/5">
                  <h4 className="text-primary font-medium text-sm mb-3">Test {i + 1}: {ab.test}</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-dark-300/30 rounded-lg p-3 border border-white/5">
                      <span className="text-xs text-gray-500 block mb-1">Version A</span>
                      <p className="text-gray-300 text-sm">{ab.a}</p>
                    </div>
                    <div className="bg-dark-300/30 rounded-lg p-3 border border-primary/10">
                      <span className="text-xs text-primary block mb-1">Version B</span>
                      <p className="text-gray-300 text-sm">{ab.b}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          {/* Negative Keywords (Google only) */}
          {results.negativeKeywords && (
            <ResultCard title="Suggested Negative Keywords" icon="🚫">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {results.negativeKeywords.map(kw => (
                    <span key={kw} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs border border-red-500/20">{kw}</span>
                  ))}
                </div>
                <CopyButton text={results.negativeKeywords.join(', ')} label="Copy" className="shrink-0" />
              </div>
              <p className="text-gray-500 text-xs mt-3">Add these to your Google Ads campaign to prevent wasted spend on irrelevant searches.</p>
            </ResultCard>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
