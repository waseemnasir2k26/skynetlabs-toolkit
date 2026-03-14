import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'
import ScoreGauge from '../shared/ScoreGauge'
import StepWizard from '../shared/StepWizard'
import FormInput from '../shared/FormInput'
import FormSelect from '../shared/FormSelect'
import FormTextarea from '../shared/FormTextarea'
import { generateId } from '../shared/utils'

/* ───────────────────────── Constants ───────────────────────── */

const CATEGORIES = [
  'Web Development',
  'Graphic Design',
  'Digital Marketing',
  'Writing',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'AI Services',
  'SEO',
  'Social Media',
  'Mobile Apps',
]

const TITLE_TEMPLATES = [
  'I will {action} {deliverable} for {audience}',
  'I will create {deliverable} that {benefit}',
  'I will design {deliverable} for your {audience}',
  'I will develop {deliverable} with {feature}',
  'I will build {deliverable} to {benefit}',
]

const CATEGORY_ACTIONS = {
  'Web Development': { actions: ['build', 'develop', 'create', 'design', 'code'], deliverables: ['a responsive website', 'a landing page', 'a WordPress site', 'a web application', 'a custom website'], audiences: ['your business', 'your startup', 'your brand', 'your ecommerce store', 'your portfolio'], benefits: ['converts visitors', 'boosts engagement', 'drives sales', 'looks stunning', 'loads fast'], features: ['SEO optimization', 'modern design', 'mobile responsiveness', 'fast loading speed', 'custom functionality'] },
  'Graphic Design': { actions: ['design', 'create', 'craft', 'make', 'produce'], deliverables: ['a logo', 'brand identity', 'social media graphics', 'a flyer', 'business cards'], audiences: ['your brand', 'your business', 'your startup', 'your company', 'your project'], benefits: ['stands out', 'attracts customers', 'builds trust', 'looks professional', 'tells your story'], features: ['unlimited revisions', 'source files', 'print-ready quality', 'unique concepts', 'brand guidelines'] },
  'Digital Marketing': { actions: ['create', 'manage', 'run', 'set up', 'optimize'], deliverables: ['a marketing strategy', 'ad campaigns', 'email marketing', 'a sales funnel', 'PPC campaigns'], audiences: ['your business', 'your brand', 'your ecommerce store', 'your startup', 'your company'], benefits: ['drives traffic', 'generates leads', 'increases sales', 'grows your audience', 'boosts ROI'], features: ['data-driven approach', 'proven strategies', 'detailed reporting', 'A/B testing', 'conversion tracking'] },
  'Writing': { actions: ['write', 'create', 'craft', 'produce', 'compose'], deliverables: ['SEO blog posts', 'website copy', 'product descriptions', 'articles', 'compelling content'], audiences: ['your website', 'your blog', 'your brand', 'your business', 'your audience'], benefits: ['engages readers', 'ranks on Google', 'drives traffic', 'converts visitors', 'tells your story'], features: ['SEO optimization', 'original content', 'fast delivery', 'research-backed', 'plagiarism-free'] },
  'Video & Animation': { actions: ['create', 'produce', 'edit', 'animate', 'make'], deliverables: ['a promotional video', 'an explainer animation', 'video editing', 'motion graphics', 'a whiteboard animation'], audiences: ['your brand', 'your product', 'your YouTube channel', 'your business', 'your social media'], benefits: ['captivates viewers', 'boosts engagement', 'tells your story', 'goes viral', 'increases conversions'], features: ['HD quality', 'custom animations', 'royalty-free music', 'fast turnaround', 'unlimited revisions'] },
  'Music & Audio': { actions: ['produce', 'create', 'compose', 'mix', 'master'], deliverables: ['original music', 'a voiceover', 'audio editing', 'a jingle', 'sound design'], audiences: ['your project', 'your podcast', 'your video', 'your brand', 'your game'], benefits: ['sounds professional', 'captivates listeners', 'sets the mood', 'enhances your content', 'stands out'], features: ['studio quality', 'commercial rights', 'fast delivery', 'multiple revisions', 'custom composition'] },
  'Programming & Tech': { actions: ['develop', 'build', 'create', 'fix', 'automate'], deliverables: ['a custom script', 'an API integration', 'a software tool', 'database solutions', 'automation workflows'], audiences: ['your business', 'your project', 'your workflow', 'your application', 'your team'], benefits: ['saves time', 'increases efficiency', 'solves problems', 'scales easily', 'works flawlessly'], features: ['clean code', 'documentation', 'testing included', 'ongoing support', 'scalable architecture'] },
  'Business': { actions: ['create', 'develop', 'write', 'prepare', 'build'], deliverables: ['a business plan', 'financial projections', 'a pitch deck', 'market research', 'a business strategy'], audiences: ['your startup', 'your business', 'your investors', 'your company', 'your venture'], benefits: ['attracts investors', 'guides growth', 'reduces risk', 'drives success', 'maximizes profit'], features: ['data-driven insights', 'professional formatting', 'industry research', 'actionable recommendations', 'financial modeling'] },
  'AI Services': { actions: ['build', 'create', 'develop', 'integrate', 'train'], deliverables: ['an AI chatbot', 'AI automation', 'machine learning models', 'GPT integration', 'AI-powered tools'], audiences: ['your business', 'your workflow', 'your application', 'your website', 'your project'], benefits: ['automates tasks', 'saves hours daily', 'increases efficiency', 'provides smart insights', 'scales operations'], features: ['custom training', 'API integration', 'ongoing support', 'documentation', 'scalable solutions'] },
  'SEO': { actions: ['optimize', 'boost', 'improve', 'fix', 'audit'], deliverables: ['your website SEO', 'on-page SEO', 'technical SEO', 'keyword research', 'an SEO strategy'], audiences: ['your website', 'your business', 'your blog', 'your ecommerce store', 'your brand'], benefits: ['ranks higher', 'drives organic traffic', 'increases visibility', 'beats competitors', 'generates leads'], features: ['detailed audit report', 'keyword analysis', 'competitor research', 'monthly reporting', 'white-hat techniques'] },
  'Social Media': { actions: ['manage', 'grow', 'create', 'design', 'plan'], deliverables: ['social media management', 'content strategy', 'social media posts', 'an Instagram growth plan', 'social media ads'], audiences: ['your brand', 'your business', 'your Instagram', 'your social presence', 'your company'], benefits: ['grows followers', 'increases engagement', 'builds community', 'drives traffic', 'boosts brand awareness'], features: ['content calendar', 'analytics reporting', 'hashtag strategy', 'engagement management', 'custom graphics'] },
  'Mobile Apps': { actions: ['develop', 'build', 'create', 'design', 'launch'], deliverables: ['a mobile app', 'an iOS app', 'an Android app', 'a cross-platform app', 'a React Native app'], audiences: ['your business', 'your startup', 'your idea', 'your company', 'your users'], benefits: ['engages users', 'drives revenue', 'solves problems', 'stands out', 'scales easily'], features: ['clean UI/UX', 'push notifications', 'API integration', 'app store deployment', 'ongoing support'] },
}

const CATEGORY_TAGS = {
  'Web Development': ['website design', 'web development', 'responsive design', 'wordpress', 'landing page'],
  'Graphic Design': ['logo design', 'branding', 'graphic design', 'illustration', 'visual identity'],
  'Digital Marketing': ['digital marketing', 'facebook ads', 'google ads', 'lead generation', 'marketing strategy'],
  'Writing': ['content writing', 'blog writing', 'seo writing', 'copywriting', 'article writing'],
  'Video & Animation': ['video editing', 'animation', 'explainer video', 'motion graphics', 'promotional video'],
  'Music & Audio': ['music production', 'voiceover', 'audio editing', 'mixing', 'sound design'],
  'Programming & Tech': ['python', 'javascript', 'api integration', 'automation', 'software development'],
  'Business': ['business plan', 'pitch deck', 'financial analysis', 'market research', 'business strategy'],
  'AI Services': ['ai chatbot', 'chatgpt', 'machine learning', 'ai automation', 'artificial intelligence'],
  'SEO': ['seo', 'keyword research', 'on page seo', 'technical seo', 'link building'],
  'Social Media': ['social media management', 'instagram growth', 'content creation', 'social media marketing', 'community management'],
  'Mobile Apps': ['mobile app', 'ios app', 'android app', 'react native', 'flutter app'],
}

const CATEGORY_FAQS = {
  default: [
    { question: 'What information do you need from me to get started?', answer: '' },
    { question: 'How many revisions are included?', answer: '' },
    { question: 'What is your turnaround time?', answer: '' },
    { question: 'Do you offer ongoing support after delivery?', answer: '' },
    { question: 'Can you work with my existing brand guidelines?', answer: '' },
  ],
}

const PRICING_PRESETS = {
  'Web Development': { basic: { name: 'Basic', price: 50, delivery: 7, revisions: 2, description: '1-page landing page', features: ['Responsive design', 'Contact form', 'SEO basics'] }, standard: { name: 'Standard', price: 150, delivery: 14, revisions: 3, description: '3-page website with CMS', features: ['Responsive design', 'Contact form', 'SEO basics', 'CMS integration', 'Social media links'] }, premium: { name: 'Premium', price: 350, delivery: 21, revisions: 5, description: 'Full custom website (5+ pages)', features: ['Responsive design', 'Contact form', 'SEO basics', 'CMS integration', 'Social media links', 'E-commerce ready', 'Speed optimization'] } },
  default: { basic: { name: 'Basic', price: 25, delivery: 3, revisions: 1, description: 'Basic package', features: ['Feature 1', 'Feature 2'] }, standard: { name: 'Standard', price: 75, delivery: 5, revisions: 3, description: 'Standard package', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'] }, premium: { name: 'Premium', price: 150, delivery: 7, revisions: 5, description: 'Premium package', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5', 'Feature 6'] } },
}

const STEP_LABELS = ['Category', 'Title', 'Description', 'Pricing', 'FAQs', 'Preview']

function createEmptyGig() {
  return {
    id: generateId(),
    category: '',
    subNiche: '',
    title: '',
    keywords: '',
    description: { hook: '', whatYouGet: [''], whyChooseMe: ['', '', ''], process: [''] },
    pricing: {
      basic: { name: 'Basic', price: 5, delivery: 3, revisions: 1, description: '', features: [] },
      standard: { name: 'Standard', price: 25, delivery: 5, revisions: 3, description: '', features: [] },
      premium: { name: 'Premium', price: 50, delivery: 7, revisions: 5, description: '', features: [] },
    },
    faqs: [],
    tags: [],
    requirements: ['', ''],
    createdAt: new Date().toISOString(),
  }
}

/* ───────────────────────── Score Calculation ───────────────────────── */

function calculateScore(gig) {
  let total = 0
  const breakdown = {}

  // Title: 20%
  const tLen = (gig.title || '').length
  let titleScore = 0
  if (gig.title && gig.title.toLowerCase().startsWith('i will')) titleScore += 40
  if (tLen >= 60 && tLen <= 80) titleScore += 60
  else if (tLen >= 40 && tLen < 60) titleScore += 40
  else if (tLen > 0 && tLen < 40) titleScore += 20
  else if (tLen > 80) titleScore += 30
  breakdown.title = Math.min(titleScore, 100)
  total += breakdown.title * 0.2

  // Description: 25%
  const desc = gig.description || {}
  let descScore = 0
  if (desc.hook && desc.hook.length > 20) descScore += 25
  if (desc.whatYouGet && desc.whatYouGet.filter(i => i.trim()).length >= 2) descScore += 25
  if (desc.whyChooseMe && desc.whyChooseMe.filter(i => i.trim()).length >= 2) descScore += 25
  if (desc.process && desc.process.filter(i => i.trim()).length >= 2) descScore += 15
  const fullDesc = buildDescriptionText(gig)
  if (fullDesc.length >= 600) descScore += 10
  breakdown.description = Math.min(descScore, 100)
  total += breakdown.description * 0.25

  // Pricing: 20%
  const p = gig.pricing || {}
  let priceScore = 0
  if (p.basic?.description?.trim()) priceScore += 20
  if (p.standard?.description?.trim()) priceScore += 20
  if (p.premium?.description?.trim()) priceScore += 20
  if (p.basic?.price > 0 && p.standard?.price > p.basic?.price && p.premium?.price > p.standard?.price) priceScore += 25
  if (p.basic?.features?.length >= 1 && p.standard?.features?.length >= 1 && p.premium?.features?.length >= 1) priceScore += 15
  breakdown.pricing = Math.min(priceScore, 100)
  total += breakdown.pricing * 0.2

  // FAQs: 15%
  const filledFaqs = (gig.faqs || []).filter(f => f.question.trim() && f.answer.trim())
  let faqScore = 0
  if (filledFaqs.length >= 5) faqScore = 100
  else if (filledFaqs.length >= 3) faqScore = 70
  else if (filledFaqs.length >= 1) faqScore = 40
  breakdown.faqs = faqScore
  total += faqScore * 0.15

  // Tags: 10%
  const tagCount = (gig.tags || []).filter(t => t.trim()).length
  let tagScore = tagCount >= 5 ? 100 : tagCount >= 3 ? 60 : tagCount >= 1 ? 30 : 0
  breakdown.tags = tagScore
  total += tagScore * 0.1

  // Requirements: 10%
  const reqCount = (gig.requirements || []).filter(r => r.trim()).length
  let reqScore = reqCount >= 3 ? 100 : reqCount >= 2 ? 70 : reqCount >= 1 ? 40 : 0
  breakdown.requirements = reqScore
  total += reqScore * 0.1

  return { total: Math.round(total), breakdown }
}

function buildDescriptionText(gig) {
  const desc = gig.description || {}
  let text = ''
  if (desc.hook) text += desc.hook + '\n\n'
  const items = (desc.whatYouGet || []).filter(i => i.trim())
  if (items.length) {
    text += 'What You Get:\n'
    items.forEach(item => { text += `- ${item}\n` })
    text += '\n'
  }
  const reasons = (desc.whyChooseMe || []).filter(r => r.trim())
  if (reasons.length) {
    text += 'Why Choose Me:\n'
    reasons.forEach(r => { text += `- ${r}\n` })
    text += '\n'
  }
  const steps = (desc.process || []).filter(s => s.trim())
  if (steps.length) {
    text += 'My Process:\n'
    steps.forEach((s, i) => { text += `${i + 1}. ${s}\n` })
  }
  return text.trim()
}

function buildFullGigText(gig) {
  let text = `FIVERR GIG\n${'='.repeat(50)}\n\n`
  text += `Category: ${gig.category}${gig.subNiche ? ` > ${gig.subNiche}` : ''}\n\n`
  text += `Title: ${gig.title}\n\n`
  text += `${'─'.repeat(50)}\nDESCRIPTION\n${'─'.repeat(50)}\n\n`
  text += buildDescriptionText(gig) + '\n\n'
  text += `${'─'.repeat(50)}\nPRICING\n${'─'.repeat(50)}\n\n`
  ;['basic', 'standard', 'premium'].forEach(tier => {
    const t = gig.pricing[tier]
    text += `${t.name} — $${t.price} | ${t.delivery} day(s) | ${t.revisions} revision(s)\n`
    text += `  ${t.description}\n`
    if (t.features?.length) t.features.forEach(f => { text += `  - ${f}\n` })
    text += '\n'
  })
  text += `${'─'.repeat(50)}\nFAQs\n${'─'.repeat(50)}\n\n`
  gig.faqs.filter(f => f.question.trim()).forEach(f => {
    text += `Q: ${f.question}\nA: ${f.answer || '(no answer)'}\n\n`
  })
  text += `Tags: ${gig.tags.join(', ')}\n`
  text += `Requirements: ${gig.requirements.filter(r => r.trim()).join('; ')}\n`
  return text
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [gig, setGig] = useLocalStorage('skynet-fiverr-gig-current', createEmptyGig())
  const [savedGigs, setSavedGigs] = useLocalStorage('skynet-fiverr-gig-history', [])
  const [showHistory, setShowHistory] = useState(false)

  const score = useMemo(() => calculateScore(gig), [gig])
  const descText = useMemo(() => buildDescriptionText(gig), [gig])
  const fullText = useMemo(() => buildFullGigText(gig), [gig])

  /* ── Helpers ── */

  const update = (path, value) => {
    setGig(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSave = () => {
    setSavedGigs(prev => {
      const exists = prev.findIndex(g => g.id === gig.id)
      const updated = JSON.parse(JSON.stringify(prev))
      const snapshot = { ...JSON.parse(JSON.stringify(gig)), savedAt: new Date().toISOString() }
      if (exists >= 0) updated[exists] = snapshot
      else updated.unshift(snapshot)
      return updated.slice(0, 20)
    })
  }

  const handleLoad = (g) => {
    setGig(g)
    setShowHistory(false)
    setCurrentStep(0)
  }

  const handleDelete = (id) => {
    setSavedGigs(prev => prev.filter(g => g.id !== id))
  }

  const handleNew = () => {
    setGig(createEmptyGig())
    setCurrentStep(0)
  }

  const generateTitles = () => {
    const catData = CATEGORY_ACTIONS[gig.category] || CATEGORY_ACTIONS['Web Development']
    const kw = (gig.keywords || '').trim()
    const titles = []

    for (let i = 0; i < 5; i++) {
      const action = catData.actions[i % catData.actions.length]
      const deliverable = kw || catData.deliverables[i % catData.deliverables.length]
      const audience = catData.audiences[i % catData.audiences.length]
      const benefit = catData.benefits[i % catData.benefits.length]
      const feature = catData.features[i % catData.features.length]

      let title = TITLE_TEMPLATES[i]
        .replace('{action}', action)
        .replace('{deliverable}', deliverable)
        .replace('{audience}', audience)
        .replace('{benefit}', benefit)
        .replace('{feature}', feature)

      if (title.length > 80) title = title.slice(0, 77) + '...'
      titles.push(title)
    }
    return titles
  }

  const loadPricingPreset = () => {
    const preset = PRICING_PRESETS[gig.category] || PRICING_PRESETS.default
    update('pricing', JSON.parse(JSON.stringify(preset)))
  }

  const loadCategoryFaqs = () => {
    const faqs = JSON.parse(JSON.stringify(CATEGORY_FAQS.default))
    update('faqs', faqs)
  }

  const suggestedTags = useMemo(() => CATEGORY_TAGS[gig.category] || [], [gig.category])

  /* ── Step Renderers ── */

  const renderStep0 = () => (
    <div className="space-y-6">
      <FormSelect
        label="Service Category"
        value={gig.category}
        onChange={e => update('category', e.target.value)}
        options={CATEGORIES}
        placeholder="Choose a category..."
        required
        helpText="Select the main Fiverr category for your gig"
      />
      <FormInput
        label="Sub-Niche"
        value={gig.subNiche}
        onChange={e => update('subNiche', e.target.value)}
        placeholder="e.g., React websites, Logo animation, Tech blog writing..."
        helpText="Narrow down your specific area of expertise"
      />

      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          Tags (max 5)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {gig.tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {tag}
              <button
                onClick={() => update('tags', gig.tags.filter((_, j) => j !== i))}
                className="ml-1 hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                x
              </button>
            </span>
          ))}
        </div>
        {gig.tags.length < 5 && suggestedTags.length > 0 && (
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Suggested tags (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags
                .filter(t => !gig.tags.includes(t))
                .map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (gig.tags.length < 5) update('tags', [...gig.tags, tag])
                    }}
                    className="px-3 py-1 rounded-full text-xs transition-all hover:scale-105"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>
        )}
        {gig.tags.length < 5 && (
          <div className="flex gap-2 mt-3">
            <FormInput
              value=""
              placeholder="Add custom tag..."
              className="flex-1"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.target.value.trim() && gig.tags.length < 5) {
                  update('tags', [...gig.tags, e.target.value.trim()])
                  e.target.value = ''
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Buyer Requirements */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          Buyer Requirements
        </label>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          What information should buyers provide when ordering?
        </p>
        {gig.requirements.map((req, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <FormInput
              value={req}
              onChange={e => {
                const reqs = [...gig.requirements]
                reqs[i] = e.target.value
                update('requirements', reqs)
              }}
              placeholder={`Requirement ${i + 1}...`}
              className="flex-1"
            />
            {gig.requirements.length > 1 && (
              <button
                onClick={() => update('requirements', gig.requirements.filter((_, j) => j !== i))}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-elevated)', color: 'var(--danger)', border: '1px solid var(--border)' }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {gig.requirements.length < 5 && (
          <button
            onClick={() => update('requirements', [...gig.requirements, ''])}
            className="text-sm font-medium mt-1"
            style={{ color: 'var(--accent)' }}
          >
            + Add Requirement
          </button>
        )}
      </div>
    </div>
  )

  const renderStep1 = () => {
    const titles = gig.category ? generateTitles() : []
    return (
      <div className="space-y-6">
        <FormInput
          label="Keywords"
          value={gig.keywords}
          onChange={e => update('keywords', e.target.value)}
          placeholder="e.g., modern React website, professional logo..."
          helpText="Enter keywords describing your service to generate title suggestions"
        />

        {titles.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-heading)' }}>
              Title Suggestions (click to use)
            </label>
            <div className="space-y-2">
              {titles.map((t, i) => (
                <button
                  key={i}
                  onClick={() => update('title', t)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all hover:scale-[1.01]"
                  style={{
                    background: gig.title === t ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    border: gig.title === t ? '2px solid var(--accent)' : '1px solid var(--border)',
                    color: 'var(--text-body)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--text-heading)' }}>{i + 1}.</span> {t}
                  <span className="ml-2 text-xs" style={{ color: t.length > 80 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    ({t.length}/80)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <FormInput
            label="Your Gig Title"
            value={gig.title}
            onChange={e => {
              if (e.target.value.length <= 80) update('title', e.target.value)
            }}
            placeholder="I will create a professional..."
            required
            helpText={`${(gig.title || '').length}/80 characters${(gig.title || '').length >= 60 && (gig.title || '').length <= 80 ? ' — Optimal length!' : ''}`}
          />
          {gig.title && !gig.title.toLowerCase().startsWith('i will') && (
            <p className="text-xs mt-1" style={{ color: 'var(--warning)' }}>
              Tip: Starting with "I will" is the Fiverr standard and helps with search ranking.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Hook */}
      <FormTextarea
        label="Hook (Opening Statement)"
        value={gig.description.hook}
        onChange={e => update('description.hook', e.target.value)}
        placeholder="Are you looking for a professional who can... / Struggling with... / Let me help you..."
        rows={3}
        helpText="2 compelling sentences that grab the buyer's attention"
      />

      {/* What You Get */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          What You Get (deliverables)
        </label>
        {gig.description.whatYouGet.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <FormInput
              value={item}
              onChange={e => {
                const items = [...gig.description.whatYouGet]
                items[i] = e.target.value
                update('description.whatYouGet', items)
              }}
              placeholder={`Deliverable ${i + 1}...`}
              className="flex-1"
            />
            {gig.description.whatYouGet.length > 1 && (
              <button
                onClick={() => update('description.whatYouGet', gig.description.whatYouGet.filter((_, j) => j !== i))}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-elevated)', color: 'var(--danger)', border: '1px solid var(--border)' }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {gig.description.whatYouGet.length < 8 && (
          <button
            onClick={() => update('description.whatYouGet', [...gig.description.whatYouGet, ''])}
            className="text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Why Choose Me */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          Why Choose Me (3 reasons)
        </label>
        {gig.description.whyChooseMe.map((reason, i) => (
          <FormInput
            key={i}
            value={reason}
            onChange={e => {
              const reasons = [...gig.description.whyChooseMe]
              reasons[i] = e.target.value
              update('description.whyChooseMe', reasons)
            }}
            placeholder={`Reason ${i + 1}...`}
            className="mb-2"
          />
        ))}
      </div>

      {/* Process */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          My Process (numbered steps)
        </label>
        {gig.description.process.map((step, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <span className="text-sm font-bold flex-shrink-0 w-6 text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
            <FormInput
              value={step}
              onChange={e => {
                const steps = [...gig.description.process]
                steps[i] = e.target.value
                update('description.process', steps)
              }}
              placeholder={`Step ${i + 1}...`}
              className="flex-1"
            />
            {gig.description.process.length > 1 && (
              <button
                onClick={() => update('description.process', gig.description.process.filter((_, j) => j !== i))}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-elevated)', color: 'var(--danger)', border: '1px solid var(--border)' }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {gig.description.process.length < 6 && (
          <button
            onClick={() => update('description.process', [...gig.description.process, ''])}
            className="text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            + Add Step
          </button>
        )}
      </div>

      {/* Preview */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>Description Preview</h4>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              background: descText.length > 1200 ? 'var(--danger)' : descText.length >= 600 ? 'var(--success)' : 'var(--warning)',
              color: '#fff',
            }}
          >
            {descText.length}/1200
          </span>
        </div>
        <pre
          className="text-sm whitespace-pre-wrap"
          style={{ color: 'var(--text-body)', fontFamily: 'inherit' }}
        >
          {descText || 'Your description will appear here as you fill in the sections above...'}
        </pre>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const tiers = ['basic', 'standard', 'premium']
    const tierLabels = { basic: 'Basic', standard: 'Standard', premium: 'Premium' }
    const tierColors = { basic: 'var(--info)', standard: 'var(--accent)', premium: 'var(--warning)' }

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={loadPricingPreset}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            Load Preset for {gig.category || 'Category'}
          </button>
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="text-left text-sm font-medium p-3" style={{ color: 'var(--text-muted)' }}>Feature</th>
                {tiers.map(tier => (
                  <th key={tier} className="text-center p-3" style={{ color: tierColors[tier] }}>
                    <span className="text-sm font-bold">{tierLabels[tier]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-sm" style={{ color: 'var(--text-body)', borderTop: '1px solid var(--border)' }}>Price ($)</td>
                {tiers.map(tier => (
                  <td key={tier} className="p-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                    <input
                      type="number"
                      min="5"
                      max="995"
                      value={gig.pricing[tier].price}
                      onChange={e => update(`pricing.${tier}.price`, Math.min(995, Math.max(5, parseInt(e.target.value) || 5)))}
                      className="w-24 mx-auto text-center rounded-lg px-2 py-1.5 text-sm"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-sm" style={{ color: 'var(--text-body)', borderTop: '1px solid var(--border)' }}>Delivery (days)</td>
                {tiers.map(tier => (
                  <td key={tier} className="p-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={gig.pricing[tier].delivery}
                      onChange={e => update(`pricing.${tier}.delivery`, Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-24 mx-auto text-center rounded-lg px-2 py-1.5 text-sm"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-sm" style={{ color: 'var(--text-body)', borderTop: '1px solid var(--border)' }}>Revisions</td>
                {tiers.map(tier => (
                  <td key={tier} className="p-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={gig.pricing[tier].revisions}
                      onChange={e => update(`pricing.${tier}.revisions`, Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-24 mx-auto text-center rounded-lg px-2 py-1.5 text-sm"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-sm" style={{ color: 'var(--text-body)', borderTop: '1px solid var(--border)' }}>Description</td>
                {tiers.map(tier => (
                  <td key={tier} className="p-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      value={gig.pricing[tier].description}
                      onChange={e => update(`pricing.${tier}.description`, e.target.value)}
                      placeholder="Package details..."
                      className="w-full text-center rounded-lg px-2 py-1.5 text-sm"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-4">
          {tiers.map(tier => (
            <div
              key={tier}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <h4 className="font-bold text-sm mb-3" style={{ color: tierColors[tier] }}>
                {tierLabels[tier]}
              </h4>
              <div className="space-y-3">
                <FormInput
                  label="Price ($)"
                  type="number"
                  value={gig.pricing[tier].price}
                  onChange={e => update(`pricing.${tier}.price`, Math.min(995, Math.max(5, parseInt(e.target.value) || 5)))}
                  prefix="$"
                />
                <FormInput
                  label="Delivery (days)"
                  type="number"
                  value={gig.pricing[tier].delivery}
                  onChange={e => update(`pricing.${tier}.delivery`, Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
                />
                <FormInput
                  label="Revisions"
                  type="number"
                  value={gig.pricing[tier].revisions}
                  onChange={e => update(`pricing.${tier}.revisions`, Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                />
                <FormInput
                  label="Description"
                  value={gig.pricing[tier].description}
                  onChange={e => update(`pricing.${tier}.description`, e.target.value)}
                  placeholder="Package details..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Features per tier */}
        <div>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>Package Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map(tier => (
              <div
                key={tier}
                className="rounded-xl p-4"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <h5 className="text-sm font-bold mb-3" style={{ color: tierColors[tier] }}>{tierLabels[tier]} Features</h5>
                {(gig.pricing[tier].features || []).map((feat, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={e => {
                        const features = [...(gig.pricing[tier].features || [])]
                        features[i] = e.target.value
                        update(`pricing.${tier}.features`, features)
                      }}
                      placeholder={`Feature ${i + 1}`}
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                    <button
                      onClick={() => {
                        const features = (gig.pricing[tier].features || []).filter((_, j) => j !== i)
                        update(`pricing.${tier}.features`, features)
                      }}
                      className="text-xs px-2"
                      style={{ color: 'var(--danger)' }}
                    >
                      x
                    </button>
                  </div>
                ))}
                {(gig.pricing[tier].features || []).length < 10 && (
                  <button
                    onClick={() => update(`pricing.${tier}.features`, [...(gig.pricing[tier].features || []), ''])}
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    + Add Feature
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderStep4 = () => (
    <div className="space-y-6">
      {gig.faqs.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No FAQs yet. Load common questions or add your own.</p>
          <button
            onClick={loadCategoryFaqs}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Load Common FAQs
          </button>
        </div>
      )}

      {gig.faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              FAQ {i + 1}
            </span>
            <button
              onClick={() => update('faqs', gig.faqs.filter((_, j) => j !== i))}
              className="text-xs px-2 py-1 rounded"
              style={{ color: 'var(--danger)' }}
            >
              Remove
            </button>
          </div>
          <FormInput
            label="Question"
            value={faq.question}
            onChange={e => {
              const faqs = JSON.parse(JSON.stringify(gig.faqs))
              faqs[i].question = e.target.value
              update('faqs', faqs)
            }}
            placeholder="Enter question..."
            className="mb-3"
          />
          <FormTextarea
            label="Answer"
            value={faq.answer}
            onChange={e => {
              const faqs = JSON.parse(JSON.stringify(gig.faqs))
              faqs[i].answer = e.target.value
              update('faqs', faqs)
            }}
            placeholder="Enter answer..."
            rows={3}
          />
        </div>
      ))}

      {gig.faqs.length < 10 && gig.faqs.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={() => update('faqs', [...gig.faqs, { question: '', answer: '' }])}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            + Add Custom FAQ
          </button>
          {gig.faqs.length < 5 && (
            <button
              onClick={loadCategoryFaqs}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
            >
              Reset to Common FAQs
            </button>
          )}
        </div>
      )}
    </div>
  )

  const renderStep5 = () => {
    const scoreLabel = score.total >= 80 ? 'Excellent' : score.total >= 60 ? 'Good' : score.total >= 40 ? 'Needs Work' : 'Poor'

    return (
      <div className="space-y-6" id="fiverr-gig-export">
        {/* Score */}
        <div className="flex flex-col items-center py-4">
          <ScoreGauge score={score.total} label={scoreLabel} />
          <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Gig Optimization Score</p>
        </div>

        {/* Score Breakdown */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>Score Breakdown</h4>
          <div className="space-y-2">
            {[
              { label: 'Title', value: score.breakdown.title, weight: '20%' },
              { label: 'Description', value: score.breakdown.description, weight: '25%' },
              { label: 'Pricing', value: score.breakdown.pricing, weight: '20%' },
              { label: 'FAQs', value: score.breakdown.faqs, weight: '15%' },
              { label: 'Tags', value: score.breakdown.tags, weight: '10%' },
              { label: 'Requirements', value: score.breakdown.requirements, weight: '10%' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs w-24 flex-shrink-0" style={{ color: 'var(--text-body)' }}>{item.label} ({item.weight})</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-page)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      background: item.value >= 80 ? 'var(--success)' : item.value >= 50 ? 'var(--warning)' : 'var(--danger)',
                    }}
                  />
                </div>
                <span className="text-xs w-10 text-right font-medium" style={{ color: 'var(--text-muted)' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Card */}
        <ResultCard title="Gig Preview" icon="🟢">
          {/* Title */}
          <div className="mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
              {gig.title || 'Your gig title will appear here'}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {gig.category || 'Category'}
              </span>
              {gig.subNiche && (
                <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {gig.subNiche}
                </span>
              )}
            </div>
          </div>

          {/* Description Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Description</h4>
            <pre
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--text-body)', fontFamily: 'inherit' }}
            >
              {descText || 'Fill in the description sections to see a preview here.'}
            </pre>
          </div>

          {/* Pricing Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>Pricing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['basic', 'standard', 'premium'].map(tier => {
                const t = gig.pricing[tier]
                const tierColor = tier === 'basic' ? 'var(--info)' : tier === 'standard' ? 'var(--accent)' : 'var(--warning)'
                return (
                  <div
                    key={tier}
                    className="rounded-lg p-3 text-center"
                    style={{
                      background: 'var(--bg-page)',
                      border: tier === 'standard' ? `2px solid ${tierColor}` : '1px solid var(--border)',
                    }}
                  >
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: tierColor }}>{t.name}</p>
                    <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>${t.price}</p>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      {t.delivery} day{t.delivery !== 1 ? 's' : ''} delivery | {t.revisions} revision{t.revisions !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-body)' }}>{t.description}</p>
                    {t.features?.length > 0 && (
                      <ul className="mt-2 text-left">
                        {t.features.filter(f => f.trim()).map((f, fi) => (
                          <li key={fi} className="text-xs flex items-center gap-1 py-0.5" style={{ color: 'var(--text-body)' }}>
                            <span style={{ color: 'var(--success)' }}>&#10003;</span> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* FAQs Preview */}
          {gig.faqs.filter(f => f.question.trim()).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>FAQs</h4>
              <div className="space-y-2">
                {gig.faqs.filter(f => f.question.trim()).map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>Q: {faq.question}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>A: {faq.answer || '(no answer)'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Preview */}
          {gig.tags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Tags</h4>
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements Preview */}
          {gig.requirements.filter(r => r.trim()).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Buyer Requirements</h4>
              <ul className="space-y-1">
                {gig.requirements.filter(r => r.trim()).map((req, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-body)' }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>&#9679;</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ResultCard>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <CopyButton text={fullText} label="Copy Full Gig" />
          <ExportButton elementId="fiverr-gig-export" filename={`fiverr-gig-${(gig.title || 'draft').replace(/\s+/g, '-').toLowerCase()}.pdf`} label="Export PDF" />
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--success)', color: '#fff' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Gig
          </button>
        </div>
      </div>
    )
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5]

  /* ───────────────────────── Render ───────────────────────── */

  return (
    <ToolLayout
      title="Fiverr Gig Creator"
      description="Create optimized Fiverr gigs step by step. Generate SEO-friendly titles, structured descriptions, tiered pricing, and FAQs — all with an optimization score."
      category="Freelancer Tools"
      icon="🟢"
      proTip="Top Fiverr sellers use all 3 pricing tiers, include 5+ FAQs, and keep their gig titles between 60-80 characters starting with 'I will'."
    >
      {/* Top Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={handleNew}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
          >
            + New Gig
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: showHistory ? 'var(--accent-soft)' : 'var(--bg-elevated)',
              color: showHistory ? 'var(--accent)' : 'var(--text-body)',
              border: '1px solid var(--border)',
            }}
          >
            Saved Gigs ({savedGigs.length})
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: score.total >= 80 ? 'var(--success)' : score.total >= 60 ? 'var(--accent)' : score.total >= 40 ? 'var(--warning)' : 'var(--danger)',
                color: '#fff',
              }}
            >
              {score.total}
            </div>
            <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Score</span>
          </div>
        </div>
      </div>

      {/* Saved Gigs Panel */}
      {showHistory && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>Saved Gigs</h3>
          {savedGigs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No saved gigs yet. Complete a gig and save it from the Preview step.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedGigs.map(g => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>
                      {g.title || 'Untitled Gig'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {g.category || 'No category'} {g.savedAt ? `· ${new Date(g.savedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleLoad(g)}
                      className="px-3 py-1 rounded text-xs font-medium"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="px-3 py-1 rounded text-xs font-medium"
                      style={{ color: 'var(--danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step Wizard */}
      <StepWizard
        steps={STEP_LABELS}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {stepRenderers[currentStep]()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}
        >
          Previous
        </button>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Step {currentStep + 1} of {STEP_LABELS.length}
        </span>
        <button
          onClick={() => setCurrentStep(Math.min(STEP_LABELS.length - 1, currentStep + 1))}
          disabled={currentStep === STEP_LABELS.length - 1}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {currentStep === STEP_LABELS.length - 2 ? 'Preview' : 'Next'}
        </button>
      </div>
    </ToolLayout>
  )
}
