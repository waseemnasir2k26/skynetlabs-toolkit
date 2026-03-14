/**
 * Single source of truth for all tool definitions.
 *
 * Every component that needs the tool list should import from here
 * instead of maintaining its own copy.
 */

const tools = [
  // Core Tools
  { path: '/proposal-builder', name: 'Proposal & Quote Builder', emoji: '📋', description: 'Build stunning client proposals with live preview and PDF export.', category: 'Generator' },
  { path: '/project-tracker', name: 'Client Project Tracker', emoji: '📈', description: 'Full project management with Kanban, calendar, and client portals.', category: 'Agency Operations' },
  { path: '/client-onboarding', name: 'Client Onboarding & NDA', emoji: '🤝', description: 'Professional onboarding forms with NDA, contracts, and e-signatures.', category: 'Agency Operations' },
  // AI Intelligence
  { path: '/brief-analyzer', name: 'Client Brief Analyzer', emoji: '🔍', description: 'Paste any client brief. Extract deliverables, flag scope creep risks, estimate hours.', category: 'AI Intelligence' },
  { path: '/sow-generator', name: 'SOW Generator', emoji: '📝', description: 'Generate a complete Statement of Work with milestones and payment terms.', category: 'AI Intelligence' },
  { path: '/meeting-manager', name: 'Meeting Lifecycle Manager', emoji: '📞', description: 'Get structured agendas before meetings, action items after.', category: 'AI Intelligence' },
  // Ad Creative & Marketing
  { path: '/subject-line-tester', name: 'Email Subject Line Tester', emoji: '✉️', description: 'Score, A/B compare, and optimize email subject lines with 9-factor analysis.', category: 'Ad Creative & Marketing' },
  { path: '/email-templates', name: 'Email Template Library', emoji: '📧', description: '30+ professional email templates for outreach, sales, and client management.', category: 'Ad Creative & Marketing' },
  { path: '/cold-outreach', name: 'Cold Outreach Sequence Builder', emoji: '🎯', description: 'Build multi-channel outreach campaigns with LinkedIn, email, follow-ups, and A/B testing.', category: 'Ad Creative & Marketing' },
  // Agency Operations
  { path: '/onboarding-portal', name: 'Onboarding Portal', emoji: '🚪', description: 'Branded portal where new clients complete onboarding steps.', category: 'Agency Operations' },
  { path: '/client-report', name: 'Client Report Builder', emoji: '📊', description: 'Drag-and-drop report builder with metrics, tasks, and PDF export.', category: 'Agency Operations' },
  // Freelancer Tools
  { path: '/fiverr-gig-creator', name: 'Fiverr Gig Creator', emoji: '🟢', description: 'Create optimized Fiverr gigs with SEO titles, descriptions, pricing tiers, and FAQ.', category: 'Freelancer Tools' },
  // Generator
  { path: '/contract-generator', name: 'Contract Generator', emoji: '📄', description: 'Generate freelance contracts with a step-by-step wizard and clause library.', category: 'Generator' },
  { path: '/brand-kit-generator', name: 'Brand Kit Generator', emoji: '🎨', description: 'Generate a complete brand kit with colors, typography, and guidelines.', category: 'Generator' },
  // Authority Building
  { path: '/content-planner', name: '90-Day Content Planner', emoji: '📆', description: '90-day content calendar mapped to your sales funnel.', category: 'Authority Building' },
  { path: '/social-proof-manager', name: 'Social Proof Manager', emoji: '🌟', description: 'Collect, organize, and deploy testimonials with embeddable widgets.', category: 'Authority Building' },
  { path: '/business-scorecard', name: 'Business Health Scorecard', emoji: '💯', description: '50-question diagnostic covering every aspect of your freelance business.', category: 'Authority Building' },
  { path: '/website-audit', name: 'Website Conversion Audit', emoji: '🔍', description: '20-point conversion optimization report with fix recommendations.', category: 'Authority Building' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet Factory', emoji: '🧲', description: 'Create a lead magnet AND its landing page in one workflow.', category: 'Authority Building' },
  { path: '/feedback-survey', name: 'Client Feedback Survey Builder', emoji: '📝', description: 'Build custom feedback surveys with ratings, NPS, and text responses.', category: 'Authority Building' },
  { path: '/social-calendar', name: 'Social Media Content Calendar', emoji: '📱', description: 'Plan and schedule content across all platforms with a visual calendar.', category: 'Authority Building' },
  { path: '/case-study-generator', name: 'Case Study Generator', emoji: '📋', description: 'Create professional case studies with the Problem → Solution → Results framework.', category: 'Authority Building' },
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
