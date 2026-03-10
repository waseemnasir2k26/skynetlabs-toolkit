export const SECTION_DEFINITIONS = [
  {
    id: 'clientInfo',
    title: 'Client Information',
    description: 'Basic contact and company details',
    icon: 'user',
    required: true,
  },
  {
    id: 'projectDetails',
    title: 'Project Details',
    description: 'Project scope, goals, and timeline',
    icon: 'briefcase',
    required: true,
  },
  {
    id: 'accessCredentials',
    title: 'Access & Credentials',
    description: 'Login details and platform access',
    icon: 'key',
    required: true,
  },
  {
    id: 'brandAssets',
    title: 'Brand Assets',
    description: 'Logos, colors, fonts, and guidelines',
    icon: 'palette',
    required: true,
  },
  {
    id: 'contentMedia',
    title: 'Content & Media',
    description: 'Company bio, team info, and media files',
    icon: 'image',
    required: false,
  },
  {
    id: 'nda',
    title: 'NDA / Non-Disclosure Agreement',
    description: 'Mutual confidentiality agreement',
    icon: 'shield',
    required: false,
  },
  {
    id: 'serviceAgreement',
    title: 'Service Agreement',
    description: 'Scope, payment terms, and commitment',
    icon: 'file-text',
    required: false,
  },
  {
    id: 'paymentInfo',
    title: 'Payment Information',
    description: 'Billing and payment preferences',
    icon: 'credit-card',
    required: false,
  },
];

export const PROJECT_TYPES = [
  'Website',
  'Web Application',
  'Mobile App',
  'Branding',
  'Marketing',
  'AI Automation',
  'SEO',
  'Social Media Management',
  'E-Commerce',
  'Custom Software',
  'Other',
];

export const BUDGET_RANGES = [
  '$500 - $1,000',
  '$1,000 - $2,500',
  '$2,500 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000+',
];

export const PAYMENT_TERMS = [
  { id: 'milestone', label: 'Milestone-Based', description: 'Pay upon completion of defined milestones' },
  { id: '50-50', label: '50/50 Split', description: '50% upfront, 50% on completion' },
  { id: 'retainer', label: 'Monthly Retainer', description: 'Fixed monthly payment' },
  { id: '30-40-30', label: '30/40/30 Split', description: '30% upfront, 40% midpoint, 30% completion' },
  { id: 'custom', label: 'Custom Schedule', description: 'Define your own payment schedule' },
];

export const NDA_DURATIONS = [
  { value: '1', label: '1 Year' },
  { value: '2', label: '2 Years' },
  { value: '5', label: '5 Years' },
  { value: 'indefinite', label: 'Indefinite' },
];

export const SOCIAL_PLATFORMS = [
  'Facebook', 'Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'Snapchat',
];

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#13b973' },
  { value: 'signed', label: 'Signed', color: '#8b5cf6' },
];
