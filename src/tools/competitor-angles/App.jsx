import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'

const PLATFORM_OPTIONS = [
  'Meta / Facebook',
  'Instagram',
  'Google Ads',
  'LinkedIn',
  'TikTok',
  'YouTube',
  'X / Twitter',
]

const ANGLE_TEMPLATES = [
  {
    name: 'The "Anti-{keyword}" Angle',
    whyItWorks: 'Directly challenges the competitor\'s core positioning, making your brand the obvious alternative for frustrated customers.',
    headlineTemplate: {
      'Meta / Facebook': 'Tired of {keyword}? There\'s a better way to {benefit}.',
      'Instagram': 'POV: You ditched {keyword} and finally got {benefit}',
      'Google Ads': '{benefit} Without {keyword} | {brand} Alternative',
      'LinkedIn': 'Why top companies are moving beyond {keyword} to achieve {benefit}',
      'TikTok': 'When they told me to try {keyword} but I found {brand} instead',
      'YouTube': 'I Tried {competitor} vs {brand} \u2014 Here\'s What Actually Works',
      'X / Twitter': '{keyword} is dead. Here\'s what\'s replacing it for {benefit}.',
    },
    visualConcept: 'Split screen: frustrated user with competitor vs. happy user with your solution.',
    emotionalTrigger: 'Frustration \u2192 Relief',
  },
  {
    name: 'The "Hidden Cost" Angle',
    whyItWorks: 'Exposes the true cost of the competitor\'s approach, positioning your solution as the smarter investment.',
    headlineTemplate: {
      'Meta / Facebook': 'The hidden cost of {keyword} nobody talks about \u2014 and how {brand} saves you {benefit}.',
      'Instagram': '\ud83d\udcb0 What {keyword} is REALLY costing you (swipe to see)',
      'Google Ads': 'Stop Overpaying for {keyword} | Save with {brand}',
      'LinkedIn': 'The ROI gap: What {keyword} costs vs. what {brand} delivers',
      'TikTok': 'I calculated what {keyword} actually costs and... \ud83d\ude33',
      'YouTube': 'The REAL Cost of {competitor}: What They Don\'t Tell You',
      'X / Twitter': 'Hot take: {keyword} costs 3x more than you think. Here\'s the math.',
    },
    visualConcept: 'Cost comparison infographic with shocking price reveal animation.',
    emotionalTrigger: 'Shock \u2192 Smart Decision',
  },
  {
    name: 'The "Results Gap" Angle',
    whyItWorks: 'Shows the measurable difference between competitor\'s promises and your proven results.',
    headlineTemplate: {
      'Meta / Facebook': '{competitor} promises {keyword}. We deliver {benefit}. See the difference.',
      'Instagram': 'Expectations vs. Reality: {keyword} edition \ud83d\udc40',
      'Google Ads': 'Get Real {benefit} \u2014 Not Just {keyword} Promises | {brand}',
      'LinkedIn': 'Case study: From {keyword} disappointment to {benefit} with {brand}',
      'TikTok': 'They promised {keyword}. We actually delivered {benefit}.',
      'YouTube': '{competitor} Promised {keyword} \u2014 Here\'s What I Got Instead',
      'X / Twitter': 'Promises vs. results. {keyword} vs. {benefit}. The gap is real.',
    },
    visualConcept: 'Before/after transformation with real metrics and data points.',
    emotionalTrigger: 'Skepticism \u2192 Proof',
  },
  {
    name: 'The "Future-Proof" Angle',
    whyItWorks: 'Positions competitors as outdated while your solution is forward-thinking and innovative.',
    headlineTemplate: {
      'Meta / Facebook': 'Still using {keyword}? The market has moved to {benefit}. Don\'t get left behind.',
      'Instagram': '2025 called. It wants your {keyword} back. \u27a1\ufe0f Try {benefit} instead.',
      'Google Ads': 'Modern {benefit} Solution | Beyond {keyword} | {brand}',
      'LinkedIn': 'The evolution from {keyword} to {benefit}: why forward-thinking teams choose {brand}',
      'TikTok': 'Using {keyword} in 2025? Let me show you what smart brands use instead.',
      'YouTube': 'Why Smart Companies Ditched {keyword} for {brand} in 2025',
      'X / Twitter': '{keyword} = yesterday. {benefit} = tomorrow. Which side are you on?',
    },
    visualConcept: 'Timeline evolution graphic showing old approach fading, new approach rising.',
    emotionalTrigger: 'FOMO \u2192 Innovation',
  },
  {
    name: 'The "Simplicity" Angle',
    whyItWorks: 'Attacks complexity of competitor\'s solution, positioning yours as effortless and user-friendly.',
    headlineTemplate: {
      'Meta / Facebook': '{keyword} made simple. No complexity. No headaches. Just {benefit}.',
      'Instagram': 'Tag someone who needs to stop overcomplicating {keyword}',
      'Google Ads': 'Simple {benefit} in Minutes | No {keyword} Complexity | {brand}',
      'LinkedIn': 'We replaced 5 {keyword} tools with one {brand} platform. Here\'s what happened.',
      'TikTok': 'POV: You realize {keyword} doesn\'t have to be this complicated',
      'YouTube': 'How to Get {benefit} Without the {keyword} Complexity',
      'X / Twitter': '{keyword} shouldn\'t require a PhD. {brand} makes it simple.',
    },
    visualConcept: 'Cluttered, complex competitor interface vs. clean, minimal your solution.',
    emotionalTrigger: 'Overwhelm \u2192 Clarity',
  },
]

function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
    'should', 'may', 'might', 'must', 'can', 'could', 'and', 'but', 'or',
    'nor', 'not', 'so', 'yet', 'for', 'at', 'by', 'from', 'in', 'into',
    'of', 'on', 'to', 'with', 'that', 'this', 'these', 'those', 'it',
    'its', 'they', 'them', 'their', 'we', 'our', 'us', 'you', 'your',
    'i', 'me', 'my', 'he', 'she', 'him', 'her', 'his', 'who', 'what',
    'which', 'when', 'where', 'how', 'why', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'only', 'own', 'same', 'than', 'too', 'very', 'just', 'about',
    'also', 'then', 'over', 'after', 'before', 'between', 'under',
    'through', 'during', 'without', 'within', 'along', 'around',
    'because', 'if', 'while', 'as', 'up', 'out', 'off', 'down',
  ])

  const words = text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  const freq = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w)
}

function extractBenefits(differentiators) {
  const lines = differentiators
    .split(/[.,;\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)

  return lines.length > 0 ? lines : ['better results', 'faster outcomes', 'simpler process']
}

function generateAngles(form) {
  const { competitorName, competitorPositioning, yourService, differentiators, platforms } = form

  const compKeywords = extractKeywords(competitorPositioning)
  const benefits = extractBenefits(differentiators)
  const brandName = yourService.split(/\s+/).slice(0, 3).join(' ')
  const competitor = competitorName || 'the competitor'

  const activePlatforms = platforms.length > 0 ? platforms : ['Meta / Facebook', 'Google Ads']

  const angles = ANGLE_TEMPLATES.map((template, idx) => {
    const keyword = compKeywords[idx % compKeywords.length] || 'their approach'
    const benefit = benefits[idx % benefits.length] || 'better results'

    const headlines = {}
    activePlatforms.forEach(p => {
      const tmpl = template.headlineTemplate[p] || template.headlineTemplate['Meta / Facebook']
      headlines[p] = tmpl
        .replace(/\{keyword\}/g, keyword)
        .replace(/\{benefit\}/g, benefit)
        .replace(/\{brand\}/g, brandName)
        .replace(/\{competitor\}/g, competitor)
    })

    return {
      name: template.name.replace(/\{keyword\}/g, keyword),
      whyItWorks: template.whyItWorks,
      headlines,
      visualConcept: template.visualConcept,
      emotionalTrigger: template.emotionalTrigger,
      keyword,
      benefit,
    }
  })

  // Summary
  const summary = `Competitor "${competitor}" positions around: ${compKeywords.slice(0, 5).join(', ')}. Your differentiators emphasize: ${benefits.slice(0, 3).join('; ')}. The strongest counter-positioning opportunities lie in directly challenging their ${compKeywords[0] || 'core'} positioning while highlighting your ${benefits[0] || 'unique value'}.`

  // Top 2 recommendations
  const top2 = [angles[0], angles[2]] // Anti-keyword and Results Gap are usually strongest

  return { angles, summary, top2, compKeywords, benefits }
}

function anglesToText(angles, summary) {
  let text = `# Competitor Ad Angle Analysis\n\n## Summary\n${summary}\n\n`
  angles.forEach((angle, i) => {
    text += `## Angle ${i + 1}: ${angle.name}\n`
    text += `**Why it works:** ${angle.whyItWorks}\n`
    text += `**Emotional trigger:** ${angle.emotionalTrigger}\n`
    text += `**Visual concept:** ${angle.visualConcept}\n\n`
    text += `### Headlines by Platform\n`
    Object.entries(angle.headlines).forEach(([p, h]) => {
      text += `- **${p}:** ${h}\n`
    })
    text += '\n---\n\n'
  })
  return text
}

export default function App() {
  const [form, setForm] = useState({
    competitorName: '',
    competitorPositioning: '',
    yourService: '',
    differentiators: '',
    platforms: [],
  })
  const [results, setResults] = useState(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const togglePlatform = (p) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }))
  }

  const canGenerate =
    form.competitorPositioning.trim() &&
    form.yourService.trim() &&
    form.differentiators.trim()

  const handleGenerate = () => {
    if (!canGenerate) return
    setResults(generateAngles(form))
  }

  const handleReset = () => {
    setForm({
      competitorName: '',
      competitorPositioning: '',
      yourService: '',
      differentiators: '',
      platforms: [],
    })
    setResults(null)
  }

  return (
    <ToolLayout
      title="AI Competitor Ad Angle Finder"
      description="Analyze competitor positioning and generate counter-angles for your ad campaigns. Template-based keyword extraction \u2014 no AI API needed."
    >
      {!results ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <ResultCard title="Competitor Info">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Competitor Business Name / URL
                </label>
                <input
                  type="text"
                  value={form.competitorName}
                  onChange={e => update('competitorName', e.target.value)}
                  placeholder="e.g. CompetitorCo or competitor.com"
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Competitor&apos;s Positioning *
                </label>
                <textarea
                  value={form.competitorPositioning}
                  onChange={e => update('competitorPositioning', e.target.value)}
                  rows={3}
                  placeholder="Describe how they position themselves. What do they claim? What's their tagline, key messaging, unique selling points?"
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Your Business">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  YOUR Service Description *
                </label>
                <textarea
                  value={form.yourService}
                  onChange={e => update('yourService', e.target.value)}
                  rows={3}
                  placeholder="Describe what you offer. What's your service or product?"
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Your Differentiators *
                </label>
                <textarea
                  value={form.differentiators}
                  onChange={e => update('differentiators', e.target.value)}
                  rows={3}
                  placeholder="What makes you different? List your unique advantages, one per line."
                  className="w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Target Platforms">
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.platforms.includes(p)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-dark-200/50 text-gray-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select platforms to get platform-specific headlines. Defaults to Meta + Google if none selected.</p>
          </ResultCard>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
              canGenerate
                ? 'bg-primary hover:bg-primary/90 text-white'
                : 'bg-dark-200/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            Find Counter-Angles
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-dark-200/50 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              &larr; Start Over
            </button>
            <CopyButton
              text={anglesToText(results.angles, results.summary)}
              label="Copy All Angles"
              className="!px-4 !py-2"
            />
            <ExportButton
              elementId="competitor-angles-results"
              filename="competitor-angles.pdf"
              label="Export as PDF"
            />
          </div>

          <div id="competitor-angles-results" className="space-y-6">
            {/* Summary */}
            <ResultCard title="Competitor Analysis Summary">
              <p className="text-gray-300 text-sm leading-relaxed">{results.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Competitor keywords:</span>
                {results.compKeywords.slice(0, 6).map(k => (
                  <span key={k} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">{k}</span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Your benefits:</span>
                {results.benefits.slice(0, 4).map((b, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">{b}</span>
                ))}
              </div>
            </ResultCard>

            {/* 5 Angles */}
            {results.angles.map((angle, idx) => (
              <ResultCard key={idx} title={`Angle ${idx + 1}: ${angle.name}`}>
                <div className="relative">
                  <div className="absolute top-0 right-0">
                    <CopyButton
                      text={`Angle: ${angle.name}\nWhy: ${angle.whyItWorks}\nTrigger: ${angle.emotionalTrigger}\nVisual: ${angle.visualConcept}\n\nHeadlines:\n${Object.entries(angle.headlines).map(([p, h]) => `${p}: ${h}`).join('\n')}`}
                      label="Copy"
                    />
                  </div>

                  <div className="space-y-4 pr-16">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Why it works</p>
                      <p className="text-gray-300 text-sm">{angle.whyItWorks}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Example Headlines by Platform</p>
                      <div className="space-y-2">
                        {Object.entries(angle.headlines).map(([platform, headline]) => (
                          <div key={platform} className="bg-dark-200/30 p-3 rounded-lg">
                            <p className="text-xs text-primary font-medium mb-0.5">{platform}</p>
                            <p className="text-white text-sm font-medium">&ldquo;{headline}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-dark-200/30 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-0.5">Visual Concept</p>
                        <p className="text-gray-300 text-sm">{angle.visualConcept}</p>
                      </div>
                      <div className="bg-dark-200/30 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-0.5">Emotional Trigger</p>
                        <p className="text-primary text-sm font-medium">{angle.emotionalTrigger}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ResultCard>
            ))}

            {/* Comparison Matrix */}
            <ResultCard title="Angle Comparison Matrix">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Angle</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Target Keyword</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Your Benefit</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Emotional Trigger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.angles.map((angle, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-3 px-3 text-white font-medium">{angle.name}</td>
                        <td className="py-3 px-3 text-red-400">{angle.keyword}</td>
                        <td className="py-3 px-3 text-primary">{angle.benefit}</td>
                        <td className="py-3 px-3 text-gray-300">{angle.emotionalTrigger}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultCard>

            {/* Top 2 */}
            <ResultCard title="Recommended Top 2 Angles">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.top2.map((angle, idx) => (
                  <div key={idx} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-white font-semibold text-sm">{angle.name}</h4>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{angle.whyItWorks}</p>
                    <p className="text-primary text-xs font-medium">{angle.emotionalTrigger}</p>
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
