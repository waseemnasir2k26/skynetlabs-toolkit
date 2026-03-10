import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'

const SERVICE_TYPES = [
  'Web Development',
  'Design',
  'Marketing',
  'Automation',
  'Consulting',
  'Other',
]

const DELIVERABLE_KEYWORDS = {
  'website': { label: 'Website Build', hours: 40 },
  'landing page': { label: 'Landing Page', hours: 12 },
  'landing pages': { label: 'Landing Pages (multiple)', hours: 30 },
  'homepage': { label: 'Homepage Design', hours: 10 },
  'logo': { label: 'Logo Design', hours: 8 },
  'branding': { label: 'Brand Identity Package', hours: 20 },
  'brand identity': { label: 'Brand Identity Package', hours: 20 },
  'mobile app': { label: 'Mobile App Development', hours: 120 },
  'app development': { label: 'App Development', hours: 100 },
  'ecommerce': { label: 'E-commerce Store', hours: 60 },
  'e-commerce': { label: 'E-commerce Store', hours: 60 },
  'online store': { label: 'Online Store Setup', hours: 50 },
  'seo': { label: 'SEO Optimization', hours: 15 },
  'social media': { label: 'Social Media Strategy', hours: 12 },
  'content strategy': { label: 'Content Strategy', hours: 16 },
  'blog': { label: 'Blog Setup & Content', hours: 10 },
  'email campaign': { label: 'Email Campaign', hours: 8 },
  'email marketing': { label: 'Email Marketing Setup', hours: 14 },
  'newsletter': { label: 'Newsletter System', hours: 8 },
  'automation': { label: 'Automation Workflow', hours: 20 },
  'workflow': { label: 'Workflow Design', hours: 15 },
  'crm': { label: 'CRM Integration', hours: 18 },
  'dashboard': { label: 'Dashboard/Analytics', hours: 25 },
  'analytics': { label: 'Analytics Setup', hours: 10 },
  'api': { label: 'API Integration', hours: 20 },
  'database': { label: 'Database Design', hours: 16 },
  'migration': { label: 'Data Migration', hours: 12 },
  'redesign': { label: 'Redesign/Overhaul', hours: 30 },
  'wireframe': { label: 'Wireframing', hours: 8 },
  'prototype': { label: 'Prototype', hours: 14 },
  'ui design': { label: 'UI Design', hours: 20 },
  'ux design': { label: 'UX Research & Design', hours: 24 },
  'copywriting': { label: 'Copywriting', hours: 12 },
  'video': { label: 'Video Production', hours: 16 },
  'photography': { label: 'Photography', hours: 8 },
  'illustration': { label: 'Custom Illustrations', hours: 14 },
  'chatbot': { label: 'Chatbot Setup', hours: 18 },
  'payment': { label: 'Payment Integration', hours: 10 },
  'hosting': { label: 'Hosting & Deployment', hours: 4 },
  'maintenance': { label: 'Ongoing Maintenance', hours: 6 },
  'training': { label: 'Client Training', hours: 4 },
  'documentation': { label: 'Documentation', hours: 6 },
}

const VAGUE_PHRASES = [
  'asap', 'as soon as possible', 'flexible', 'tbd', 'to be determined',
  'whatever you think', 'up to you', 'just make it look good', 'make it pop',
  'we\'ll figure it out', 'keep it simple', 'something cool', 'modern look',
  'clean design', 'we need it fast', 'rush', 'urgent', 'whenever you can',
  'not sure yet', 'we\'ll decide later', 'play it by ear', 'rough idea',
  'ballpark', 'approximately', 'maybe', 'possibly', 'might need',
]

const ESSENTIAL_ELEMENTS = [
  { key: 'timeline', keywords: ['deadline', 'timeline', 'due date', 'launch date', 'by the end of', 'weeks', 'months', 'days', 'date', 'q1', 'q2', 'q3', 'q4', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'], label: 'Timeline / Deadline' },
  { key: 'budget', keywords: ['budget', 'cost', 'price', 'spend', 'investment', 'afford', '$', 'dollars', 'rate'], label: 'Budget / Financial Constraints' },
  { key: 'revisions', keywords: ['revision', 'revisions', 'round', 'rounds', 'feedback', 'iteration', 'changes', 'edits'], label: 'Revision Policy' },
  { key: 'deliverables', keywords: ['deliverable', 'deliverables', 'assets', 'files', 'output', 'final files', 'handoff'], label: 'Clear Deliverables List' },
  { key: 'audience', keywords: ['audience', 'target', 'customer', 'user', 'demographic', 'persona', 'market', 'ideal client'], label: 'Target Audience' },
  { key: 'goals', keywords: ['goal', 'goals', 'objective', 'objectives', 'kpi', 'metric', 'conversion', 'increase', 'improve', 'grow'], label: 'Project Goals / KPIs' },
  { key: 'competitors', keywords: ['competitor', 'competitors', 'competition', 'benchmark', 'reference', 'inspiration', 'examples'], label: 'Competitor / Reference Examples' },
  { key: 'brand', keywords: ['brand', 'style guide', 'brand guidelines', 'colors', 'fonts', 'tone of voice', 'brand voice'], label: 'Brand Guidelines' },
]

function analyzeBrief(briefText, hourlyRate, serviceType) {
  const text = briefText.toLowerCase()
  const words = text.split(/\s+/).length

  // Extract deliverables
  const deliverables = []
  const seen = new Set()
  for (const [keyword, info] of Object.entries(DELIVERABLE_KEYWORDS)) {
    if (text.includes(keyword) && !seen.has(info.label)) {
      seen.add(info.label)
      let adjustedHours = info.hours
      if (serviceType === 'Consulting') adjustedHours = Math.round(info.hours * 0.6)
      if (serviceType === 'Automation') adjustedHours = Math.round(info.hours * 1.2)
      deliverables.push({ ...info, hours: adjustedHours })
    }
  }

  // If no deliverables found, add a generic one
  if (deliverables.length === 0) {
    deliverables.push({ label: 'General Project Work (unspecified)', hours: 20 })
  }

  // Scope creep risks
  const scopeCreepRisks = []
  const vagueFound = VAGUE_PHRASES.filter(p => text.includes(p))
  if (vagueFound.length > 0) {
    scopeCreepRisks.push(`Vague language detected: "${vagueFound.slice(0, 3).join('", "')}"${vagueFound.length > 3 ? ` and ${vagueFound.length - 3} more` : ''}`)
  }
  if (text.includes('unlimited') || text.includes('as many as')) {
    scopeCreepRisks.push('Unlimited scope language detected - high risk of never-ending revisions')
  }
  if (!text.includes('revision') && !text.includes('round') && !text.includes('feedback')) {
    scopeCreepRisks.push('No revision limits mentioned - scope creep risk for unlimited changes')
  }
  if (text.includes('ongoing') || text.includes('long-term') || text.includes('retainer')) {
    scopeCreepRisks.push('Ongoing/retainer scope without clear boundaries')
  }
  if (deliverables.length > 5) {
    scopeCreepRisks.push(`Large scope with ${deliverables.length} deliverables - consider phased approach`)
  }
  if (text.includes('everything') || text.includes('full service') || text.includes('end-to-end')) {
    scopeCreepRisks.push('"Everything" language suggests undefined boundaries')
  }
  if (scopeCreepRisks.length === 0) {
    scopeCreepRisks.push('No major scope creep red flags detected')
  }

  // Missing information
  const missingInfo = []
  const presentElements = []
  for (const element of ESSENTIAL_ELEMENTS) {
    const found = element.keywords.some(kw => text.includes(kw))
    if (!found) {
      missingInfo.push(element.label)
    } else {
      presentElements.push(element.label)
    }
  }

  // Questions to ask
  const questions = []
  if (!text.includes('deadline') && !text.includes('timeline') && !text.includes('date')) {
    questions.push('What is your target launch date or deadline for this project?')
  }
  if (!text.includes('budget') && !text.includes('cost') && !text.includes('$')) {
    questions.push('Do you have a budget range in mind for this project?')
  }
  if (!text.includes('revision') && !text.includes('round')) {
    questions.push('How many rounds of revisions are included in the scope?')
  }
  if (!text.includes('audience') && !text.includes('target') && !text.includes('customer')) {
    questions.push('Who is the target audience for this project?')
  }
  if (!text.includes('competitor') && !text.includes('reference') && !text.includes('example') && !text.includes('inspiration')) {
    questions.push('Can you share 2-3 reference examples or competitor sites you admire?')
  }
  if (!text.includes('brand') && !text.includes('style') && !text.includes('color')) {
    questions.push('Do you have existing brand guidelines, style guide, or preferred colors/fonts?')
  }
  if (!text.includes('content') && !text.includes('copy') && !text.includes('text')) {
    questions.push('Who will be providing the content/copy for this project?')
  }
  if (!text.includes('hosting') && !text.includes('domain') && (text.includes('website') || text.includes('web'))) {
    questions.push('Do you have hosting and domain already set up, or do we need to handle that?')
  }
  if (!text.includes('analytics') && !text.includes('tracking') && !text.includes('metric')) {
    questions.push('What metrics will you use to measure the success of this project?')
  }
  if (questions.length === 0) {
    questions.push('The brief seems fairly comprehensive. Consider confirming all assumptions in a kickoff call.')
  }

  // Total hours & cost
  const totalHours = deliverables.reduce((sum, d) => sum + d.hours, 0)
  const totalCost = hourlyRate ? totalHours * hourlyRate : null

  // Brief quality score
  let score = 0
  // Word count (more detail = better, up to a point)
  if (words >= 50) score += 10
  if (words >= 100) score += 10
  if (words >= 200) score += 5
  if (words >= 500) score += 5

  // Present elements (up to 40 points)
  score += Math.round((presentElements.length / ESSENTIAL_ELEMENTS.length) * 40)

  // Deliverable clarity (up to 20 points)
  score += Math.min(20, deliverables.length * 5)

  // Penalize vagueness (up to -20)
  score -= Math.min(20, vagueFound.length * 5)

  // Bonus for specificity
  if (text.match(/\d+/)) score += 5 // contains numbers
  if (text.includes('page') || text.includes('section')) score += 3
  if (text.includes('deadline') || text.includes('date')) score += 2

  score = Math.max(0, Math.min(100, score))

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent Brief'
    if (s >= 60) return 'Good Brief'
    if (s >= 40) return 'Needs Work'
    return 'Incomplete Brief'
  }

  return {
    deliverables,
    scopeCreepRisks,
    missingInfo,
    questions,
    totalHours,
    totalCost,
    score,
    scoreLabel: getScoreLabel(score),
    wordCount: words,
    vagueCount: vagueFound.length,
  }
}

export default function App() {
  const [briefText, setBriefText] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [serviceType, setServiceType] = useState('Web Development')
  const [results, setResults] = useState(null)

  const handleAnalyze = () => {
    if (!briefText.trim()) return
    const rate = hourlyRate ? parseFloat(hourlyRate) : 0
    const analysis = analyzeBrief(briefText, rate, serviceType)
    setResults(analysis)
  }

  const handleReset = () => {
    setBriefText('')
    setHourlyRate('')
    setServiceType('Web Development')
    setResults(null)
  }

  const questionsText = results
    ? results.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : ''

  return (
    <ToolLayout
      title="AI Client Brief Analyzer"
      description="Paste any client brief to extract deliverables, spot scope creep risks, identify missing information, and get an instant scope estimate."
    >
      {/* Input Section */}
      <div className="space-y-6">
        <ResultCard title="Client Brief" icon="📋">
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            placeholder="Paste your client brief here... Include as much detail as possible about the project requirements, goals, timeline, and deliverables."
            rows={8}
            className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-y text-sm leading-relaxed"
          />
          {briefText && (
            <p className="text-gray-500 text-xs mt-1">{briefText.split(/\s+/).filter(Boolean).length} words</p>
          )}
        </ResultCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Hourly Rate (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="150"
                min="0"
                className="w-full bg-dark-200/50 border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm appearance-none cursor-pointer"
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t} className="bg-dark-200">{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!briefText.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
          >
            Analyze Brief
          </button>
          {results && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-dark-200/50 hover:bg-dark-200 text-gray-300 font-medium rounded-xl transition-all text-sm border border-white/5"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-6" id="brief-results">
          {/* Score + Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultCard title="Brief Quality" icon="📊" className="flex flex-col items-center">
              <ScoreGauge score={results.score} label={results.scoreLabel} />
              <p className="text-gray-400 text-xs mt-2 text-center">
                {results.wordCount} words &middot; {results.vagueCount} vague phrase{results.vagueCount !== 1 ? 's' : ''}
              </p>
            </ResultCard>

            <ResultCard title="Scope Estimate" icon="⏱️" className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-200/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{results.totalHours} hrs</p>
                  <p className="text-gray-400 text-xs mt-1">Estimated Total Hours</p>
                </div>
                <div className="bg-dark-200/30 rounded-lg p-4 text-center">
                  {results.totalCost ? (
                    <>
                      <p className="text-2xl font-bold text-primary">
                        ${results.totalCost.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Estimated Cost @ ${parseFloat(hourlyRate)}/hr
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-500">--</p>
                      <p className="text-gray-400 text-xs mt-1">Enter hourly rate for cost</p>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Based on {results.deliverables.length} identified deliverable{results.deliverables.length !== 1 ? 's' : ''} for {serviceType}
              </p>
            </ResultCard>
          </div>

          {/* Deliverables */}
          <ResultCard title="Extracted Deliverables" icon="📦">
            <ul className="space-y-2">
              {results.deliverables.map((d, i) => (
                <li key={i} className="flex items-center justify-between bg-dark-200/30 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-white text-sm">{d.label}</span>
                  </div>
                  <span className="text-gray-400 text-sm font-mono">{d.hours} hrs</span>
                </li>
              ))}
            </ul>
          </ResultCard>

          {/* Scope Creep Risks */}
          <ResultCard title="Scope Creep Risks" icon="🚩">
            <ul className="space-y-2">
              {results.scopeCreepRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">&#9888;</span>
                  <span className="text-red-300">{risk}</span>
                </li>
              ))}
            </ul>
          </ResultCard>

          {/* Missing Info */}
          {results.missingInfo.length > 0 && (
            <ResultCard title="Missing Information" icon="❓">
              <div className="flex flex-wrap gap-2">
                {results.missingInfo.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </ResultCard>
          )}

          {/* Questions to Ask */}
          <ResultCard title="Questions to Ask the Client" icon="💬">
            <ol className="space-y-2 mb-4">
              {results.questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-mono flex-shrink-0 w-5 text-right">{i + 1}.</span>
                  <span className="text-gray-300">{q}</span>
                </li>
              ))}
            </ol>
            <CopyButton text={questionsText} label="Copy All Questions" />
          </ResultCard>

          {/* Export */}
          <div className="flex justify-end">
            <ExportButton
              elementId="brief-results"
              filename="brief-analysis.pdf"
              label="Export Analysis PDF"
            />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
