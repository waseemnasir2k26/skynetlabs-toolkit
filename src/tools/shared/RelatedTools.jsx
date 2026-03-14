import { Link } from 'react-router-dom'

const allTools = [
  { path: '/proposal-builder', name: 'Proposal Builder', emoji: '📋', category: 'Generator' },
  { path: '/project-tracker', name: 'Project Tracker', emoji: '📈', category: 'Agency Operations' },
  { path: '/client-onboarding', name: 'Client Onboarding', emoji: '🤝', category: 'Agency Operations' },
  { path: '/brief-analyzer', name: 'Brief Analyzer', emoji: '🔍', category: 'AI Intelligence' },
  { path: '/sow-generator', name: 'SOW Generator', emoji: '📝', category: 'AI Intelligence' },
  { path: '/meeting-manager', name: 'Meeting Manager', emoji: '📞', category: 'AI Intelligence' },
  { path: '/subject-line-tester', name: 'Subject Line Tester', emoji: '✉️', category: 'Ad Creative & Marketing' },
  { path: '/email-templates', name: 'Email Templates', emoji: '📧', category: 'Ad Creative & Marketing' },
  { path: '/cold-outreach', name: 'Cold Outreach', emoji: '🎯', category: 'Ad Creative & Marketing' },
  { path: '/onboarding-portal', name: 'Onboarding Portal', emoji: '🚪', category: 'Agency Operations' },
  { path: '/client-report', name: 'Client Report', emoji: '📊', category: 'Agency Operations' },
  { path: '/fiverr-gig-creator', name: 'Fiverr Gig Creator', emoji: '🟢', category: 'Freelancer Tools' },
  { path: '/contract-generator', name: 'Contract Generator', emoji: '📄', category: 'Generator' },
  { path: '/brand-kit-generator', name: 'Brand Kit', emoji: '🎨', category: 'Generator' },
  { path: '/content-planner', name: 'Content Planner', emoji: '📆', category: 'Authority Building' },
  { path: '/social-proof-manager', name: 'Social Proof', emoji: '🌟', category: 'Authority Building' },
  { path: '/business-scorecard', name: 'Business Scorecard', emoji: '💯', category: 'Authority Building' },
  { path: '/website-audit', name: 'Website Audit', emoji: '🔍', category: 'Authority Building' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet', emoji: '🧲', category: 'Authority Building' },
  { path: '/feedback-survey', name: 'Feedback Survey', emoji: '📝', category: 'Authority Building' },
  { path: '/social-calendar', name: 'Social Calendar', emoji: '📱', category: 'Authority Building' },
  { path: '/case-study-generator', name: 'Case Study', emoji: '📋', category: 'Authority Building' },
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
