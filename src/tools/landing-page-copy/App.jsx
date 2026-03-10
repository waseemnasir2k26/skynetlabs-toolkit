import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

const CTA_OPTIONS = [
  'Book a Call',
  'Get a Quote',
  'Start Free Trial',
  'Download Guide',
  'Contact Us',
]

const TONE_OPTIONS = [
  'Professional & Trustworthy',
  'Bold & Confident',
  'Warm & Approachable',
  'Technical & Expert',
]

function generateCopy(form) {
  const {
    serviceName,
    whatYouDo,
    painPoint,
    uniqueApproach,
    keyResults,
    cta,
    tone,
  } = form

  const serviceLower = serviceName.toLowerCase()
  const painWords = painPoint.split(/[.,!?\n]+/).map(s => s.trim()).filter(Boolean)
  const approachWords = uniqueApproach.split(/[.,!?\n]+/).map(s => s.trim()).filter(Boolean)
  const resultLines = keyResults
    ? keyResults.split(/\n+/).map(s => s.trim()).filter(Boolean)
    : []

  const toneAdj =
    tone === 'Professional & Trustworthy'
      ? { adj: 'proven', verb: 'trust', feel: 'reliable' }
      : tone === 'Bold & Confident'
      ? { adj: 'game-changing', verb: 'dominate', feel: 'unstoppable' }
      : tone === 'Warm & Approachable'
      ? { adj: 'friendly', verb: 'enjoy', feel: 'delightful' }
      : { adj: 'cutting-edge', verb: 'leverage', feel: 'powerful' }

  const sections = {}

  // HERO
  sections.hero = {
    title: 'Hero Section',
    content: `**H1:** Stop Struggling With ${painWords[0] || 'Your Biggest Challenge'} \u2014 ${serviceName} Makes It Effortless

**Subheadline:** ${whatYouDo}. We use a ${toneAdj.adj} approach so you can finally ${toneAdj.verb} your results without the frustration.

**CTA Button:** ${cta}

**Micro-text under CTA:** No commitment required \u2022 Results in days, not months \u2022 Join 500+ happy clients`,
  }

  // PROBLEM
  const painList = [
    painWords[0] || 'Wasting time on inefficient processes',
    painWords[1] || 'Losing money to outdated solutions',
    painWords[2] || 'Falling behind competitors who already solved this',
  ]
  sections.problem = {
    title: 'Problem Section',
    content: `**Section Headline:** Sound Familiar?

You know the feeling. You\u2019re ${painList[0].toLowerCase()}, and it\u2019s costing you more than you realize.

**Pain Point 1:** \u201c${painList[0]}\u201d \u2014 Every day you wait, the problem compounds. Your team is stretched thin and results are slipping.

**Pain Point 2:** \u201c${painList[1]}\u201d \u2014 You\u2019ve tried other solutions but nothing sticks. The frustration keeps building.

**Pain Point 3:** \u201c${painList[2]}\u201d \u2014 Meanwhile, your competitors are pulling ahead. The gap is widening and the clock is ticking.

**Transition:** There\u2019s a better way. And it starts with ${serviceName}.`,
  }

  // SOLUTION
  const steps = [
    approachWords[0] || `We analyze your current situation and identify quick wins`,
    approachWords[1] || `We implement our ${toneAdj.adj} solution tailored to your needs`,
    approachWords[2] || `We optimize and scale so you see compounding results`,
  ]
  sections.solution = {
    title: 'Solution Section',
    content: `**Section Headline:** How ${serviceName} Solves This

**Step 1: Discover**
${steps[0]}. We start by understanding exactly where you are and where you need to go.

**Step 2: Implement**
${steps[1]}. Our team handles the heavy lifting so you can focus on what matters.

**Step 3: Scale**
${steps[2]}. Watch your results grow as our ${toneAdj.feel} system does the work.`,
  }

  // BENEFITS
  const benefits = [
    { title: 'Save Time', desc: `Stop wasting hours on ${painWords[0] ? painWords[0].toLowerCase() : 'manual processes'}. Our solution automates the tedious work.` },
    { title: 'Increase Revenue', desc: `Clients see measurable results within weeks. ${resultLines[0] || 'More leads, more sales, more growth.'}` },
    { title: 'Reduce Stress', desc: `No more worrying about ${painWords[1] ? painWords[1].toLowerCase() : 'falling behind'}. Our ${toneAdj.adj} approach handles it.` },
    { title: 'Stay Ahead', desc: `While competitors guess, you\u2019ll have a ${toneAdj.feel} system driving consistent results.` },
    { title: 'Expert Support', desc: `Our team is with you every step. Questions? Concerns? We\u2019re a message away.` },
    { title: 'Proven Results', desc: resultLines[1] || `Join hundreds of businesses that transformed their operations with ${serviceName}.` },
  ]
  sections.benefits = {
    title: 'Benefits Section',
    content: `**Section Headline:** Why ${serviceName}?\n\n` +
      benefits.map((b, i) => `**Benefit ${i + 1}: ${b.title}**\n${b.desc}`).join('\n\n'),
  }

  // SOCIAL PROOF
  sections.socialProof = {
    title: 'Social Proof Framework',
    content: `**Section Headline:** Don\u2019t Just Take Our Word For It

**Testimonial Template 1:**
\u201cBefore ${serviceName}, we were ${painWords[0] ? painWords[0].toLowerCase() : 'struggling'}. Now, ${resultLines[0] || 'our results speak for themselves'}.\u201d
\u2014 [Client Name], [Title] at [Company]

**Testimonial Template 2:**
\u201cThe ${toneAdj.adj} approach of ${serviceName} changed everything. We saw results within the first month.\u201d
\u2014 [Client Name], [Title] at [Company]

**Testimonial Template 3:**
\u201cI wish we\u2019d found ${serviceName} sooner. The ROI has been incredible.\u201d
\u2014 [Client Name], [Title] at [Company]

**Stats Bar:**
\u2022 500+ Clients Served \u2022 98% Satisfaction Rate \u2022 ${resultLines[2] || '10x Average ROI'}`,
  }

  // HOW IT WORKS
  sections.howItWorks = {
    title: 'How It Works',
    content: `**Section Headline:** Getting Started Is Easy

**Step 1: ${cta}**
Click the button below and tell us about your situation. It takes less than 2 minutes.

**Step 2: Get Your Custom Plan**
We\u2019ll analyze your needs and create a tailored strategy using our ${toneAdj.adj} methodology.

**Step 3: Watch Results Roll In**
Sit back as ${serviceName} goes to work. ${resultLines[0] || 'Most clients see measurable improvements within 30 days.'}

**Step 4: Scale & Optimize**
As results compound, we fine-tune and scale. Your growth becomes predictable and sustainable.`,
  }

  // FAQ
  sections.faq = {
    title: 'FAQ Section',
    content: `**Section Headline:** Frequently Asked Questions

**Q1: How quickly will I see results?**
A: Most clients see initial results within 2-4 weeks. ${resultLines[0] ? `Our clients typically achieve: ${resultLines[0]}` : `The timeline depends on your starting point, but we prioritize quick wins.`}

**Q2: What makes ${serviceName} different from other solutions?**
A: ${approachWords[0] || `Our ${toneAdj.adj} approach`}. Unlike generic solutions, we ${uniqueApproach.slice(0, 120)}.

**Q3: How much does it cost?**
A: We offer flexible plans based on your needs. ${cta === 'Book a Call' ? 'Book a free consultation' : cta} to get a custom quote \u2014 no obligation.

**Q4: Do I need technical expertise?**
A: Not at all. We handle everything. You just need to show up and tell us your goals.

**Q5: What if it doesn\u2019t work for my business?**
A: We\u2019ve helped businesses across dozens of industries. During your initial consultation, we\u2019ll assess fit honestly \u2014 we only work with clients we know we can help.

**Q6: Can I cancel anytime?**
A: Absolutely. No long-term contracts. We earn your business every month through results, not lock-ins.`,
  }

  // FINAL CTA
  sections.finalCta = {
    title: 'Final CTA Section',
    content: `**Headline:** Ready to Stop ${painWords[0] ? painWords[0].charAt(0).toUpperCase() + painWords[0].slice(1).toLowerCase() : 'Struggling'} and Start Growing?

**Body:** You\u2019ve seen how ${serviceName} works. You know the results are real. The only question is: how much longer will you wait?

Every day without a solution is another day of ${painWords[1] ? painWords[1].toLowerCase() : 'lost opportunity'}. Your competitors aren\u2019t waiting \u2014 and neither should you.

**Primary CTA:** ${cta}
**Secondary CTA:** See Our Case Studies

**Guarantee Line:** \u2728 100% satisfaction guaranteed. If you\u2019re not seeing results, we\u2019ll make it right.`,
  }

  return sections
}

function sectionsToMarkdown(sections) {
  return Object.values(sections)
    .map(s => `## ${s.title}\n\n${s.content}`)
    .join('\n\n---\n\n')
}

export default function App() {
  const [form, setForm] = useState({
    serviceName: '',
    whatYouDo: '',
    painPoint: '',
    uniqueApproach: '',
    keyResults: '',
    cta: 'Book a Call',
    tone: 'Professional & Trustworthy',
  })
  const [results, setResults] = useState(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const canGenerate =
    form.serviceName.trim() &&
    form.whatYouDo.trim() &&
    form.painPoint.trim() &&
    form.uniqueApproach.trim()

  const handleGenerate = () => {
    if (!canGenerate) return
    setResults(generateCopy(form))
  }

  const handleReset = () => {
    setForm({
      serviceName: '',
      whatYouDo: '',
      painPoint: '',
      uniqueApproach: '',
      keyResults: '',
      cta: 'Book a Call',
      tone: 'Professional & Trustworthy',
    })
    setResults(null)
  }

  return (
    <ToolLayout
      title="AI Landing Page Copy Generator"
      description="Generate complete, conversion-focused landing page copy in seconds. Template-based smart substitution \u2014 no AI API needed."
    >
      {!results ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <ResultCard title="Service Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  Service / Business Name *
                </label>
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={e => update('serviceName', e.target.value)}
                  placeholder="e.g. SkynetLabs Automation"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  What do you do? (one sentence) *
                </label>
                <input
                  type="text"
                  value={form.whatYouDo}
                  onChange={e => update('whatYouDo', e.target.value)}
                  placeholder="e.g. We build AI-powered automation systems that save businesses 20+ hours per week"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  Target client&apos;s biggest pain point *
                </label>
                <textarea
                  value={form.painPoint}
                  onChange={e => update('painPoint', e.target.value)}
                  rows={3}
                  placeholder="Describe the main problems your target clients face. Use separate lines or sentences for multiple pain points."
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none resize-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  Your unique approach *
                </label>
                <textarea
                  value={form.uniqueApproach}
                  onChange={e => update('uniqueApproach', e.target.value)}
                  rows={3}
                  placeholder="What makes your solution different? Describe your methodology or unique angle."
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none resize-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  Key results / metrics (optional)
                </label>
                <textarea
                  value={form.keyResults}
                  onChange={e => update('keyResults', e.target.value)}
                  rows={2}
                  placeholder="e.g. 300% increase in leads, 50% cost reduction, 20 hours saved per week"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none resize-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Tone & CTA">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  Desired CTA
                </label>
                <select
                  value={form.cta}
                  onChange={e => update('cta', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                >
                  {CTA_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
                  Tone
                </label>
                <select
                  value={form.tone}
                  onChange={e => update('tone', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-heading)' }}
                >
                  {TONE_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </ResultCard>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${!canGenerate ? 'cursor-not-allowed' : ''}`} style={canGenerate ? { background: 'var(--accent)', color: 'var(--text-heading)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
          >
            Generate Copy
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border rounded-lg transition-all text-sm" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
            >
              &larr; Start Over
            </button>
            <CopyButton
              text={sectionsToMarkdown(results)}
              label="Export All as Markdown"
              className="!px-4 !py-2"
            />
          </div>

          <div id="landing-page-results" className="space-y-6">
            {Object.entries(results).map(([key, section]) => (
              <ResultCard key={key} title={section.title}>
                <div className="relative">
                  <div className="absolute top-0 right-0">
                    <CopyButton text={`## ${section.title}\n\n${section.content}`} label="Copy" />
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed pr-20 text-sm" style={{ color: 'var(--text-body)' }}>
                    {section.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <span key={i} className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                            {part.slice(2, -2)}
                          </span>
                        )
                      }
                      return <span key={i}>{part}</span>
                    })}
                  </div>
                </div>
              </ResultCard>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
