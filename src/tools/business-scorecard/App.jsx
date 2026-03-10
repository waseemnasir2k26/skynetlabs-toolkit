import React, { useState, useMemo, useEffect, useCallback } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import ExportButton from '../shared/ExportButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import ShareButton from '../shared/ShareButton'
import { useSearchParams } from 'react-router-dom'

const CATEGORIES = [
  {
    name: 'Financial Health',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    questions: [
      { q: 'Do you have 3+ months of expenses saved as an emergency fund?', tips: 'Build a safety net of 3-6 months of business expenses in a separate savings account.' },
      { q: 'Has your revenue grown or remained stable over the past 6 months?', tips: 'Track monthly revenue trends. If declining, analyze which services or clients are dropping off.' },
      { q: 'Do you have a clear pricing strategy (not just guessing)?', tips: 'Research market rates, calculate your costs, and set prices based on value delivered.' },
      { q: 'Are you prepared for tax season with proper bookkeeping?', tips: 'Use accounting software, set aside 25-30% for taxes, and consider a quarterly review with an accountant.' },
      { q: 'Do you have clear payment terms (net 15/30) enforced consistently?', tips: 'Standardize payment terms in contracts, use automated invoicing, and follow up on late payments immediately.' },
      { q: 'Are your profit margins healthy (30%+ after all expenses)?', tips: 'Calculate true profit by subtracting ALL costs including your time. Aim for 30-50% margins.' },
    ],
  },
  {
    name: 'Client Diversification',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    questions: [
      { q: 'Do you have 5 or more active clients currently?', tips: 'Diversify your client base to reduce dependency. Aim for no single client being more than 30% of revenue.' },
      { q: 'Is your largest client less than 30% of total revenue?', tips: 'If one client dominates your income, actively prospect to balance your portfolio.' },
      { q: 'Do you serve clients across multiple industries?', tips: 'Industry diversification protects against sector downturns. Explore adjacent verticals.' },
      { q: 'Do you have retainer/recurring revenue from at least some clients?', tips: 'Offer monthly retainer packages for ongoing work. This provides predictable revenue.' },
      { q: 'Are you consistently acquiring new clients (at least 1/quarter)?', tips: 'Maintain a sales pipeline even when busy. Allocate 10-20% of time to business development.' },
      { q: 'Do you have a referral system or program in place?', tips: 'Create a formal referral program with incentives. Ask happy clients for referrals systematically.' },
    ],
  },
  {
    name: 'Systems & Processes',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    questions: [
      { q: 'Do you use a CRM to track leads and client relationships?', tips: 'Even a simple CRM (HubSpot free, Notion, Airtable) keeps you organized and prevents leads from falling through cracks.' },
      { q: 'Do you use a project management tool consistently?', tips: 'Tools like Asana, Trello, or ClickUp help track deliverables, deadlines, and client communication.' },
      { q: 'Do you have standardized contracts for all engagements?', tips: 'Use a lawyer-reviewed contract template. Never start work without a signed agreement.' },
      { q: 'Do you track your time accurately on projects?', tips: 'Use time tracking (Toggl, Harvest) to understand profitability per client and project.' },
      { q: 'Do you have a documented client onboarding process?', tips: 'Create a checklist/workflow for new clients: welcome email, kickoff call agenda, access requests, etc.' },
      { q: 'Do you have documented SOPs for your core services?', tips: 'Document your processes step-by-step. This enables delegation and ensures consistency.' },
      { q: 'Is your invoicing automated or systematized?', tips: 'Use invoicing software (FreshBooks, Wave, Stripe) with automated reminders and recurring invoices.' },
    ],
  },
  {
    name: 'Marketing & Lead Gen',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    questions: [
      { q: 'Do you have a professional website that clearly communicates your value?', tips: 'Your website should have a clear value proposition, services page, portfolio, and CTAs within 5 seconds.' },
      { q: 'Do you have a content strategy (blog, video, podcast)?', tips: 'Create content that demonstrates expertise. Even 1 quality piece per week builds authority over time.' },
      { q: 'Are you active on social media platforms relevant to your audience?', tips: 'Focus on 1-2 platforms where your ideal clients hang out. Consistency beats frequency.' },
      { q: 'Do you have an updated portfolio or case studies?', tips: 'Showcase 5-10 best projects with results. Include before/after, metrics, and client testimonials.' },
      { q: 'Do you have detailed case studies showing client results?', tips: 'Create case studies with: challenge, solution, results, and client quote. These are powerful sales tools.' },
      { q: 'Are you building an email list or newsletter?', tips: 'Start a newsletter to nurture leads. Offer a lead magnet (guide, checklist) to grow your list.' },
      { q: 'Do you receive inbound leads regularly (at least monthly)?', tips: 'If not getting inbound leads, invest in SEO, content marketing, and partnerships for organic growth.' },
    ],
  },
  {
    name: 'Pricing & Positioning',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    questions: [
      { q: 'Are you confident in your rates (not undercharging)?', tips: 'If you never get pushback on pricing, you are likely too cheap. Test raising rates by 20% with new clients.' },
      { q: 'Do you price based on value delivered rather than hours?', tips: 'Shift to value-based pricing: price based on client outcomes, not your time. Package your services.' },
      { q: 'Can you clearly articulate your positioning in one sentence?', tips: 'Craft a positioning statement: "I help [audience] achieve [outcome] through [method]."' },
      { q: 'Do you have a defined niche or specialization?', tips: 'Niching down makes you the go-to expert. Specialists command higher rates than generalists.' },
      { q: 'Do you know your competitors and how you differentiate?', tips: 'Research 5-10 competitors. Identify gaps in their offerings that you can fill uniquely.' },
      { q: 'Do you have a public pricing page or clear packages?', tips: 'Transparent pricing pre-qualifies leads and saves time. Offer 3 tiers (Good/Better/Best).' },
    ],
  },
  {
    name: 'Legal & Protection',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    questions: [
      { q: 'Do you use professional contracts for every engagement?', tips: 'Never work without a contract. Include scope, timeline, payment terms, revision limits, and termination clauses.' },
      { q: 'Do your contracts include IP ownership and usage clauses?', tips: 'Clarify who owns the work product and when IP transfers (typically upon full payment).' },
      { q: 'Do you have professional liability or E&O insurance?', tips: 'Professional liability insurance protects against claims of negligence. Essential for consultants and agencies.' },
      { q: 'Do you have NDA templates ready for sensitive projects?', tips: 'Have a mutual NDA template reviewed by a lawyer. Use it for projects involving confidential information.' },
      { q: 'Do you have a kill fee or cancellation policy?', tips: 'Include a cancellation clause: 50% kill fee if cancelled after kickoff, 100% for work completed.' },
      { q: 'Do you have a late payment policy with teeth?', tips: 'Charge 1.5-2% monthly interest on late payments. State this clearly in contracts and enforce it.' },
    ],
  },
  {
    name: 'Work-Life & Burnout',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    questions: [
      { q: 'Do you work reasonable hours (under 50 hours/week on average)?', tips: 'Track your hours honestly. If consistently over 50, you need to raise prices, hire, or reduce scope.' },
      { q: 'Have you taken a real vacation (7+ days) in the past year?', tips: 'Schedule vacations in advance and communicate blackout dates to clients. Your business should survive without you.' },
      { q: 'Do you have clear boundaries between work and personal time?', tips: 'Set office hours, separate work phone/email, and create a dedicated workspace. Communicate boundaries to clients.' },
      { q: 'Do you generally feel energized and motivated about your work?', tips: 'If burnt out, identify energy drains. Consider dropping bad clients, automating tasks, or taking a sabbatical.' },
      { q: 'Have you delegated or outsourced any tasks?', tips: 'Identify tasks below your pay grade and outsource. A VA for $15-25/hr frees your time for high-value work.' },
      { q: 'Do you have regular non-work activities for rest and recovery?', tips: 'Schedule exercise, hobbies, and social time like appointments. Rest is productive, not lazy.' },
    ],
  },
  {
    name: 'Growth & Scalability',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    questions: [
      { q: 'Do you have a clear 12-month growth plan?', tips: 'Write a simple business plan: revenue targets, client goals, service expansions, and key milestones.' },
      { q: 'Are you investing in skill development regularly?', tips: 'Allocate 5-10% of revenue and 5 hours/week to learning. Stay current with industry trends and tools.' },
      { q: 'Do you actively network (events, communities, masterminds)?', tips: 'Join 2-3 professional communities. Attend industry events. Relationships drive referrals and opportunities.' },
      { q: 'Are you exploring passive or semi-passive income streams?', tips: 'Consider courses, templates, productized services, or digital products that generate income without 1:1 time.' },
      { q: 'Have you considered building a team or partnerships?', tips: 'Start with contractors for overflow work. Partnerships with complementary freelancers expand your service offerings.' },
      { q: 'Do you have a clear long-term vision for your business (3-5 years)?', tips: 'Define where you want to be: solo premium, agency, product business, or hybrid. Let this guide decisions.' },
    ],
  },
]

const TOTAL_QUESTIONS = CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0)

function getLabel(score) {
  if (score >= 90) return 'Elite'
  if (score >= 75) return 'Excellent'
  if (score >= 55) return 'Good'
  if (score >= 35) return 'Needs Work'
  return 'Critical'
}

function getPercentile(score) {
  if (score >= 90) return 97
  if (score >= 80) return 88
  if (score >= 70) return 75
  if (score >= 60) return 58
  if (score >= 50) return 42
  if (score >= 40) return 28
  if (score >= 30) return 15
  return 5
}

export default function App() {
  const [answers, setAnswers] = useLocalStorage('biz-scorecard-answers', {})
  const [currentCategory, setCurrentCategory] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [started, setStarted] = useState(false)
  const [searchParams] = useSearchParams()

  // Load answers from URL on mount
  useEffect(() => {
    const encoded = searchParams.get('answers')
    if (encoded) {
      try {
        const parsed = JSON.parse(decodeURIComponent(encoded))
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed)
          setShowResults(true)
          setStarted(true)
        }
      } catch { /* ignore bad data */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const generateShareURL = useCallback(() => {
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('answers', JSON.stringify(answers))
    return url.toString()
  }, [answers])

  const flatQuestions = useMemo(() => {
    const flat = []
    CATEGORIES.forEach((cat, ci) => {
      cat.questions.forEach((q, qi) => {
        flat.push({ ...q, categoryIndex: ci, questionIndex: qi, key: `${ci}-${qi}` })
      })
    })
    return flat
  }, [])

  const currentFlat = useMemo(() => {
    let idx = 0
    for (let i = 0; i < currentCategory; i++) idx += CATEGORIES[i].questions.length
    return idx + currentQuestion
  }, [currentCategory, currentQuestion])

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / TOTAL_QUESTIONS) * 100

  const setAnswer = (val) => {
    const key = `${currentCategory}-${currentQuestion}`
    setAnswers(prev => ({ ...prev, [key]: val }))
    // Auto-advance
    setTimeout(() => {
      if (currentQuestion < CATEGORIES[currentCategory].questions.length - 1) {
        setCurrentQuestion(q => q + 1)
      } else if (currentCategory < CATEGORIES.length - 1) {
        setCurrentCategory(c => c + 1)
        setCurrentQuestion(0)
      }
    }, 300)
  }

  const goTo = (catIdx, qIdx) => {
    setCurrentCategory(catIdx)
    setCurrentQuestion(qIdx)
  }

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(q => q - 1)
    } else if (currentCategory > 0) {
      const prevCat = currentCategory - 1
      setCurrentCategory(prevCat)
      setCurrentQuestion(CATEGORIES[prevCat].questions.length - 1)
    }
  }

  const goNext = () => {
    if (currentQuestion < CATEGORIES[currentCategory].questions.length - 1) {
      setCurrentQuestion(q => q + 1)
    } else if (currentCategory < CATEGORIES.length - 1) {
      setCurrentCategory(c => c + 1)
      setCurrentQuestion(0)
    }
  }

  // Calculate scores
  const categoryScores = useMemo(() => {
    return CATEGORIES.map((cat, ci) => {
      const qCount = cat.questions.length
      let total = 0, answered = 0
      cat.questions.forEach((_, qi) => {
        const val = answers[`${ci}-${qi}`]
        if (val !== undefined) { total += val; answered++ }
      })
      const maxScore = qCount * 5
      const score = answered > 0 ? Math.round((total / maxScore) * 100) : 0
      return { name: cat.name, score, answered, total: qCount }
    })
  }, [answers])

  const overallScore = useMemo(() => {
    let totalPossible = 0, totalEarned = 0
    CATEGORIES.forEach((cat, ci) => {
      cat.questions.forEach((_, qi) => {
        totalPossible += 5
        const val = answers[`${ci}-${qi}`]
        if (val !== undefined) totalEarned += val
      })
    })
    return totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0
  }, [answers])

  // Priority actions
  const priorityActions = useMemo(() => {
    const weak = []
    CATEGORIES.forEach((cat, ci) => {
      cat.questions.forEach((q, qi) => {
        const val = answers[`${ci}-${qi}`]
        if (val !== undefined && val <= 2) {
          weak.push({ category: cat.name, question: q.q, tip: q.tips, score: val })
        }
      })
    })
    return weak.sort((a, b) => a.score - b.score).slice(0, 5)
  }, [answers])

  const radarData = categoryScores.map(c => ({ category: c.name.split(' ')[0], score: c.score, fullMark: 100 }))

  const handleFinish = () => {
    if (answeredCount < TOTAL_QUESTIONS) {
      if (!confirm(`You've answered ${answeredCount} of ${TOTAL_QUESTIONS} questions. Unanswered questions will score 0. Continue?`)) return
    }
    setShowResults(true)
  }

  const handleReset = () => {
    setAnswers({})
    setCurrentCategory(0)
    setCurrentQuestion(0)
    setShowResults(false)
    setStarted(false)
  }

  // Intro screen
  if (!started && !showResults) {
    return (
      <ToolLayout title="Freelance Business Health Scorecard" description="A comprehensive 50-question diagnostic to evaluate the health of your freelance business across 8 critical categories.">
        <div className="max-w-2xl mx-auto">
          <ResultCard>
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
                <svg className="w-10 h-10" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-heading)" }}>Evaluate Your Business Health</h2>
              <p className="max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>Answer {TOTAL_QUESTIONS} questions across {CATEGORIES.length} categories to get your personalized Business Health Score with actionable recommendations.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {CATEGORIES.map((cat, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <svg className="w-5 h-5 mb-1" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
                    </svg>
                    <p className="text-xs font-medium" style={{ color: "var(--text-heading)" }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{cat.questions.length} questions</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStarted(true)} className="px-8 py-3 font-semibold rounded-xl transition-colors text-lg" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                Start Assessment
              </button>
              {answeredCount > 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>You have {answeredCount} saved answers. <button onClick={() => setStarted(true)} style={{ color: "var(--accent)" }}>Continue</button> or <button onClick={handleReset} style={{ color: "var(--danger)" }}>Reset</button></p>
              )}
            </div>
          </ResultCard>
        </div>
      </ToolLayout>
    )
  }

  // Results screen
  if (showResults) {
    return (
      <ToolLayout title="Freelance Business Health Scorecard" description="Your personalized business health results and recommendations.">
        <div id="scorecard-results" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <button onClick={() => { setShowResults(false); setStarted(true) }} className="text-sm flex items-center gap-1 transition-colors" style={{ color: "var(--text-muted)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Questions
            </button>
            <div className="flex gap-3">
              <ExportButton elementId="scorecard-results" filename="business-scorecard.pdf" label="Export PDF" />
              <ShareButton getShareURL={generateShareURL} />
              <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>Reset</button>
            </div>
          </div>

          {/* Overall Score */}
          <ResultCard>
            <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
              <ScoreGauge score={overallScore} label={getLabel(overallScore)} size={180} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>Your Business Health Score</h2>
                <p className="mb-3" style={{ color: "var(--text-muted)" }}>Based on {answeredCount} of {TOTAL_QUESTIONS} questions answered</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Estimated Percentile:</span>
                  <span className="font-bold" style={{ color: "var(--accent)" }}>Top {100 - getPercentile(overallScore)}%</span>
                </div>
              </div>
            </div>
          </ResultCard>

          {/* Radar Chart */}
          <ResultCard title="Category Breakdown">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ResultCard>

          {/* Per-Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryScores.map((cat, i) => (
              <ResultCard key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORIES[i].icon} />
                  </svg>
                  <h3 className="font-semibold" style={{ color: "var(--text-heading)" }}>{cat.name}</h3>
                  <span className="ml-auto text-2xl font-bold" style={{ color: cat.score >= 75 ? 'var(--success)' : cat.score >= 50 ? 'var(--info)' : cat.score >= 30 ? 'var(--warning)' : 'var(--danger)' }}>
                    {cat.score}
                  </span>
                </div>
                <div className="w-full rounded-full h-2 mb-3" style={{ background: "var(--bg-elevated)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${cat.score}%`, backgroundColor: cat.score >= 75 ? 'var(--success)' : cat.score >= 50 ? 'var(--info)' : cat.score >= 30 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{getLabel(cat.score)} - {cat.answered}/{cat.total} answered</p>
                {cat.score < 60 && (
                  <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--warning-soft)", border: "1px solid var(--warning-soft)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--warning)" }}>Recommendations:</p>
                    {CATEGORIES[i].questions.filter((_, qi) => {
                      const val = answers[`${i}-${qi}`]
                      return val !== undefined && val <= 2
                    }).slice(0, 2).map((q, idx) => (
                      <p key={idx} className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>- {q.tips}</p>
                    ))}
                  </div>
                )}
              </ResultCard>
            ))}
          </div>

          {/* Priority Actions */}
          {priorityActions.length > 0 && (
            <ResultCard title="Top Priority Actions">
              <div className="space-y-3">
                {priorityActions.map((action, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>{action.category}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{action.question}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>{action.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}

          {/* CTA */}
          <ResultCard>
            <div className="text-center py-6">
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>Want Help Improving Your Score?</h3>
              <p className="mb-4" style={{ color: "var(--text-muted)" }}>SkynetLabs can help you build systems, automate processes, and grow your freelance business.</p>
              <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
                Book a Free Call with SkynetLabs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </ResultCard>
        </div>
      </ToolLayout>
    )
  }

  // Wizard screen
  const cat = CATEGORIES[currentCategory]
  const q = cat.questions[currentQuestion]
  const currentKey = `${currentCategory}-${currentQuestion}`
  const currentAnswer = answers[currentKey]

  return (
    <ToolLayout title="Freelance Business Health Scorecard" description="Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--text-muted)" }}>Question {currentFlat + 1} of {TOTAL_QUESTIONS}</span>
            <span className="font-medium" style={{ color: "var(--accent)" }}>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: "var(--bg-elevated)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ background: "var(--accent)", width: `${progress}%` }} />
          </div>
        </div>

        {/* Category Navigator */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {CATEGORIES.map((c, i) => {
            const catAnswered = c.questions.filter((_, qi) => answers[`${i}-${qi}`] !== undefined).length
            const isComplete = catAnswered === c.questions.length
            return (
              <button key={i} onClick={() => { setCurrentCategory(i); setCurrentQuestion(0) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={i === currentCategory
                  ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                  : isComplete
                    ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                }>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                </svg>
                {c.name.split(' ')[0]}
                {isComplete && <span style={{ color: "var(--accent)" }}>&#10003;</span>}
              </button>
            )
          })}
        </div>

        {/* Question Card */}
        <ResultCard>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
              </svg>
              <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>{cat.name}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>({currentQuestion + 1}/{cat.questions.length})</span>
            </div>
            <h3 className="text-xl font-semibold mb-8" style={{ color: "var(--text-heading)" }}>{q.q}</h3>

            {/* Rating Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map(val => (
                <button key={val} onClick={() => setAnswer(val)}
                  className="w-14 h-14 rounded-xl text-lg font-bold transition-all"
                  style={currentAnswer === val
                    ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }>
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs px-2" style={{ color: "var(--text-muted)" }}>
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        </ResultCard>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={goPrev} disabled={currentFlat === 0}
            className="flex items-center gap-1 px-4 py-2 disabled:opacity-30 rounded-lg text-sm transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Previous
          </button>
          <button onClick={handleFinish}
            className="px-6 py-2.5 font-medium rounded-xl transition-colors text-sm" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}>
            {answeredCount >= TOTAL_QUESTIONS ? 'View Results' : 'Finish Early'}
          </button>
          <button onClick={goNext} disabled={currentFlat >= TOTAL_QUESTIONS - 1}
            className="flex items-center gap-1 px-4 py-2 disabled:opacity-30 rounded-lg text-sm transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Question Dots */}
        <div className="flex justify-center gap-1 flex-wrap">
          {cat.questions.map((_, qi) => {
            const key = `${currentCategory}-${qi}`
            const answered = answers[key] !== undefined
            return (
              <button key={qi} onClick={() => setCurrentQuestion(qi)}
                className="w-3 h-3 rounded-full transition-all"
                style={qi === currentQuestion
                  ? { background: 'var(--accent)', transform: 'scale(1.25)' }
                  : answered
                    ? { background: 'var(--accent)', opacity: 0.4 }
                    : { background: 'var(--bg-elevated)' }
                } />
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}
