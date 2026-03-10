import { Link } from 'react-router-dom'

const allTools = [
  { path: '/roi-calculator', name: 'AI ROI Calculator', emoji: '📊', category: 'Calculator' },
  { path: '/rate-calculator', name: 'Freelance Rate Calculator', emoji: '💰', category: 'Calculator' },
  { path: '/invoice-generator', name: 'Invoice Generator', emoji: '📄', category: 'Generator' },
  { path: '/proposal-builder', name: 'Proposal Builder', emoji: '📋', category: 'Generator' },
  { path: '/content-calendar', name: 'Content Calendar', emoji: '📅', category: 'Generator' },
  { path: '/scope-tracker', name: 'Scope Creep Tracker', emoji: '🎯', category: 'Agency Operations' },
  { path: '/testimonials', name: 'Testimonial Collector', emoji: '⭐', category: 'Authority Building' },
  { path: '/project-tracker', name: 'Project Tracker', emoji: '📈', category: 'Agency Operations' },
  { path: '/ai-quiz', name: 'AI Readiness Quiz', emoji: '🧠', category: 'AI Intelligence' },
  { path: '/client-onboarding', name: 'Client Onboarding', emoji: '🤝', category: 'Agency Operations' },
  { path: '/brief-analyzer', name: 'Brief Analyzer', emoji: '🔍', category: 'AI Intelligence' },
  { path: '/fire-or-keep', name: 'Fire or Keep', emoji: '🔥', category: 'AI Intelligence' },
  { path: '/niche-scanner', name: 'Niche Scanner', emoji: '🔬', category: 'AI Intelligence' },
  { path: '/sow-generator', name: 'SOW Generator', emoji: '📝', category: 'AI Intelligence' },
  { path: '/client-health', name: 'Client Health', emoji: '💊', category: 'AI Intelligence' },
  { path: '/meeting-manager', name: 'Meeting Manager', emoji: '📞', category: 'AI Intelligence' },
  { path: '/positioning-generator', name: 'Positioning', emoji: '🏆', category: 'AI Intelligence' },
  { path: '/ad-brief-generator', name: 'Ad Brief', emoji: '📢', category: 'Ad Creative & Marketing' },
  { path: '/ad-copy-generator', name: 'Ad Copy', emoji: '✍️', category: 'Ad Creative & Marketing' },
  { path: '/campaign-strategy', name: 'Campaign Strategy', emoji: '🗺️', category: 'Ad Creative & Marketing' },
  { path: '/landing-page-copy', name: 'Landing Page Copy', emoji: '🖥️', category: 'Ad Creative & Marketing' },
  { path: '/ad-roi-calculator', name: 'Ad ROI Calculator', emoji: '📉', category: 'Ad Creative & Marketing' },
  { path: '/ad-specs-guide', name: 'Ad Specs Guide', emoji: '📐', category: 'Ad Creative & Marketing' },
  { path: '/competitor-angles', name: 'Competitor Angles', emoji: '🎯', category: 'Ad Creative & Marketing' },
  { path: '/command-center', name: 'Command Center', emoji: '🖥️', category: 'Agency Operations' },
  { path: '/onboarding-portal', name: 'Onboarding Portal', emoji: '🚪', category: 'Agency Operations' },
  { path: '/scope-change', name: 'Scope Change', emoji: '📋', category: 'Agency Operations' },
  { path: '/productize-services', name: 'Productize Services', emoji: '📦', category: 'Agency Operations' },
  { path: '/post-mortem', name: 'Post-Mortem', emoji: '🔎', category: 'Agency Operations' },
  { path: '/client-report', name: 'Client Report', emoji: '📊', category: 'Agency Operations' },
  { path: '/micro-crm', name: 'Micro-CRM', emoji: '🔄', category: 'Revenue & Growth' },
  { path: '/service-configurator', name: 'Service Configurator', emoji: '⚙️', category: 'Revenue & Growth' },
  { path: '/revenue-goal', name: 'Revenue Goal', emoji: '🎯', category: 'Revenue & Growth' },
  { path: '/revenue-diversification', name: 'Revenue Diversification', emoji: '🥧', category: 'Revenue & Growth' },
  { path: '/win-back-campaigns', name: 'Win-Back Campaigns', emoji: '📧', category: 'Revenue & Growth' },
  { path: '/content-planner', name: 'Content Planner', emoji: '📆', category: 'Authority Building' },
  { path: '/social-proof-manager', name: 'Social Proof', emoji: '🌟', category: 'Authority Building' },
  { path: '/business-scorecard', name: 'Business Scorecard', emoji: '💯', category: 'Authority Building' },
  { path: '/website-audit', name: 'Website Audit', emoji: '🔍', category: 'Authority Building' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet', emoji: '🧲', category: 'Authority Building' },
]

export default function RelatedTools({ currentPath, category, maxShow = 3 }) {
  const related = allTools
    .filter(t => t.path !== currentPath)
    .filter(t => t.category === category)
    .slice(0, maxShow)

  // If not enough in same category, fill with random others
  if (related.length < maxShow) {
    const others = allTools
      .filter(t => t.path !== currentPath && t.category !== category)
      .sort(() => Math.random() - 0.5)
      .slice(0, maxShow - related.length)
    related.push(...others)
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
        Related Tools
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map(tool => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{tool.emoji}</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{tool.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tool.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
