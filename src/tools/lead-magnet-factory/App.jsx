import React, { useState, useRef } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'
import { useToast } from '../shared/Toast'
import ShareButton from '../shared/ShareButton'

const LEAD_MAGNET_TYPES = [
  { id: 'checklist', name: 'Checklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', description: 'Step-by-step actionable checklist your audience can follow' },
  { id: 'template', name: 'Template', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', description: 'Ready-to-use template or framework they can apply immediately' },
  { id: 'calculator', name: 'Calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', description: 'Interactive calculator that provides personalized results' },
  { id: 'guide', name: 'Mini-Guide', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', description: 'Short educational guide (3-5 pages) packed with actionable advice' },
  { id: 'swipefile', name: 'Swipe File', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2', description: 'Collection of proven examples, scripts, or copy they can adapt' },
]

function generateContent(type, topic, audience, brand, niche) {
  const t = topic || 'your topic'
  const a = audience || 'your audience'
  const b = brand || 'Your Brand'
  const n = niche || 'your industry'

  const templates = {
    checklist: {
      title: `The Ultimate ${t} Checklist`,
      subtitle: `Everything ${a} need to know about ${t.toLowerCase()}`,
      sections: [
        {
          heading: 'Phase 1: Foundation & Research',
          items: [
            `Define your primary goals for ${t.toLowerCase()}`,
            `Research your target market and competitor landscape`,
            `Identify 3-5 key metrics you will track`,
            `Set up your tracking and measurement tools`,
            `Create a realistic timeline with milestones`,
          ],
        },
        {
          heading: 'Phase 2: Strategy & Planning',
          items: [
            `Develop your core ${t.toLowerCase()} strategy document`,
            `Map out your ideal customer journey`,
            `Create messaging frameworks for each stage`,
            `Plan your content and resource requirements`,
            `Set up your tech stack and integrations`,
            `Build templates for recurring tasks`,
          ],
        },
        {
          heading: 'Phase 3: Execution & Launch',
          items: [
            `Execute your launch plan step by step`,
            `Test everything before going live`,
            `Set up automated workflows where possible`,
            `Create a feedback collection system`,
            `Document your processes for future reference`,
          ],
        },
        {
          heading: 'Phase 4: Optimization & Growth',
          items: [
            `Review your metrics weekly for the first month`,
            `A/B test your key conversion points`,
            `Gather customer feedback and testimonials`,
            `Identify bottlenecks and optimize`,
            `Scale what works and cut what does not`,
            `Plan for phase 2 improvements`,
          ],
        },
      ],
    },
    template: {
      title: `${t} Template Pack`,
      subtitle: `Ready-to-use templates for ${a}`,
      sections: [
        {
          heading: 'Template 1: Strategy Brief',
          items: [
            `OBJECTIVE: [Describe your primary ${t.toLowerCase()} goal]`,
            `TARGET AUDIENCE: [Define your ideal ${a}]`,
            `KEY MESSAGES: [List 3-5 core messages]`,
            `CHANNELS: [Where will you execute this strategy?]`,
            `TIMELINE: [Start date] to [End date]`,
            `BUDGET: [Allocated budget and breakdown]`,
            `SUCCESS METRICS: [How will you measure success?]`,
          ],
        },
        {
          heading: 'Template 2: Weekly Action Plan',
          items: [
            `WEEK OF: [Date]`,
            `TOP 3 PRIORITIES: [List your must-dos]`,
            `CONTENT TO CREATE: [Specific deliverables]`,
            `OUTREACH TARGETS: [Who to connect with]`,
            `METRICS TO REVIEW: [What to check]`,
            `WINS FROM LAST WEEK: [Celebrate progress]`,
            `BLOCKERS: [What is slowing you down?]`,
          ],
        },
        {
          heading: 'Template 3: Client/Customer Communication',
          items: [
            `SUBJECT: Update on [${t} project/initiative]`,
            `SUMMARY: [2-3 sentence overview of progress]`,
            `KEY ACCOMPLISHMENTS: [Bullet point wins]`,
            `NEXT STEPS: [What happens next]`,
            `ACTION NEEDED: [Any decisions or approvals needed]`,
            `TIMELINE UPDATE: [On track/adjusted timeline]`,
          ],
        },
        {
          heading: 'Template 4: Results Report',
          items: [
            `REPORTING PERIOD: [Date range]`,
            `EXECUTIVE SUMMARY: [3-sentence overview]`,
            `KEY METRICS: [Numbers and trends]`,
            `WINS: [What went well]`,
            `CHALLENGES: [What needs improvement]`,
            `RECOMMENDATIONS: [Next steps based on data]`,
            `ROI CALCULATION: [Investment vs. returns]`,
          ],
        },
      ],
    },
    calculator: {
      title: `${t} ROI Calculator`,
      subtitle: `Calculate your potential results with ${t.toLowerCase()}`,
      sections: [
        {
          heading: 'Input Variables',
          items: [
            `Current monthly revenue: $[amount]`,
            `Monthly marketing budget: $[amount]`,
            `Current conversion rate: [X]%`,
            `Average customer lifetime value: $[amount]`,
            `Monthly website visitors: [number]`,
            `Current customer acquisition cost: $[amount]`,
          ],
        },
        {
          heading: 'Calculation Formula',
          items: [
            `Projected improvement rate: 20-40% (based on ${n} benchmarks)`,
            `New conversion rate = Current rate x (1 + improvement %)`,
            `Additional monthly customers = Visitors x improvement in conversion`,
            `Monthly revenue increase = Additional customers x Average order value`,
            `Annual ROI = (Revenue increase x 12 - Investment) / Investment x 100`,
          ],
        },
        {
          heading: 'Industry Benchmarks for ${niche}',
          items: [
            `Average conversion rate: 2.5-5%`,
            `Top performers achieve: 8-12%`,
            `Typical improvement timeline: 3-6 months`,
            `Expected ROI range: 200-500%`,
            `Break-even point: Usually within 2-4 months`,
          ],
        },
        {
          heading: 'Your Projected Results',
          items: [
            `Conservative estimate (20% improvement): $[calculated]`,
            `Moderate estimate (35% improvement): $[calculated]`,
            `Aggressive estimate (50% improvement): $[calculated]`,
            `Recommended next step: Start with [specific action]`,
          ],
        },
      ],
    },
    guide: {
      title: `The ${a}'s Guide to ${t}`,
      subtitle: `A practical mini-guide by ${b}`,
      sections: [
        {
          heading: 'Chapter 1: Why ${t} Matters Now',
          items: [
            `The landscape of ${n} is changing rapidly, and ${t.toLowerCase()} is at the center of this transformation.`,
            `Key statistic: Companies investing in ${t.toLowerCase()} see an average of 3x improvement in results.`,
            `The biggest mistake ${a.toLowerCase()} make is waiting too long to start.`,
            `By the end of this guide, you will have a clear action plan for the next 30 days.`,
          ],
        },
        {
          heading: 'Chapter 2: The Framework',
          items: [
            `Step 1 - Audit: Assess your current ${t.toLowerCase()} performance honestly.`,
            `Step 2 - Prioritize: Focus on the 20% of actions that drive 80% of results.`,
            `Step 3 - Execute: Implement changes systematically, not all at once.`,
            `Step 4 - Measure: Track your key metrics weekly and adjust.`,
            `Step 5 - Optimize: Double down on what works, cut what does not.`,
          ],
        },
        {
          heading: 'Chapter 3: Common Mistakes to Avoid',
          items: [
            `Mistake #1: Trying to do everything at once instead of focusing.`,
            `Mistake #2: Not tracking results and making data-driven decisions.`,
            `Mistake #3: Copying competitors instead of finding your unique angle.`,
            `Mistake #4: Ignoring your existing customers while chasing new ones.`,
            `Mistake #5: Under-investing in the tools and systems that save time.`,
          ],
        },
        {
          heading: 'Chapter 4: Your 30-Day Action Plan',
          items: [
            `Week 1: Complete your audit and identify your top 3 priorities.`,
            `Week 2: Implement your first high-impact change and set up tracking.`,
            `Week 3: Review initial results and make adjustments.`,
            `Week 4: Optimize your approach and plan for month 2.`,
            `Bonus: Schedule a strategy session to accelerate your results.`,
          ],
        },
      ],
    },
    swipefile: {
      title: `${t} Swipe File`,
      subtitle: `Proven examples and scripts for ${a}`,
      sections: [
        {
          heading: 'Email Subject Lines That Convert',
          items: [
            `"How [Company] achieved [result] with ${t.toLowerCase()} in just [timeframe]"`,
            `"The ${t.toLowerCase()} mistake that is costing you $[amount]/month"`,
            `"[Number] ${t.toLowerCase()} strategies I wish I knew when I started"`,
            `"Your ${t.toLowerCase()} results vs. industry average [see the gap]"`,
            `"Quick question about your ${t.toLowerCase()} strategy"`,
          ],
        },
        {
          heading: 'Social Media Post Templates',
          items: [
            `HOOK: "I helped a client achieve [specific result] with one simple ${t.toLowerCase()} change. Here is what we did (thread):"`,
            `STORY: "Last year our ${t.toLowerCase()} was broken. We were [pain point]. Then we discovered [solution]. Here is the exact framework:"`,
            `VALUE: "[Number] ${t.toLowerCase()} tips that actually work (save this): 1. [tip] 2. [tip] 3. [tip]"`,
            `CTA: "I created a free [resource] that helps ${a.toLowerCase()} with ${t.toLowerCase()}. Drop '[keyword]' in the comments and I will send it to you."`,
          ],
        },
        {
          heading: 'Sales/Outreach Scripts',
          items: [
            `OPENER: "Hi [Name], I noticed [specific observation about their ${t.toLowerCase()}]. I recently helped a similar [business type] achieve [result]..."`,
            `FOLLOW-UP: "Hi [Name], wanted to share a quick case study relevant to your ${t.toLowerCase()} situation. [Client] was facing [similar challenge] and we..."`,
            `OBJECTION HANDLER: "I completely understand the hesitation. What if we started with a [small commitment] so you can see the results before committing further?"`,
            `CLOSE: "Based on everything we have discussed, I recommend [specific plan]. The investment is [price] and we can get started as early as [date]. Shall I send over the proposal?"`,
          ],
        },
        {
          heading: 'Headline Formulas',
          items: [
            `"How to [Achieve Desired Result] Without [Common Pain Point]"`,
            `"[Number] Proven ${t} Strategies for ${a} in [Year]"`,
            `"The Complete ${t} Playbook: From [Starting Point] to [Goal]"`,
            `"Why ${a} Are Switching to [Your Approach] for ${t}"`,
            `"Stop [Common Mistake]: The Smarter Way to [Achieve Result] with ${t}"`,
          ],
        },
      ],
    },
  }

  return templates[type] || templates.checklist
}

function generateLandingPageHtml(config) {
  const { headline, bullets, ctaText, brandName, bgColor, accentColor, topic, audience } = config
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${headline}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bgColor}; color: #fff; }
.hero { max-width: 680px; margin: 0 auto; padding: 60px 24px; text-align: center; }
.badge { display: inline-block; padding: 6px 16px; background: ${accentColor}22; color: ${accentColor}; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; border: 1px solid ${accentColor}33; }
h1 { font-size: 2.5rem; line-height: 1.2; margin-bottom: 16px; font-weight: 800; }
h1 span { color: ${accentColor}; }
.subtitle { color: #9ca3af; font-size: 1.1rem; line-height: 1.6; margin-bottom: 40px; }
.bullets { text-align: left; max-width: 480px; margin: 0 auto 40px; }
.bullet { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.bullet-icon { width: 24px; height: 24px; background: ${accentColor}22; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; color: ${accentColor}; font-weight: bold; font-size: 14px; }
.bullet-text { color: #d1d5db; font-size: 15px; line-height: 1.5; }
.form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; max-width: 440px; margin: 0 auto 32px; }
.form-card input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 15px; margin-bottom: 12px; outline: none; }
.form-card input:focus { border-color: ${accentColor}; }
.form-card input::placeholder { color: #6b7280; }
.cta-btn { width: 100%; padding: 16px; background: ${accentColor}; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.cta-btn:hover { opacity: 0.9; }
.trust { display: flex; justify-content: center; gap: 24px; margin-top: 24px; color: #6b7280; font-size: 13px; }
.trust-item { display: flex; align-items: center; gap: 6px; }
.footer { text-align: center; padding: 40px 24px; color: #4b5563; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); }
.footer a { color: ${accentColor}; text-decoration: none; }
@media (max-width: 640px) { h1 { font-size: 1.75rem; } .hero { padding: 40px 16px; } }
</style>
</head>
<body>
<div class="hero">
  <div class="badge">FREE RESOURCE</div>
  <h1>${headline.replace(topic, `<span>${topic}</span>`)}</h1>
  <p class="subtitle">Join thousands of ${audience.toLowerCase()} who have used this resource to get real results. Download your free copy today.</p>
  <div class="bullets">
${bullets.map(b => `    <div class="bullet">
      <div class="bullet-icon">&#10003;</div>
      <div class="bullet-text">${b}</div>
    </div>`).join('\n')}
  </div>
  <div class="form-card">
    <input type="text" placeholder="Your full name" />
    <input type="email" placeholder="Your best email address" />
    <button class="cta-btn">${ctaText}</button>
  </div>
  <div class="trust">
    <div class="trust-item"><span>&#128274;</span> No spam, ever</div>
    <div class="trust-item"><span>&#9889;</span> Instant download</div>
    <div class="trust-item"><span>&#10003;</span> 100% free</div>
  </div>
</div>
<div class="footer">
  <p>Created by <a href="https://www.skynetjoe.com" target="_blank">${brandName}</a></p>
</div>
</body>
</html>`
}

export default function App() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useLocalStorage('skynet-lead-magnet-type', null)
  const [topic, setTopic] = useLocalStorage('skynet-lead-magnet-topic', '')
  const [audience, setAudience] = useLocalStorage('skynet-lead-magnet-audience', '')
  const [brand, setBrand] = useLocalStorage('skynet-lead-magnet-brand', '')
  const [niche, setNiche] = useLocalStorage('skynet-lead-magnet-niche', '')
  const [generatedContent, setGeneratedContent] = useLocalStorage('skynet-lead-magnet-content', null)
  const [editedContent, setEditedContent] = useLocalStorage('skynet-lead-magnet-edited', null)
  const [previewMode, setPreviewMode] = useState('desktop')
  const toast = useToast()

  // Landing page customization
  const [lpConfig, setLpConfig] = useLocalStorage('skynet-lead-magnet-lp', {
    headline: '',
    bullets: ['', '', '', ''],
    ctaText: 'Get My Free Copy Now',
    bgColor: '#0a0a0f',
    accentColor: '#13b973', // User-configurable color for exported landing page HTML
  })

  const goToStep = (s) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(s)
  }

  const handleGenerate = () => {
    const content = generateContent(selectedType, topic, audience, brand, niche)
    setGeneratedContent(content)
    setEditedContent(JSON.parse(JSON.stringify(content)))
    // Initialize landing page config
    setLpConfig(prev => ({
      ...prev,
      headline: `Get Your Free ${topic} ${LEAD_MAGNET_TYPES.find(t => t.id === selectedType)?.name || 'Resource'}`,
      bullets: [
        `Step-by-step ${topic.toLowerCase()} framework you can implement today`,
        `Proven strategies used by successful ${audience.toLowerCase()}`,
        `Save hours of research and trial-and-error`,
        `Actionable tips specific to ${niche || 'your industry'}`,
      ],
    }))
    goToStep(2)
  }

  const updateBullet = (idx, val) => {
    setLpConfig(prev => {
      const bullets = [...prev.bullets]
      bullets[idx] = val
      return { ...prev, bullets }
    })
  }

  const updateSectionItem = (sIdx, iIdx, val) => {
    setEditedContent(prev => {
      const updated = JSON.parse(JSON.stringify(prev))
      updated.sections[sIdx].items[iIdx] = val
      return updated
    })
  }

  const downloadLandingPage = () => {
    const html = generateLandingPageHtml({
      ...lpConfig,
      brandName: brand || 'SkynetLabs',
      topic,
      audience,
    })
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'landing-page.html'; a.click()
    URL.revokeObjectURL(url)
    if (toast) toast('Landing page downloaded!', 'success')
  }

  const downloadContentPdf = async () => {
    // Use the ExportButton pattern but trigger directly
    const el = document.getElementById('lead-magnet-content')
    if (!el) return
    const root = document.documentElement
    const originalTheme = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'light')
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const ratio = pdfWidth / canvas.width
      const totalPdfHeight = canvas.height * ratio
      let position = 0
      while (position < totalPdfHeight) {
        if (position > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, totalPdfHeight)
        position += pdfHeight
      }
      pdf.save(`${(editedContent?.title || 'lead-magnet').toLowerCase().replace(/\s+/g, '-')}.pdf`)
      if (toast) toast('Lead magnet exported as PDF!', 'success')
    } finally {
      root.setAttribute('data-theme', originalTheme || 'dark')
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedType(null)
    setTopic('')
    setAudience('')
    setBrand('')
    setNiche('')
    setGeneratedContent(null)
    setEditedContent(null)
  }

  return (
    <ToolLayout title="Lead Magnet Factory" description="Create professional lead magnets with matching landing pages in minutes. Choose a type, generate content, and export everything.">

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <button onClick={() => s < step && goToStep(s)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={s === step
                ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                : s < step
                  ? { background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
              }>{s}</button>
            {s < 3 && <div className="w-12 h-0.5" style={{ background: s < step ? 'var(--accent-soft)' : 'var(--bg-elevated)' }} />}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center mb-8">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {step === 1 && 'Step 1: Choose Your Lead Magnet Type'}
          {step === 2 && 'Step 2: Generate & Edit Content'}
          {step === 3 && 'Step 3: Create Landing Page'}
        </p>
      </div>

      {/* STEP 1: Choose Type */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEAD_MAGNET_TYPES.map(type => (
              <button key={type.id} onClick={() => setSelectedType(type.id)}
                className="p-6 rounded-xl text-left transition-all"
                style={selectedType === type.id
                  ? { background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)' }
                  : { background: 'var(--bg-elevated)', border: '1px solid var(--border)' }
                }>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: selectedType === type.id ? 'var(--accent-soft)' : 'var(--bg-elevated)' }}>
                  <svg className="w-6 h-6" style={{ color: selectedType === type.id ? 'var(--accent)' : 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1" style={{ color: selectedType === type.id ? 'var(--accent)' : 'var(--text-heading)' }}>{type.name}</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{type.description}</p>
              </button>
            ))}
          </div>

          {/* Details Form */}
          {selectedType && (
            <ResultCard title="Content Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Topic *</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Social Media Marketing"
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Target Audience *</label>
                  <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g., Small Business Owners"
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Your Name/Brand</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g., SkynetLabs"
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Your Niche</label>
                  <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g., Digital Marketing"
                    className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                </div>
              </div>
              <button onClick={handleGenerate} disabled={!topic || !audience}
                className="px-6 py-2.5 disabled:opacity-40 font-medium rounded-xl transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                Generate Content
              </button>
            </ResultCard>
          )}
        </div>
      )}

      {/* STEP 2: Edit Content */}
      {step === 2 && editedContent && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button onClick={() => goToStep(1)} className="text-sm flex items-center gap-1 transition-colors" style={{ color: "var(--text-muted)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <div className="flex gap-3">
              <button onClick={downloadContentPdf} className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2" style={{ background: "var(--bg-elevated)", color: "var(--text-body)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export as PDF
              </button>
              <button onClick={() => goToStep(3)} className="px-6 py-2 font-medium rounded-lg text-sm transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                Create Landing Page
              </button>
            </div>
          </div>

          {/* Editable Content */}
          <div id="lead-magnet-content">
            <ResultCard>
              <div className="space-y-2 mb-6">
                <input value={editedContent.title}
                  onChange={e => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-transparent text-2xl font-bold focus:outline-none border-b border-transparent pb-1" style={{ color: "var(--text-heading)" }} />
                <input value={editedContent.subtitle}
                  onChange={e => setEditedContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-transparent focus:outline-none border-b border-transparent pb-1" style={{ color: "var(--text-muted)" }} />
                {brand && <p className="text-sm" style={{ color: "var(--accent)" }}>by {brand}</p>}
              </div>
            </ResultCard>

            {editedContent.sections.map((section, sIdx) => (
              <ResultCard key={sIdx} className="mt-4">
                <input value={section.heading}
                  onChange={e => {
                    setEditedContent(prev => {
                      const updated = JSON.parse(JSON.stringify(prev))
                      updated.sections[sIdx].heading = e.target.value
                      return updated
                    })
                  }}
                  className="w-full bg-transparent font-semibold text-lg focus:outline-none border-b border-transparent pb-1 mb-4" style={{ color: "var(--text-heading)" }} />
                <div className="space-y-2">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-2">
                      <span className="mt-1 flex-shrink-0" style={{ color: "var(--accent)" }}>
                        {selectedType === 'checklist' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <span className="text-sm">{'\u2022'}</span>
                        )}
                      </span>
                      <input value={item} onChange={e => updateSectionItem(sIdx, iIdx, e.target.value)}
                        className="w-full bg-transparent text-sm focus:outline-none border-b border-transparent pb-0.5" style={{ color: "var(--text-body)" }} />
                    </div>
                  ))}
                </div>
              </ResultCard>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Landing Page */}
      {step === 3 && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button onClick={() => goToStep(2)} className="text-sm flex items-center gap-1 transition-colors" style={{ color: "var(--text-muted)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Content
            </button>
            <div className="flex gap-3">
              <button onClick={downloadLandingPage} className="px-6 py-2 font-medium rounded-lg text-sm transition-colors flex items-center gap-2" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Landing Page HTML
              </button>
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>Start Over</button>
              <ShareButton getShareURL={() => window.location.href} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customization Panel */}
            <div className="space-y-4">
              <ResultCard title="Customize Landing Page">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Headline</label>
                    <input value={lpConfig.headline} onChange={e => setLpConfig(p => ({ ...p, headline: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                  </div>

                  {lpConfig.bullets.map((b, i) => (
                    <div key={i}>
                      <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Bullet {i + 1}</label>
                      <input value={b} onChange={e => updateBullet(i, e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>CTA Button Text</label>
                    <input value={lpConfig.ctaText} onChange={e => setLpConfig(p => ({ ...p, ctaText: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={lpConfig.bgColor} onChange={e => setLpConfig(p => ({ ...p, bgColor: e.target.value }))}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{lpConfig.bgColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1" style={{ color: "var(--text-muted)" }}>Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={lpConfig.accentColor} onChange={e => setLpConfig(p => ({ ...p, accentColor: e.target.value }))}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{lpConfig.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ResultCard>

              {/* Preview Toggle */}
              <ResultCard>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Preview Mode</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewMode('desktop')}
                      className="p-2 rounded-lg transition-colors" style={previewMode === 'desktop' ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button onClick={() => setPreviewMode('mobile')}
                      className="p-2 rounded-lg transition-colors" style={previewMode === 'mobile' ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </ResultCard>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <ResultCard title="Landing Page Preview">
                <div className={`mx-auto rounded-xl overflow-hidden transition-all ${
                  previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
                }`}>
                  <div style={{ background: lpConfig.bgColor }} className="p-8 sm:p-12 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                      style={{ background: `${lpConfig.accentColor}15`, color: lpConfig.accentColor, borderColor: `${lpConfig.accentColor}30` }}>
                      FREE RESOURCE
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold mb-3 leading-tight" style={{ color: "var(--text-heading)" }}>{lpConfig.headline}</h2>
                    <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
                      Join thousands of {audience.toLowerCase()} who have used this resource to get real results.
                    </p>
                    <div className="text-left max-w-sm mx-auto mb-8 space-y-3">
                      {lpConfig.bullets.filter(Boolean).map((b, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                            style={{ background: `${lpConfig.accentColor}20`, color: lpConfig.accentColor }}>
                            &#10003;
                          </div>
                          <p className="text-sm" style={{ color: "var(--text-body)" }}>{b}</p>
                        </div>
                      ))}
                    </div>
                    <div className="max-w-xs mx-auto rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="rounded-lg px-4 py-3 mb-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Your full name</span>
                      </div>
                      <div className="rounded-lg px-4 py-3 mb-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Your best email address</span>
                      </div>
                      <button className="w-full py-3 rounded-lg font-bold text-sm"
                        style={{ background: lpConfig.accentColor, color: "var(--text-on-accent)" }}>
                        {lpConfig.ctaText}
                      </button>
                    </div>
                    <div className="flex justify-center gap-6 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>No spam, ever</span>
                      <span>Instant download</span>
                      <span>100% free</span>
                    </div>
                  </div>
                </div>
              </ResultCard>

              {/* Copy HTML */}
              <div className="mt-4">
                <CopyButton text={generateLandingPageHtml({ ...lpConfig, brandName: brand || 'SkynetLabs', topic, audience })} label="Copy Landing Page HTML" />
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
