export const niches = [
  { id: 'webdev', label: 'Web Development', icon: '💻' },
  { id: 'design', label: 'UI/UX Design', icon: '🎨' },
  { id: 'marketing', label: 'Digital Marketing', icon: '📈' },
  { id: 'writing', label: 'Content Writing', icon: '✍️' },
  { id: 'ai', label: 'AI / Automation', icon: '🤖' },
  { id: 'video', label: 'Video Production', icon: '🎬' },
  { id: 'mobile', label: 'Mobile Development', icon: '📱' },
  { id: 'data', label: 'Data Science', icon: '📊' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
  { id: 'consulting', label: 'Business Consulting', icon: '💼' },
]

export const experienceLevels = [
  { id: 'beginner', label: 'Beginner', years: '0-2 years', multiplier: 0.65 },
  { id: 'intermediate', label: 'Intermediate', years: '2-5 years', multiplier: 1.0 },
  { id: 'expert', label: 'Expert', years: '5-10 years', multiplier: 1.5 },
  { id: 'authority', label: 'Authority', years: '10+ years', multiplier: 2.1 },
]

// Market average hourly rates by niche (intermediate level, USD)
export const marketRates = {
  webdev: { low: 60, mid: 100, high: 175, avgProject: 8000, retainerHours: 20 },
  design: { low: 50, mid: 85, high: 150, avgProject: 5000, retainerHours: 15 },
  marketing: { low: 45, mid: 80, high: 150, avgProject: 4000, retainerHours: 20 },
  writing: { low: 35, mid: 65, high: 120, avgProject: 2500, retainerHours: 15 },
  ai: { low: 80, mid: 150, high: 300, avgProject: 15000, retainerHours: 20 },
  video: { low: 50, mid: 90, high: 175, avgProject: 5000, retainerHours: 15 },
  mobile: { low: 65, mid: 110, high: 200, avgProject: 12000, retainerHours: 20 },
  data: { low: 70, mid: 120, high: 225, avgProject: 10000, retainerHours: 20 },
  seo: { low: 40, mid: 75, high: 150, avgProject: 3000, retainerHours: 15 },
  consulting: { low: 75, mid: 150, high: 350, avgProject: 8000, retainerHours: 10 },
}

export const countries = [
  { name: 'United States', taxRate: 30 },
  { name: 'United Kingdom', taxRate: 25 },
  { name: 'Canada', taxRate: 28 },
  { name: 'Australia', taxRate: 30 },
  { name: 'Germany', taxRate: 35 },
  { name: 'France', taxRate: 33 },
  { name: 'Netherlands', taxRate: 30 },
  { name: 'Sweden', taxRate: 35 },
  { name: 'India', taxRate: 20 },
  { name: 'Brazil', taxRate: 22 },
  { name: 'Mexico', taxRate: 25 },
  { name: 'Japan', taxRate: 30 },
  { name: 'South Korea', taxRate: 28 },
  { name: 'Singapore', taxRate: 15 },
  { name: 'UAE', taxRate: 5 },
  { name: 'Other', taxRate: 25 },
]

export const expenseCategories = [
  { id: 'rent', label: 'Office / Co-working', default: 500, icon: '🏢' },
  { id: 'software', label: 'Software & Tools', default: 200, icon: '🛠️' },
  { id: 'insurance', label: 'Health Insurance', default: 400, icon: '🏥' },
  { id: 'internet', label: 'Internet & Phone', default: 100, icon: '📡' },
  { id: 'education', label: 'Courses & Training', default: 100, icon: '📚' },
  { id: 'marketing_expense', label: 'Marketing & Ads', default: 150, icon: '📢' },
  { id: 'accounting', label: 'Accounting & Legal', default: 150, icon: '📋' },
  { id: 'equipment', label: 'Equipment & Hardware', default: 100, icon: '🖥️' },
  { id: 'misc', label: 'Miscellaneous', default: 100, icon: '📦' },
]

export const pricingTips = [
  {
    title: 'Value-Based Pricing',
    tip: "Don't just charge for time. If your work generates $100K for a client, charging $10K is a bargain for them and great for you.",
  },
  {
    title: 'Anchor High',
    tip: 'Always present your premium package first. It makes your standard rate seem like a deal by comparison.',
  },
  {
    title: 'Package Your Services',
    tip: 'Offer 3 tiers (Basic, Standard, Premium). Most clients pick the middle option, which should be your ideal rate.',
  },
  {
    title: 'Raise Rates Annually',
    tip: 'Increase rates 10-20% every year. Existing clients expect it, and new clients never knew your old rates.',
  },
  {
    title: 'Retainers = Stability',
    tip: 'Convert your best project clients into monthly retainers. Predictable income is worth a small discount.',
  },
  {
    title: 'Never Compete on Price',
    tip: "If a client says you're too expensive, they're not your ideal client. Cheap clients are the most demanding.",
  },
]
