export const NICHES = [
  'Marketing Agency',
  'SaaS',
  'E-commerce',
  'Coaching',
  'Real Estate',
  'Fitness',
  'Food & Restaurant',
  'Tech & Software',
  'Healthcare',
  'Education',
  'Beauty & Skincare',
  'Finance & Investing',
  'Travel',
  'Photography',
  'Legal Services',
];

export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: 'IG' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2EA', icon: 'TT' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: 'YT' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'LI' },
  { id: 'twitter', name: 'Twitter/X', color: '#9ca3af', icon: 'X' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'FB' },
];

export const GOALS = [
  'Brand Awareness',
  'Lead Generation',
  'Community Building',
  'Sales',
  'Education',
];

export const FREQUENCIES = [
  { id: '3x-daily', label: '1-3x Daily', postsPerWeek: 14 },
  { id: 'daily', label: 'Daily', postsPerWeek: 7 },
  { id: '3-5x-week', label: '3-5x / Week', postsPerWeek: 4 },
  { id: 'weekly', label: 'Weekly', postsPerWeek: 1 },
];

export const VOICES = ['Professional', 'Casual', 'Bold', 'Educational', 'Fun'];

export const CONTENT_TYPES = [
  { id: 'carousel', label: 'Carousel', emoji: '\u{1F5BC}' },
  { id: 'reel', label: 'Reel/Short', emoji: '\u{1F3AC}' },
  { id: 'story', label: 'Story', emoji: '\u{1F4F1}' },
  { id: 'thread', label: 'Thread', emoji: '\u{1F9F5}' },
  { id: 'blog', label: 'Blog Post', emoji: '\u{1F4DD}' },
  { id: 'poll', label: 'Poll', emoji: '\u{1F4CA}' },
  { id: 'bts', label: 'Behind-the-Scenes', emoji: '\u{1F3AD}' },
  { id: 'tutorial', label: 'Tutorial', emoji: '\u{1F393}' },
  { id: 'testimonial', label: 'Testimonial', emoji: '\u{2B50}' },
  { id: 'ugc', label: 'User-Generated', emoji: '\u{1F91D}' },
  { id: 'trending', label: 'Trending', emoji: '\u{1F525}' },
];

export const CONTENT_PILLARS = {
  'Marketing Agency': ['Case Studies & Results', 'Marketing Tips & Hacks', 'Industry Trends', 'Client Success Stories', 'Agency Culture'],
  'SaaS': ['Product Updates & Features', 'User Tips & Tutorials', 'Industry Insights', 'Customer Success', 'Behind the Code'],
  'E-commerce': ['Product Showcases', 'Customer Reviews', 'Styling/Usage Tips', 'Behind the Brand', 'Deals & Promotions'],
  'Coaching': ['Mindset & Motivation', 'Quick Tips & Strategies', 'Client Transformations', 'Personal Story', 'Free Resources'],
  'Real Estate': ['Property Showcases', 'Market Updates', 'Home Buying Tips', 'Neighborhood Guides', 'Client Wins'],
  'Fitness': ['Workout Demos', 'Nutrition Tips', 'Transformation Stories', 'Myth Busting', 'Daily Motivation'],
  'Food & Restaurant': ['Recipe Reveals', 'Chef Secrets', 'Menu Highlights', 'Kitchen BTS', 'Customer Favorites'],
  'Tech & Software': ['Tech Tutorials', 'Product Reviews', 'Industry News', 'Dev Tips & Tricks', 'Innovation Spotlight'],
  'Healthcare': ['Health Tips', 'Myth vs Fact', 'Patient Stories', 'Wellness Routines', 'Expert Insights'],
  'Education': ['Quick Lessons', 'Study Tips', 'Student Success', 'Resource Shares', 'Expert Q&A'],
  'Beauty & Skincare': ['Tutorials & How-To', 'Product Reviews', 'Skin Science', 'Before & After', 'Routine Shares'],
  'Finance & Investing': ['Money Tips', 'Market Insights', 'Beginner Guides', 'Success Stories', 'Myth Busting'],
  'Travel': ['Destination Guides', 'Travel Hacks', 'Hidden Gems', 'Packing Tips', 'Trip Recaps'],
  'Photography': ['Photo Tips', 'Editing Tutorials', 'Gear Reviews', 'BTS Shoots', 'Client Galleries'],
  'Legal Services': ['Legal Tips', 'Common Mistakes', 'Case Studies', 'FAQ Answers', 'Industry Updates'],
};

export const PILLAR_DISTRIBUTION = {
  education: 0.30,
  entertainment: 0.20,
  engagement: 0.20,
  promotion: 0.20,
  personal: 0.10,
};

export const PILLAR_CATEGORIES = ['education', 'entertainment', 'engagement', 'promotion', 'personal'];

const PLATFORM_CONTENT_TYPES = {
  instagram: ['carousel', 'reel', 'story', 'poll', 'bts', 'tutorial', 'testimonial', 'ugc', 'trending'],
  tiktok: ['reel', 'tutorial', 'bts', 'trending', 'poll', 'ugc', 'testimonial'],
  youtube: ['reel', 'tutorial', 'blog', 'bts', 'testimonial', 'trending'],
  linkedin: ['carousel', 'thread', 'blog', 'poll', 'testimonial', 'tutorial'],
  twitter: ['thread', 'poll', 'trending', 'testimonial', 'tutorial'],
  facebook: ['carousel', 'reel', 'story', 'poll', 'blog', 'bts', 'testimonial', 'ugc', 'trending'],
};

const POSTING_TIMES = {
  instagram: ['7:00 AM', '12:00 PM', '5:00 PM', '8:00 PM'],
  tiktok: ['9:00 AM', '12:00 PM', '3:00 PM', '7:00 PM'],
  youtube: ['2:00 PM', '4:00 PM', '6:00 PM'],
  linkedin: ['7:30 AM', '10:00 AM', '12:00 PM', '5:30 PM'],
  twitter: ['8:00 AM', '12:00 PM', '5:00 PM', '9:00 PM'],
  facebook: ['9:00 AM', '1:00 PM', '4:00 PM', '7:00 PM'],
};

// 200+ content idea templates organized by pillar category and niche patterns
const CONTENT_IDEAS = {
  education: [
    { hook: '5 {niche} mistakes you\'re making right now', body: 'Break down common mistakes in your field. Provide actionable fixes for each one. End with encouragement.', type: 'carousel' },
    { hook: 'The ultimate guide to {topic} in 2026', body: 'Comprehensive walkthrough of a key topic. Include step-by-step instructions and pro tips.', type: 'blog' },
    { hook: 'How to {action} in under 5 minutes', body: 'Quick tutorial showing a simplified process. Focus on efficiency and quick wins.', type: 'reel' },
    { hook: 'What nobody tells you about {topic}', body: 'Share insider knowledge. Reveal hidden truths and provide context for why they matter.', type: 'thread' },
    { hook: '{Number} tools I use every single day', body: 'Showcase your daily toolkit. Explain why each tool matters and how you use it.', type: 'carousel' },
    { hook: 'Stop doing {old way}. Start doing {new way}', body: 'Compare outdated vs modern approaches. Show the transformation with examples.', type: 'reel' },
    { hook: 'The {topic} cheat sheet you need to save', body: 'Create a visually appealing reference guide. Make it saveable and shareable.', type: 'carousel' },
    { hook: 'I studied 100 {things}. Here\'s what I found', body: 'Data-driven insights from your research. Present findings in an engaging way.', type: 'thread' },
    { hook: 'The beginner\'s roadmap to {outcome}', body: 'Step-by-step path from zero to goal. Include milestones and realistic timelines.', type: 'carousel' },
    { hook: 'This one {thing} changed everything for me', body: 'Share a pivotal discovery. Explain the before/after and how viewers can apply it.', type: 'reel' },
    { hook: '{Topic} explained in 60 seconds', body: 'Rapid-fire explanation of a concept. Use visuals and analogies to simplify.', type: 'reel' },
    { hook: 'The {niche} terminology glossary', body: 'Define key terms in your industry. Help beginners understand jargon.', type: 'carousel' },
    { hook: 'How {successful person/company} does {thing}', body: 'Analyze successful strategies from leaders. Extract actionable lessons.', type: 'thread' },
    { hook: 'Do this BEFORE you {common action}', body: 'Preparation steps people skip. Show why the prep work matters.', type: 'reel' },
    { hook: 'The {topic} framework that gets results', body: 'Share a proprietary or proven framework. Walk through each step with examples.', type: 'carousel' },
    { hook: '3 free resources to level up your {skill}', body: 'Curate valuable free resources. Briefly review each and explain who they benefit.', type: 'carousel' },
    { hook: '{Topic} trends to watch in 2026', body: 'Forward-looking analysis of industry trends. Help audience prepare for changes.', type: 'thread' },
    { hook: 'The truth about {common myth}', body: 'Debunk a popular misconception. Provide evidence and expert perspective.', type: 'reel' },
    { hook: 'How to read a {industry document} like a pro', body: 'Break down how to analyze key documents. Point out what matters and what to ignore.', type: 'tutorial' },
    { hook: 'I asked 50 experts their #1 {topic} tip', body: 'Compilation of expert advice. Add your own commentary and rank the tips.', type: 'carousel' },
    { hook: '{Topic} 101: Everything you need to know', body: 'Comprehensive beginner guide. Cover fundamentals with clear explanations.', type: 'blog' },
    { hook: 'The science behind {common practice}', body: 'Research-backed explanation of why something works. Cite studies and data.', type: 'thread' },
    { hook: 'How to {skill} with zero experience', body: 'Guide for absolute beginners. Remove intimidation, build confidence step by step.', type: 'tutorial' },
    { hook: '{Number} signs you\'re ready to {next level action}', body: 'Help audience assess readiness. Provide guidance for moving forward.', type: 'carousel' },
  ],
  entertainment: [
    { hook: 'POV: You\'re a {niche} professional at 3AM', body: 'Relatable humor about your industry. Use trending audio and visual comedy.', type: 'reel' },
    { hook: 'Types of {niche} clients as {pop culture}', body: 'Fun comparison content. Match client archetypes to popular characters.', type: 'reel' },
    { hook: 'When someone says "{common misconception}"', body: 'Reaction-style content to industry misconceptions. Educational but funny.', type: 'reel' },
    { hook: 'Rating {things in your niche} from 1-10', body: 'Review and rate things in your field. Include hot takes for engagement.', type: 'reel' },
    { hook: 'Things I wish I knew when I started in {niche}', body: 'Nostalgic reflection on your journey. Mix humor with genuine advice.', type: 'carousel' },
    { hook: 'The {niche} professional starter pack', body: 'Visual meme-style content. Show relatable items/traits of people in your field.', type: 'carousel' },
    { hook: 'Day in my life as a {role}', body: 'DITL content showing your routine. Mix work and personal for relatability.', type: 'reel' },
    { hook: 'Expectation vs Reality: {niche}', body: 'Split-screen or before/after showing expectations vs truth. Humorous and relatable.', type: 'reel' },
    { hook: 'If {niche} professionals were honest...', body: 'Brutally honest commentary about your industry. Comedy meets truth.', type: 'reel' },
    { hook: 'This or That: {niche} edition', body: 'Interactive choice-based content. Let audience debate in comments.', type: 'story' },
    { hook: 'The stages of {common process} in {niche}', body: 'Walk through emotional stages of a process. Relatable progression.', type: 'carousel' },
    { hook: 'Unpopular {niche} opinions \u{1F525}', body: 'Share controversial but valid perspectives. Invite debate.', type: 'thread' },
    { hook: 'Things that give {niche} professionals anxiety', body: 'Relatable anxiety triggers in your field. Funny but validating.', type: 'reel' },
    { hook: '{Niche} professional red flags vs green flags', body: 'Compare warning signs vs positive indicators. Help audience identify quality.', type: 'carousel' },
    { hook: 'Recreating {viral trend} but make it {niche}', body: 'Put your industry spin on a trending format. Stay current and relevant.', type: 'reel' },
    { hook: 'The {niche} iceberg explained', body: 'Layered content from surface-level to deep knowledge. Visually engaging.', type: 'carousel' },
    { hook: 'Speed round: {niche} edition', body: 'Rapid-fire answers to common questions. Fast-paced and engaging.', type: 'reel' },
    { hook: 'Things only {niche} people understand', body: 'Inside jokes and shared experiences. Build community through relatability.', type: 'reel' },
    { hook: 'Plot twist in my {niche} career', body: 'Story-driven content about unexpected turns. Build narrative tension.', type: 'reel' },
    { hook: '{Niche} bingo card', body: 'Create a bingo card of common experiences. Interactive and shareable.', type: 'carousel' },
  ],
  engagement: [
    { hook: 'What\'s your biggest {niche} challenge right now?', body: 'Open-ended question to understand audience pain points. Respond to comments.', type: 'poll' },
    { hook: 'Agree or disagree: {controversial statement}', body: 'Debate-style post. Take a stance and invite discussion.', type: 'poll' },
    { hook: 'Drop a \u{1F525} if you\'ve ever {relatable experience}', body: 'Low-barrier engagement prompt. Validate shared experiences.', type: 'story' },
    { hook: 'Caption this {niche image}', body: 'Share an interesting or funny image. Let audience get creative.', type: 'poll' },
    { hook: 'Hot take: {opinion about niche}', body: 'Share a bold opinion. Welcome different perspectives in comments.', type: 'thread' },
    { hook: 'Fill in the blank: The best part of {niche} is ___', body: 'Interactive fill-in-the-blank. Easy engagement, reveals audience values.', type: 'story' },
    { hook: 'Which would you choose? Option A vs Option B', body: 'Binary choice content. Use visuals and explain pros/cons of each.', type: 'poll' },
    { hook: 'Share your {niche} win this week! \u{1F3C6}', body: 'Community celebration post. Highlight and celebrate audience achievements.', type: 'story' },
    { hook: 'Ask me anything about {topic}', body: 'Q&A session. Respond with expertise and personality. Save for future content.', type: 'story' },
    { hook: 'What\'s the worst {niche} advice you\'ve received?', body: 'Reverse advice sharing. Bond over bad experiences and correct misinformation.', type: 'thread' },
    { hook: 'Tag someone who needs to hear this', body: 'Create highly shareable content with a valuable insight.', type: 'carousel' },
    { hook: 'Your {niche} hot take in one sentence. Go.', body: 'Prompt for short, bold responses. Feature best ones later.', type: 'thread' },
    { hook: 'Would you rather: {niche} edition', body: 'Fun hypothetical choices. Get creative with options.', type: 'poll' },
    { hook: 'What does your {niche} setup look like?', body: 'Invite audience to share their workspace/setup. Build community.', type: 'story' },
    { hook: 'Rate my {niche thing} and I\'ll rate yours', body: 'Mutual feedback exchange. Drives comments and relationships.', type: 'reel' },
    { hook: 'Confession time: {vulnerable admission about niche}', body: 'Vulnerable sharing that invites others to open up. Build trust.', type: 'thread' },
    { hook: 'Two truths and a lie: {niche} edition', body: 'Game-format content. Encourage guessing in comments.', type: 'carousel' },
    { hook: 'If you could change ONE thing about {industry}...', body: 'Invite constructive criticism. Show you value diverse opinions.', type: 'poll' },
    { hook: 'Describe your {niche} journey in 3 emojis', body: 'Ultra-simple engagement prompt. Fun and personal.', type: 'story' },
    { hook: 'Storytime: {intriguing scenario in niche}', body: 'Tell a captivating story. End with a question to keep discussion going.', type: 'reel' },
  ],
  promotion: [
    { hook: 'How we helped {client type} achieve {result}', body: 'Case study format. Show the problem, solution, and measurable results.', type: 'carousel' },
    { hook: 'Why {number}+ {clients} trust us with their {need}', body: 'Social proof content. Highlight numbers, testimonials, and track record.', type: 'testimonial' },
    { hook: 'Here\'s exactly what working with us looks like', body: 'Walk through your process/experience. Remove unknowns and build confidence.', type: 'reel' },
    { hook: 'Client spotlight: {name/type}\'s transformation', body: 'Feature a successful client. Show before/after and their testimonial.', type: 'testimonial' },
    { hook: 'The ROI of {your service}: Real numbers', body: 'Data-driven proof of value. Use real metrics and percentages.', type: 'carousel' },
    { hook: 'New {product/service/feature} just dropped! \u{1F680}', body: 'Launch announcement. Highlight key features, benefits, and how to get it.', type: 'reel' },
    { hook: '{Number} reasons people switch to {your solution}', body: 'Competitive comparison without being negative. Focus on your unique value.', type: 'carousel' },
    { hook: 'What our clients are saying...', body: 'Testimonial compilation. Use video or quote graphics for maximum impact.', type: 'testimonial' },
    { hook: 'Before vs After: {your service} in action', body: 'Visual transformation showing your impact. Quantify where possible.', type: 'carousel' },
    { hook: 'We just hit {milestone}! Here\'s how', body: 'Celebrate business achievements. Share the journey and thank your community.', type: 'reel' },
    { hook: 'Limited spots available for {offer}', body: 'Scarcity-driven promotion. Be genuine about availability.', type: 'story' },
    { hook: 'The {your solution} starter guide', body: 'Introductory content that naturally leads to your offering.', type: 'tutorial' },
    { hook: 'Behind the scenes of our latest {project}', body: 'Show your work process. Demonstrate expertise and care.', type: 'bts' },
    { hook: 'Free {resource} to help you {achieve goal}', body: 'Lead magnet promotion. Provide genuine value that showcases your expertise.', type: 'carousel' },
    { hook: 'How {service} works in 60 seconds', body: 'Quick explainer of your offering. Make it simple and compelling.', type: 'reel' },
    { hook: 'DM us "{keyword}" to get {freebie}', body: 'Direct response promotion. Offer genuine value for engagement.', type: 'story' },
    { hook: 'The problem with {alternative} (and our solution)', body: 'Position against alternatives. Focus on solving real pain points.', type: 'thread' },
    { hook: 'Client results that speak for themselves', body: 'Let results do the talking. Minimal commentary, maximum proof.', type: 'ugc' },
    { hook: 'What makes us different from every other {competitor type}', body: 'Unique value proposition content. Be specific and authentic.', type: 'carousel' },
    { hook: 'Your {outcome} is {time period} away. Here\'s the plan.', body: 'Paint a vision of success. Connect to your offering as the vehicle.', type: 'thread' },
  ],
  personal: [
    { hook: 'The real reason I started this {business/journey}', body: 'Origin story. Be vulnerable and connect emotionally with your audience.', type: 'reel' },
    { hook: 'A day in my life as a {role}', body: 'Behind-the-scenes daily content. Show the real, unfiltered version.', type: 'bts' },
    { hook: 'My biggest failure in {niche} (and what it taught me)', body: 'Failure story with lessons. Show growth and resilience.', type: 'thread' },
    { hook: 'Things I\'ve learned after {time} in {niche}', body: 'Reflective wisdom-sharing. Combine practical and philosophical insights.', type: 'carousel' },
    { hook: 'Introducing the team behind {brand}', body: 'Team spotlight content. Humanize your brand and show culture.', type: 'bts' },
    { hook: 'The moment that changed my career forever', body: 'Pivotal story. Build narrative tension and deliver a meaningful takeaway.', type: 'reel' },
    { hook: 'Honest thoughts on the state of {industry}', body: 'Thoughtful industry commentary. Share genuine perspective.', type: 'thread' },
    { hook: 'Monday motivation: what\'s driving me this week', body: 'Weekly motivation post. Share goals and invite audience to join.', type: 'story' },
    { hook: 'Workspace tour / Setup reveal', body: 'Show your physical workspace. Share tools and organization tips.', type: 'reel' },
    { hook: 'The books/podcasts that shaped my {niche} career', body: 'Resource recommendations with personal context. Explain why each mattered.', type: 'carousel' },
    { hook: 'Reflecting on {time period} of {doing thing}', body: 'Milestone reflection. Share growth, challenges, and gratitude.', type: 'carousel' },
    { hook: 'What I\'d tell my younger self about {niche}', body: 'Advice to past self. Relatable and inspirational.', type: 'reel' },
    { hook: 'An honest update on where things stand', body: 'Transparent business/life update. Build trust through openness.', type: 'thread' },
    { hook: 'Weekend reset routine for {niche} professionals', body: 'Show how you recharge. Promote work-life balance.', type: 'story' },
    { hook: 'My morning routine that sets me up for success', body: 'Routine content that connects to productivity and wellbeing.', type: 'reel' },
    { hook: 'The {niche} community means everything to me', body: 'Gratitude post. Celebrate your community and their impact.', type: 'carousel' },
  ],
};

const HASHTAG_LIBRARY = {
  'Marketing Agency': ['#MarketingTips', '#DigitalMarketing', '#SocialMediaMarketing', '#ContentMarketing', '#MarketingStrategy', '#GrowthHacking', '#AgencyLife', '#BrandStrategy', '#MarketingAgency', '#BusinessGrowth'],
  'SaaS': ['#SaaS', '#TechStartup', '#ProductLed', '#B2BSaaS', '#StartupLife', '#SaaSGrowth', '#CloudSoftware', '#TechTips', '#Innovation', '#ProductManagement'],
  'E-commerce': ['#Ecommerce', '#OnlineShopping', '#ShopSmall', '#EcommerceTips', '#DTC', '#RetailTherapy', '#SmallBusiness', '#OnlineStore', '#ShopNow', '#EcommerceGrowth'],
  'Coaching': ['#CoachingTips', '#LifeCoach', '#BusinessCoach', '#Mindset', '#PersonalDevelopment', '#GrowthMindset', '#CoachingBusiness', '#Transformation', '#GoalSetting', '#SuccessMindset'],
  'Real Estate': ['#RealEstate', '#Realtor', '#HomeForSale', '#RealEstateAgent', '#PropertyInvesting', '#FirstTimeHomeBuyer', '#HousingMarket', '#DreamHome', '#RealEstateLife', '#JustListed'],
  'Fitness': ['#FitnessMotivation', '#WorkoutTips', '#FitLife', '#GymLife', '#HealthyLifestyle', '#FitnessJourney', '#PersonalTrainer', '#FitFam', '#WorkoutMotivation', '#StrengthTraining'],
  'Food & Restaurant': ['#Foodie', '#FoodPhotography', '#RestaurantLife', '#ChefLife', '#FoodBlogger', '#InstaFood', '#Delicious', '#FoodLovers', '#RecipeOfTheDay', '#EatLocal'],
  'Tech & Software': ['#TechTips', '#Programming', '#WebDev', '#CodingLife', '#TechNews', '#Innovation', '#SoftwareDevelopment', '#AI', '#Automation', '#FutureTech'],
  'Healthcare': ['#HealthTips', '#Wellness', '#HealthcareHeroes', '#MedicalTips', '#HealthyLiving', '#PatientCare', '#HealthAwareness', '#WellnessJourney', '#MentalHealth', '#SelfCare'],
  'Education': ['#Education', '#Learning', '#TeacherLife', '#EdTech', '#StudyTips', '#OnlineLearning', '#StudentLife', '#KnowledgeIsPower', '#LifelongLearning', '#EduTech'],
  'Beauty & Skincare': ['#BeautyTips', '#Skincare', '#SkincareRoutine', '#BeautyBlogger', '#GlowUp', '#NaturalBeauty', '#MakeupTutorial', '#SelfCare', '#BeautySecrets', '#CleanBeauty'],
  'Finance & Investing': ['#FinanceTips', '#Investing', '#PersonalFinance', '#WealthBuilding', '#MoneyTips', '#FinancialFreedom', '#StockMarket', '#BudgetTips', '#PassiveIncome', '#MoneyMindset'],
  'Travel': ['#TravelGram', '#Wanderlust', '#TravelTips', '#ExploreMore', '#TravelBlogger', '#BucketList', '#Adventure', '#TravelPhotography', '#Vacation', '#HiddenGems'],
  'Photography': ['#Photography', '#PhotoOfTheDay', '#PhotographyTips', '#NikonOrCanon', '#LightRoom', '#PhotoEditing', '#PortraitPhotography', '#StreetPhotography', '#VisualStorytelling', '#CameraLife'],
  'Legal Services': ['#LegalTips', '#LawFirm', '#Attorney', '#LegalAdvice', '#KnowYourRights', '#LawyerLife', '#BusinessLaw', '#LegalHelp', '#Justice', '#LawAndOrder'],
};

const CTA_LIBRARY = [
  'Save this for later!',
  'Share with someone who needs this.',
  'Drop a comment with your thoughts!',
  'Follow for more tips like this.',
  'Link in bio for more details.',
  'DM us to learn more.',
  'Tag a friend who needs to see this!',
  'What would you add to this list?',
  'Double tap if you agree!',
  'Turn on notifications so you never miss a post.',
  'Visit the link in bio to get started.',
  'Leave your favorite tip in the comments!',
  'Bookmark this post for reference.',
  'Reply with your biggest takeaway.',
  'Check out our latest resource - link in bio.',
];

export function generateContentCalendar(config) {
  const { niche, platforms, goals, frequencies, voice } = config;
  const pillars = CONTENT_PILLARS[niche] || CONTENT_PILLARS['Marketing Agency'];
  const pillarCategories = PILLAR_CATEGORIES;

  // Calculate total posts needed across 30 days
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const posts = [];
  const usedIdeas = new Set();
  let lastContentType = '';

  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    const dayOfWeek = currentDate.getDay();

    // Determine which platform posts today based on frequency
    for (const platformId of platforms) {
      const freq = frequencies[platformId] || 'daily';
      const freqData = FREQUENCIES.find(f => f.id === freq);
      if (!freqData) continue;

      // Determine if this platform posts today
      const postsPerWeek = freqData.postsPerWeek;
      let shouldPost = false;

      if (postsPerWeek >= 7) {
        shouldPost = true;
      } else if (postsPerWeek >= 4) {
        shouldPost = dayOfWeek !== 0 && dayOfWeek !== 6; // weekdays
        if (postsPerWeek === 4 && dayOfWeek === 3) shouldPost = false; // skip wed for 4x
      } else if (postsPerWeek >= 1) {
        shouldPost = dayOfWeek === 2; // Tuesday for weekly
      }

      if (!shouldPost) continue;

      // Select pillar category based on distribution
      const pillarRoll = Math.random();
      let pillarCategory;
      let cumulative = 0;
      for (const [cat, dist] of Object.entries(PILLAR_DISTRIBUTION)) {
        cumulative += dist;
        if (pillarRoll <= cumulative) {
          pillarCategory = cat;
          break;
        }
      }
      if (!pillarCategory) pillarCategory = 'education';

      // Get content ideas for this category
      const categoryIdeas = CONTENT_IDEAS[pillarCategory] || CONTENT_IDEAS.education;

      // Filter for platform-compatible content types
      const platformTypes = PLATFORM_CONTENT_TYPES[platformId] || PLATFORM_CONTENT_TYPES.instagram;

      const compatibleIdeas = categoryIdeas.filter(
        idea => platformTypes.includes(idea.type) && idea.type !== lastContentType
      );

      // Pick a random idea
      const availableIdeas = compatibleIdeas.length > 0 ? compatibleIdeas : categoryIdeas;
      let selectedIdea;
      let attempts = 0;
      do {
        selectedIdea = availableIdeas[Math.floor(Math.random() * availableIdeas.length)];
        attempts++;
      } while (usedIdeas.has(`${day}-${platformId}-${selectedIdea.hook}`) && attempts < 20);

      usedIdeas.add(`${day}-${platformId}-${selectedIdea.hook}`);
      lastContentType = selectedIdea.type;

      // Customize idea with niche context
      const nicheHashtags = HASHTAG_LIBRARY[niche] || HASHTAG_LIBRARY['Marketing Agency'];
      const selectedHashtags = shuffleArray([...nicheHashtags]).slice(0, 5 + Math.floor(Math.random() * 5));

      // Select best posting time for platform
      const times = POSTING_TIMES[platformId] || POSTING_TIMES.instagram;
      const bestTime = times[Math.floor(Math.random() * times.length)];

      // Select CTA
      const cta = CTA_LIBRARY[Math.floor(Math.random() * CTA_LIBRARY.length)];

      // Map pillar category to actual niche pillar name
      const pillarIndex = pillarCategories.indexOf(pillarCategory);
      const pillarName = pillars[pillarIndex] || pillars[0];

      const contentType = CONTENT_TYPES.find(ct => ct.id === selectedIdea.type) || CONTENT_TYPES[0];

      // Replace template variables
      const customizedHook = customizeTemplate(selectedIdea.hook, niche, pillars);
      const customizedBody = customizeTemplate(selectedIdea.body, niche, pillars);

      posts.push({
        id: `post-${day}-${platformId}-${Math.random().toString(36).substr(2, 9)}`,
        day,
        date: currentDate.toISOString().split('T')[0],
        dateObj: new Date(currentDate),
        platform: platformId,
        contentType: contentType,
        pillarCategory,
        pillarName,
        hook: customizedHook,
        body: customizedBody,
        hashtags: selectedHashtags,
        bestTime,
        cta,
        voice,
      });
    }
  }

  return {
    posts,
    pillars,
    startDate: startDate.toISOString().split('T')[0],
    niche,
    platforms,
    goals,
    voice,
  };
}

function customizeTemplate(template, niche, pillars) {
  const nicheTopics = {
    'Marketing Agency': { topic: 'digital marketing', action: 'scale your campaigns', things: 'ad campaigns', role: 'marketer' },
    'SaaS': { topic: 'product-led growth', action: 'reduce churn', things: 'onboarding flows', role: 'SaaS founder' },
    'E-commerce': { topic: 'conversion optimization', action: 'boost sales', things: 'product pages', role: 'store owner' },
    'Coaching': { topic: 'client transformation', action: 'grow your practice', things: 'coaching programs', role: 'coach' },
    'Real Estate': { topic: 'property investing', action: 'close more deals', things: 'listings', role: 'real estate agent' },
    'Fitness': { topic: 'training programming', action: 'build muscle', things: 'workout plans', role: 'fitness coach' },
    'Food & Restaurant': { topic: 'menu development', action: 'elevate your dishes', things: 'recipes', role: 'chef' },
    'Tech & Software': { topic: 'software architecture', action: 'ship faster', things: 'code repos', role: 'developer' },
    'Healthcare': { topic: 'patient wellness', action: 'improve outcomes', things: 'treatment plans', role: 'healthcare provider' },
    'Education': { topic: 'student engagement', action: 'master any subject', things: 'lesson plans', role: 'educator' },
    'Beauty & Skincare': { topic: 'skincare routines', action: 'achieve glowing skin', things: 'products', role: 'beauty expert' },
    'Finance & Investing': { topic: 'wealth building', action: 'grow your portfolio', things: 'investment strategies', role: 'financial advisor' },
    'Travel': { topic: 'travel planning', action: 'explore like a local', things: 'destinations', role: 'travel creator' },
    'Photography': { topic: 'composition techniques', action: 'capture stunning shots', things: 'photo sessions', role: 'photographer' },
    'Legal Services': { topic: 'legal compliance', action: 'protect your business', things: 'contracts', role: 'attorney' },
  };

  const ctx = nicheTopics[niche] || nicheTopics['Marketing Agency'];

  return template
    .replace(/\{niche\}/gi, niche.toLowerCase())
    .replace(/\{topic\}/gi, ctx.topic)
    .replace(/\{action\}/gi, ctx.action)
    .replace(/\{things\}/gi, ctx.things)
    .replace(/\{role\}/gi, ctx.role)
    .replace(/\{Number\}/g, String(Math.floor(Math.random() * 8) + 3))
    .replace(/\{number\}/g, String(Math.floor(Math.random() * 8) + 3))
    .replace(/\{old way\}/g, 'the old approach')
    .replace(/\{new way\}/g, 'the modern method')
    .replace(/\{time\}/g, `${Math.floor(Math.random() * 5) + 1} years`)
    .replace(/\{time period\}/g, '90 days')
    .replace(/\{outcome\}/g, ctx.topic)
    .replace(/\{skill\}/g, ctx.topic)
    .replace(/\{industry\}/g, niche.toLowerCase())
    .replace(/\{industry document\}/g, `${niche.toLowerCase()} report`)
    .replace(/\{common myth\}/g, `a popular ${niche.toLowerCase()} myth`)
    .replace(/\{common practice\}/g, `a common ${niche.toLowerCase()} practice`)
    .replace(/\{common misconception\}/g, `a misconception about ${niche.toLowerCase()}`)
    .replace(/\{common action\}/g, ctx.action)
    .replace(/\{successful person\/company\}/g, 'top performers')
    .replace(/\{thing\}/g, 'strategy')
    .replace(/\{doing thing\}/g, `working in ${niche.toLowerCase()}`)
    .replace(/\{client type\}/g, `${niche.toLowerCase()} clients`)
    .replace(/\{clients\}/g, 'clients')
    .replace(/\{need\}/g, ctx.topic)
    .replace(/\{product\/service\/feature\}/g, 'service offering')
    .replace(/\{your service\}/g, `our ${niche.toLowerCase()} services`)
    .replace(/\{your solution\}/g, 'our solution')
    .replace(/\{offer\}/g, 'our limited offer')
    .replace(/\{resource\}/g, `${niche.toLowerCase()} guide`)
    .replace(/\{service\}/g, `our ${niche.toLowerCase()} service`)
    .replace(/\{keyword\}/g, 'GUIDE')
    .replace(/\{freebie\}/g, `a free ${niche.toLowerCase()} resource`)
    .replace(/\{alternative\}/g, 'DIY approach')
    .replace(/\{competitor type\}/g, `${niche.toLowerCase()} provider`)
    .replace(/\{business\/journey\}/g, 'business')
    .replace(/\{brand\}/g, 'our brand')
    .replace(/\{project\}/g, 'project')
    .replace(/\{niche image\}/g, `${niche.toLowerCase()} photo`)
    .replace(/\{controversial statement\}/g, `${niche.toLowerCase()} is evolving`)
    .replace(/\{relatable experience\}/g, `struggled with ${ctx.topic}`)
    .replace(/\{opinion about niche\}/g, `${niche.toLowerCase()} is changing fast`)
    .replace(/\{common process\}/g, ctx.topic)
    .replace(/\{pop culture\}/g, 'movie characters')
    .replace(/\{name\/type\}/g, 'a recent client')
    .replace(/\{milestone\}/g, 'a major milestone')
    .replace(/\{vulnerable admission about niche\}/g, `something real about ${niche.toLowerCase()}`)
    .replace(/\{intriguing scenario in niche\}/g, `a wild ${niche.toLowerCase()} experience`)
    .replace(/\{Niche\}/g, niche)
    .replace(/\{next level action\}/g, `take your ${niche.toLowerCase()} to the next level`);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
