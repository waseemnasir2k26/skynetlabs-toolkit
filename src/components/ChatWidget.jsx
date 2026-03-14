import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const TOOL_MAP = [
  { path: '/proposal-builder', name: 'Proposal & Quote Builder', keywords: ['proposal', 'quote', 'estimate', 'bid', 'pricing', 'client proposal'], description: 'Build stunning client proposals with live preview and PDF export.' },
  { path: '/project-tracker', name: 'Client Project Tracker', keywords: ['project', 'track', 'manage', 'kanban', 'task', 'deadline', 'milestone'], description: 'Full project management with Kanban, calendar, and client portals.' },
  { path: '/client-onboarding', name: 'Client Onboarding & NDA', keywords: ['onboarding', 'nda', 'contract', 'welcome', 'new client', 'intake'], description: 'Professional onboarding forms with NDA, contracts, and e-signatures.' },
  { path: '/brief-analyzer', name: 'Client Brief Analyzer', keywords: ['brief', 'analyze', 'scope', 'deliverables', 'requirements', 'estimate hours'], description: 'Extract deliverables, flag scope creep risks, estimate hours.' },
  { path: '/sow-generator', name: 'SOW Generator', keywords: ['sow', 'statement of work', 'milestones', 'payment terms', 'scope document'], description: 'Generate a complete Statement of Work.' },
  { path: '/meeting-manager', name: 'Meeting Lifecycle Manager', keywords: ['meeting', 'agenda', 'action items', 'notes', 'call', 'schedule'], description: 'Structured agendas and action items.' },
  { path: '/subject-line-tester', name: 'Email Subject Line Tester', keywords: ['subject line', 'email', 'open rate', 'subject', 'newsletter', 'email marketing'], description: 'Score and optimize email subject lines.' },
  { path: '/email-templates', name: 'Email Template Library', keywords: ['email template', 'outreach email', 'follow up', 'sales email', 'template'], description: '30+ professional email templates.' },
  { path: '/cold-outreach', name: 'Cold Outreach Sequence Builder', keywords: ['cold email', 'outreach', 'sequence', 'prospecting', 'lead gen', 'cold call', 'linkedin', 'dm'], description: 'Multi-channel outreach campaigns.' },
  { path: '/onboarding-portal', name: 'Onboarding Portal', keywords: ['portal', 'onboard', 'client portal', 'welcome page'], description: 'Branded portal for new client onboarding.' },
  { path: '/client-report', name: 'Client Report Builder', keywords: ['report', 'client report', 'monthly report', 'metrics', 'dashboard'], description: 'Drag-and-drop report builder with PDF export.' },
  { path: '/fiverr-gig-creator', name: 'Fiverr Gig Creator', keywords: ['fiverr', 'gig', 'freelance', 'upwork', 'profile', 'service listing', 'freelancer'], description: 'Create optimized Fiverr gigs.' },
  { path: '/contract-generator', name: 'Contract Generator', keywords: ['contract', 'agreement', 'legal', 'terms', 'freelance contract'], description: 'Generate freelance contracts.' },
  { path: '/brand-kit-generator', name: 'Brand Kit Generator', keywords: ['brand', 'branding', 'logo', 'colors', 'typography', 'identity', 'brand kit'], description: 'Generate a complete brand kit.' },
  { path: '/content-planner', name: '90-Day Content Planner', keywords: ['content', 'content plan', 'blog', 'content calendar', 'editorial', 'content strategy'], description: '90-day content calendar.' },
  { path: '/social-proof-manager', name: 'Social Proof Manager', keywords: ['testimonial', 'review', 'social proof', 'client review', 'rating'], description: 'Collect and organize testimonials.' },
  { path: '/business-scorecard', name: 'Business Health Scorecard', keywords: ['scorecard', 'health check', 'diagnostic', 'business health', 'assessment'], description: '50-question business diagnostic.' },
  { path: '/website-audit', name: 'Website Conversion Audit', keywords: ['website', 'audit', 'conversion', 'landing page', 'cro', 'optimize'], description: '20-point conversion optimization.' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet Factory', keywords: ['lead magnet', 'ebook', 'download', 'opt-in', 'freebie', 'lead gen'], description: 'Create lead magnets and landing pages.' },
  { path: '/feedback-survey', name: 'Client Feedback Survey', keywords: ['feedback', 'survey', 'nps', 'satisfaction', 'questionnaire'], description: 'Build custom feedback surveys.' },
  { path: '/social-calendar', name: 'Social Media Calendar', keywords: ['social media', 'instagram', 'twitter', 'linkedin post', 'social schedule', 'posting'], description: 'Plan and schedule social content.' },
  { path: '/case-study-generator', name: 'Case Study Generator', keywords: ['case study', 'portfolio', 'success story', 'results', 'before after'], description: 'Create professional case studies.' },
]

const ALL_SUGGESTIONS = [
  'Create a proposal',
  'Build outreach emails',
  'Start on Fiverr',
  'Analyze a brief',
  'Generate a contract',
  'Plan my content',
]

const GREETINGS = ['hi', 'hello', 'hey', 'howdy', 'sup', 'yo', 'hola']
const HELP_PHRASES = ['help', 'what can you do', 'what do you do', 'how does this work', 'commands']

const WELCOME_MESSAGE = {
  role: 'bot',
  text: "Hey! \u{1F44B} I'm the Skynet AI Assistant. Tell me what you're trying to do, and I'll recommend the perfect tool for you. Or try one of the suggestions below!",
  tools: [],
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function matchTools(input) {
  const lower = input.toLowerCase()
  const scored = TOOL_MAP.map((tool) => {
    let score = 0
    for (const kw of tool.keywords) {
      if (lower.includes(kw)) score++
    }
    return { ...tool, score }
  })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, 3)
}

function generateResponse(input) {
  const lower = input.toLowerCase().trim()

  if (GREETINGS.some((g) => lower === g || lower === g + '!')) {
    return {
      text: "Hello! \u{1F44B} I'm here to help you find the perfect tool. What are you working on today? You can ask me about proposals, outreach, contracts, branding, and much more!",
      tools: [],
    }
  }

  if (HELP_PHRASES.some((h) => lower.includes(h))) {
    return {
      text: "I can help you find the right tool for any task! Here's what I cover:\n\n\u{1F4DD} **Client Management** - Proposals, contracts, onboarding\n\u{1F4E7} **Outreach** - Email templates, cold outreach, subject lines\n\u{1F4CA} **Business Tools** - Reports, scorecards, audits\n\u{1F3A8} **Branding** - Brand kits, case studies, content planning\n\u{1F4F1} **Social Media** - Calendars, social proof, lead magnets\n\nJust tell me what you need!",
      tools: [],
    }
  }

  const matches = matchTools(input)
  if (matches.length > 0) {
    const intro =
      matches.length === 1
        ? "I found the perfect tool for you:"
        : `I found ${matches.length} tools that can help:`
    return { text: intro, tools: matches }
  }

  return {
    text: "I couldn't find an exact match, but here are some popular categories to explore:\n\n\u{2022} **Proposals & Contracts** - Try asking about proposals, quotes, or contracts\n\u{2022} **Email & Outreach** - Ask about email templates or cold outreach\n\u{2022} **Client Management** - Try onboarding, project tracking, or reports\n\u{2022} **Branding & Content** - Ask about brand kits, content planning, or case studies\n\nTry rephrasing or pick a suggestion below!",
    tools: [],
  }
}

export default function ChatWidget() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const suggestions = useMemo(() => pickRandom(ALL_SUGGESTIONS, 4), [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    setShowTooltip(false)
    if (!hasOpened) setHasOpened(true)
  }

  const handleSend = (text) => {
    const msg = (text || input).trim()
    if (!msg) return

    setMessages((prev) => [...prev, { role: 'user', text: msg, tools: [] }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = generateResponse(msg)
      setMessages((prev) => [...prev, { role: 'bot', ...response }])
      setIsTyping(false)
    }, 500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToolClick = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: 380,
            height: 520,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            animation: 'chatSlideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{'\u{1F916}'}</span>
              <span className="font-semibold text-sm">Skynet AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.2)' }}
              aria-label="Close chat"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: 'var(--bg-page)' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && <span className="text-lg mt-1 shrink-0">{'\u{1F916}'}</span>}
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: msg.role === 'user' ? 'var(--text-on-accent)' : 'var(--text-body)',
                    border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text.split(/(\*\*.*?\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={j} style={{ color: 'var(--text-heading)' }}>
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                  {msg.tools?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.tools.map((tool) => (
                        <button
                          key={tool.path}
                          onClick={() => handleToolClick(tool.path)}
                          className="w-full text-left rounded-lg px-3 py-2 transition-all hover:scale-[1.02]"
                          style={{
                            background: 'var(--accent-soft)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div className="font-medium text-xs" style={{ color: 'var(--accent)' }}>
                            {tool.name}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {tool.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && <span className="text-lg mt-1 shrink-0">{'\u{1F4AC}'}</span>}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <span className="text-lg mt-1 shrink-0">{'\u{1F916}'}</span>
                <div
                  className="rounded-xl px-4 py-3 flex gap-1 items-center"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        background: 'var(--text-muted)',
                        animation: `chatDotBounce 1.2s infinite ${dot * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            className="flex gap-2 px-4 py-2 overflow-x-auto shrink-0"
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 shrink-0"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
              style={{
                background: 'var(--bg-page)',
                color: 'var(--text-body)',
                border: '1px solid var(--border)',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all shrink-0"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
                color: input.trim() ? 'var(--text-on-accent)' : 'var(--text-muted)',
                cursor: input.trim() ? 'pointer' : 'default',
              }}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14.5 1.5L6.5 9.5M14.5 1.5L10 14.5L6.5 9.5M14.5 1.5L1.5 6L6.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {!isOpen && showTooltip && (
        <div
          className="px-3 py-2 rounded-lg text-xs shadow-lg whitespace-nowrap"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-body)',
            border: '1px solid var(--border)',
            animation: 'chatFadeIn 0.3s ease-out',
          }}
        >
          Need help finding a tool?
          <div
            className="absolute -bottom-1 right-6 w-2 h-2 rotate-45"
            style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          />
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{
          background: 'var(--accent)',
          color: 'var(--text-on-accent)',
          animation: !isOpen ? 'chatPulse 2s ease-in-out infinite' : 'none',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 11.5C21 16.75 16.75 21 11.5 21C10.15 21 8.87 20.72 7.7 20.22L3 21L3.78 16.3C3.28 15.13 3 13.85 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 21 6.25 21 11.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="12" r="1" fill="currentColor" />
            <circle cx="12.5" cy="12" r="1" fill="currentColor" />
            <circle cx="16.5" cy="12" r="1" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Keyframe animations */}
      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--accent); }
          50% { box-shadow: 0 0 0 10px transparent; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
