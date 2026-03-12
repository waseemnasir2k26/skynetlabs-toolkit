/**
 * Single source of truth for all tool definitions.
 *
 * Every component that needs the tool list should import from here
 * instead of maintaining its own copy.
 */

const tools = [
  // Core Tools
  { path: '/proposal-builder', name: 'Proposal & Quote Builder', emoji: '📋', description: 'Build stunning client proposals with live preview and PDF export.', category: 'Generator' },
  { path: '/scope-tracker', name: 'Scope Creep Tracker', emoji: '🎯', description: 'Track scope changes, generate change orders, and protect your profits.', category: 'Agency Operations' },
  { path: '/testimonials', name: 'Testimonial Collector', emoji: '⭐', description: 'Collect, manage, and showcase client testimonials beautifully.', category: 'Authority Building' },
  { path: '/project-tracker', name: 'Client Project Tracker', emoji: '📈', description: 'Full project management with Kanban, calendar, and client portals.', category: 'Agency Operations' },
  { path: '/client-onboarding', name: 'Client Onboarding & NDA', emoji: '🤝', description: 'Professional onboarding forms with NDA, contracts, and e-signatures.', category: 'Agency Operations' },
  // AI Intelligence
  { path: '/brief-analyzer', name: 'Client Brief Analyzer', emoji: '🔍', description: 'Paste any client brief. Extract deliverables, flag scope creep risks, estimate hours.', category: 'AI Intelligence' },
  { path: '/niche-scanner', name: 'Niche Profitability Scanner', emoji: '🔬', description: 'Analyze any freelance niche for demand, rates, competition, and growth.', category: 'AI Intelligence' },
  { path: '/sow-generator', name: 'SOW Generator', emoji: '📝', description: 'Generate a complete Statement of Work with milestones and payment terms.', category: 'AI Intelligence' },
  { path: '/meeting-manager', name: 'Meeting Lifecycle Manager', emoji: '📞', description: 'Get structured agendas before meetings, action items after.', category: 'AI Intelligence' },
  { path: '/positioning-generator', name: 'Competitive Positioning', emoji: '🏆', description: 'Map competitors, find gaps, generate your unique positioning strategy.', category: 'AI Intelligence' },
  // Ad Creative & Marketing
  { path: '/ad-roi-calculator', name: 'Ad ROI Calculator', emoji: '📉', description: 'Show clients their current ad ROI and projected improvements.', category: 'Ad Creative & Marketing' },
  { path: '/competitor-angles', name: 'Competitor Angle Finder', emoji: '🎯', description: 'Generate counter-positioning angles with ad headlines and concepts.', category: 'Ad Creative & Marketing' },
  // Agency Operations
  { path: '/command-center', name: 'Client Command Center', emoji: '🖥️', description: 'Single-screen dashboard for every client, project, and deadline.', category: 'Agency Operations' },
  { path: '/onboarding-portal', name: 'Onboarding Portal', emoji: '🚪', description: 'Branded portal where new clients complete onboarding steps.', category: 'Agency Operations' },
  { path: '/scope-change', name: 'Scope Change System', emoji: '📋', description: 'Log scope changes, calculate cost, generate change requests.', category: 'Agency Operations' },
  { path: '/productize-services', name: 'Service Productizer', emoji: '📦', description: 'Transform custom services into scalable, productized packages.', category: 'Agency Operations' },
  { path: '/post-mortem', name: 'Project Post-Mortem', emoji: '🔎', description: 'Capture wins, failures, and budget vs actual after each project.', category: 'Agency Operations' },
  { path: '/client-report', name: 'Client Report Builder', emoji: '📊', description: 'Drag-and-drop report builder with metrics, tasks, and PDF export.', category: 'Agency Operations' },
  // Revenue & Growth
  { path: '/service-configurator', name: 'Services Configurator', emoji: '⚙️', description: 'Clients build their own custom quote with live price updates.', category: 'Revenue & Growth' },
  { path: '/revenue-goal', name: 'Revenue Goal Planner', emoji: '🎯', description: 'Set your income goal. See exactly how many clients and leads you need.', category: 'Revenue & Growth' },
  { path: '/revenue-diversification', name: 'Revenue Diversification', emoji: '🥧', description: 'Visualize income concentration risk and run what-if scenarios.', category: 'Revenue & Growth' },
  { path: '/win-back-campaigns', name: 'Win-Back Campaigns', emoji: '📧', description: 'Segmented, personalized re-engagement email sequences for past clients.', category: 'Revenue & Growth' },
  // Authority Building
  { path: '/content-planner', name: '90-Day Content Planner', emoji: '📆', description: '90-day content calendar mapped to your sales funnel.', category: 'Authority Building' },
  { path: '/social-proof-manager', name: 'Social Proof Manager', emoji: '🌟', description: 'Collect, organize, and deploy testimonials with embeddable widgets.', category: 'Authority Building' },
  { path: '/business-scorecard', name: 'Business Health Scorecard', emoji: '💯', description: '50-question diagnostic covering every aspect of your freelance business.', category: 'Authority Building' },
  { path: '/website-audit', name: 'Website Conversion Audit', emoji: '🔍', description: '20-point conversion optimization report with fix recommendations.', category: 'Authority Building' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet Factory', emoji: '🧲', description: 'Create a lead magnet AND its landing page in one workflow.', category: 'Authority Building' },
]

/** Total number of tools — useful for badges and stats */
export const TOOL_COUNT = tools.length

/**
 * Slim list for Header navigation (path, name, emoji only).
 * Avoids shipping description/category/gradient data into the header bundle.
 */
export const headerTools = tools.map(({ path, name, emoji }) => ({ path, name, emoji }))

/** Full tool definitions for the landing page and anywhere else that needs all fields */
export default tools
