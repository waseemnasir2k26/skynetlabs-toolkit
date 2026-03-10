export const INDUSTRIES = [
  'Technology / SaaS',
  'Healthcare',
  'Finance / Banking',
  'E-Commerce / Retail',
  'Manufacturing',
  'Real Estate',
  'Marketing / Advertising',
  'Legal Services',
  'Education',
  'Consulting',
  'Logistics / Supply Chain',
  'Insurance',
  'Hospitality / Travel',
  'Construction',
  'Non-Profit',
  'Other',
]

export const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
]

export const TASK_FREQUENCIES = [
  { label: 'Daily', multiplier: 52 * 5 },
  { label: 'Weekly', multiplier: 52 },
  { label: 'Bi-Weekly', multiplier: 26 },
  { label: 'Monthly', multiplier: 12 },
  { label: 'Quarterly', multiplier: 4 },
]

export const EXAMPLE_TASKS = [
  {
    id: '1',
    name: 'Email Management & Responses',
    hoursPerWeek: 10,
    hourlyCost: 35,
    frequency: 'Weekly',
  },
  {
    id: '2',
    name: 'Data Entry & Processing',
    hoursPerWeek: 8,
    hourlyCost: 28,
    frequency: 'Weekly',
  },
  {
    id: '3',
    name: 'Report Generation',
    hoursPerWeek: 5,
    hourlyCost: 45,
    frequency: 'Weekly',
  },
  {
    id: '4',
    name: 'Customer Support Tickets',
    hoursPerWeek: 15,
    hourlyCost: 30,
    frequency: 'Weekly',
  },
  {
    id: '5',
    name: 'Social Media Scheduling',
    hoursPerWeek: 6,
    hourlyCost: 32,
    frequency: 'Weekly',
  },
]

export const CURRENT_TOOLS = [
  'No automation tools',
  'Basic spreadsheets (Excel/Sheets)',
  'Some workflow tools (Zapier, Make)',
  'CRM with basic automation',
  'Custom scripts / internal tools',
  'Multiple automation platforms',
]
