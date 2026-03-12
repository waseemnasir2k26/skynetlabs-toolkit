import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

const CATEGORIES = [
  { key: 'all', label: 'All Templates' },
  { key: 'outreach', label: 'Outreach' },
  { key: 'client', label: 'Client Management' },
  { key: 'sales', label: 'Sales' },
  { key: 'collections', label: 'Collections' },
  { key: 'networking', label: 'Networking' },
  { key: 'admin', label: 'Admin' },
]

const TONES = [
  { key: 'professional', label: 'Professional' },
  { key: 'friendly', label: 'Friendly' },
  { key: 'casual', label: 'Casual' },
]

function toneGreeting(tone) {
  if (tone === 'casual') return `Hey [CLIENT_NAME],`
  if (tone === 'friendly') return `Hi [CLIENT_NAME],`
  return `Dear [CLIENT_NAME],`
}

function toneClosing(tone) {
  if (tone === 'casual') return `Cheers,\n[YOUR_NAME]`
  if (tone === 'friendly') return `Best regards,\n[YOUR_NAME]`
  return `Kind regards,\n[YOUR_NAME]`
}

function toneLine(tone, professional, friendly, casual) {
  if (tone === 'casual') return casual
  if (tone === 'friendly') return friendly
  return professional
}

const TEMPLATES = [
  // === OUTREACH (5) ===
  {
    id: 'outreach-cold',
    category: 'outreach',
    title: 'Cold Email',
    subject: 'Quick idea for [CLIENT_NAME]\'s [PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I came across your company while researching businesses in your industry, and I noticed an opportunity that I believe could significantly benefit your operations.',
  'I came across your company recently and noticed something that I think could really help your business.',
  'I stumbled across your company and had a quick idea I wanted to share.'
)}

I specialize in [PROJECT_NAME] and have helped similar businesses achieve measurable results, including increased efficiency and revenue growth.

${toneLine(tone,
  'I would welcome the opportunity to discuss how we might collaborate. Would you be available for a brief 15-minute call this week?',
  'I\'d love to chat about how I could help. Would you have 15 minutes this week for a quick call?',
  'Would you be up for a quick 15-min call this week to explore this?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'outreach-followup',
    category: 'outreach',
    title: 'Follow-Up Email',
    subject: 'Following up on my previous message',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I wanted to follow up on the email I sent last week regarding potential collaboration opportunities.',
  'Just wanted to follow up on my previous email about working together.',
  'Bumping this to the top of your inbox - wanted to see if you had a chance to check out my last message.'
)}

I understand you are busy, so I will keep this brief. I have attached a brief case study showing how I helped a similar business achieve a 40% improvement in their [PROJECT_NAME] results.

${toneLine(tone,
  'If this is not the right time, I completely understand. I would appreciate knowing either way so I can follow up appropriately.',
  'No worries if the timing isn\'t right - just let me know and I\'ll check back later.',
  'No pressure at all - just wanted to make sure it didn\'t get lost in the shuffle.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'outreach-intro-request',
    category: 'outreach',
    title: 'Introduction Request',
    subject: 'Could you introduce me to [CLIENT_NAME]?',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I hope this message finds you well. I am reaching out because I noticed you are connected with [CLIENT_NAME] at [PROJECT_NAME], and I believe my services could be a great fit for their current needs.',
  'Hope you\'re doing well! I noticed you know [CLIENT_NAME] at [PROJECT_NAME], and I think what I do could really help them out.',
  'Quick favor to ask - I saw you\'re connected with [CLIENT_NAME] at [PROJECT_NAME].'
)}

I have been working with businesses similar to theirs and have consistently delivered strong results. Rather than reaching out cold, I thought a warm introduction from someone they trust would be more appropriate.

${toneLine(tone,
  'Would you be comfortable making a brief introduction via email? I would be happy to draft the message for you to make it as easy as possible.',
  'Would you be open to making a quick intro? I can draft the email so it\'s super easy for you.',
  'Would you mind connecting us? I can write up the intro so all you\'d need to do is hit forward.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'outreach-partnership',
    category: 'outreach',
    title: 'Partnership Proposal',
    subject: 'Partnership opportunity between our companies',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I have been following [PROJECT_NAME]\'s work and am impressed by what your team has accomplished. I see a compelling opportunity for a strategic partnership between our organizations.',
  'I\'ve been following what [PROJECT_NAME] has been up to and I\'m really impressed. I think there\'s a great opportunity for us to partner up.',
  'Love what you\'re doing at [PROJECT_NAME]! I think we could do some great stuff together.'
)}

Here is what I am envisioning:
- We refer clients to each other for complementary services
- Co-create content that showcases both our expertise
- Offer bundled packages at a competitive rate

${toneLine(tone,
  'I have prepared a brief partnership outline that I would be pleased to share. Could we schedule a call to discuss this further?',
  'I\'ve put together a quick partnership overview I\'d love to share. Can we hop on a call to discuss?',
  'I sketched out some ideas - want to jump on a call this week to chat about it?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'outreach-speaking',
    category: 'outreach',
    title: 'Speaking Inquiry',
    subject: 'Speaking opportunity for your upcoming event',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I recently learned about your upcoming event, [PROJECT_NAME], and I would like to express my interest in being considered as a speaker.',
  'I just heard about [PROJECT_NAME] and would love to be considered as a speaker!',
  'Just saw [PROJECT_NAME] is coming up - I\'d love to throw my hat in the ring to speak!'
)}

I specialize in topics related to digital strategy, automation, and business growth. My previous speaking engagements have received excellent feedback, and I consistently deliver actionable insights that audiences can implement immediately.

Proposed topics include:
- How to automate 80% of your marketing workflow
- Building a scalable freelance business from scratch
- The future of AI-powered business tools

${toneLine(tone,
  'I would be happy to provide references from previous events. Would it be possible to discuss this opportunity further?',
  'Happy to share references from past talks. Would love to chat more about this!',
  'Got plenty of references if you need them. Let me know if you\'re interested!'
)}

${toneClosing(tone)}`,
  },

  // === CLIENT MANAGEMENT (5) ===
  {
    id: 'client-welcome',
    category: 'client',
    title: 'Welcome Email',
    subject: 'Welcome aboard! Let\'s get started on [PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'Thank you for choosing to work with us on [PROJECT_NAME]. We are excited to begin this engagement and are committed to delivering exceptional results.',
  'So excited to officially kick things off on [PROJECT_NAME]! Thank you for trusting us with this project.',
  'Welcome aboard! Stoked to get started on [PROJECT_NAME] with you.'
)}

Here is what happens next:
1. You will receive a project intake questionnaire within 24 hours
2. We will schedule a kickoff call to align on goals and timelines
3. I will set up your project dashboard for real-time progress updates

A few things I will need from your end:
- Brand guidelines and existing assets
- Access credentials for relevant platforms
- Key stakeholder contact information

${toneLine(tone,
  'Please do not hesitate to reach out with any questions. I look forward to a productive collaboration.',
  'Feel free to reach out anytime with questions. Looking forward to working together!',
  'Hit me up anytime with questions. Let\'s make this awesome!'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'client-kickoff',
    category: 'client',
    title: 'Project Kickoff',
    subject: '[PROJECT_NAME] - Kickoff meeting details',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am writing to share the details for our project kickoff meeting for [PROJECT_NAME].',
  'Here are the details for our [PROJECT_NAME] kickoff meeting!',
  'Here\'s the scoop for our kickoff meeting.'
)}

Meeting Details:
- Date: [DATE]
- Duration: 60 minutes
- Agenda: Project goals review, timeline walkthrough, role assignments, Q&A

Please come prepared with:
- Any examples or inspiration you have collected
- Questions about the scope or deliverables
- Availability of key team members for reviews

I have attached the project brief and timeline for your review before the meeting.

${toneClosing(tone)}`,
  },
  {
    id: 'client-milestone',
    category: 'client',
    title: 'Milestone Update',
    subject: '[PROJECT_NAME] - Milestone update: Phase 1 complete',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am pleased to report that we have successfully completed Phase 1 of [PROJECT_NAME].',
  'Great news - we\'ve wrapped up Phase 1 of [PROJECT_NAME]!',
  'Phase 1 is done! Here\'s where we stand.'
)}

Completed deliverables:
- Research and strategy document
- Wireframes and initial mockups
- Content outline and sitemap

Key metrics:
- On schedule: Yes
- Budget status: On track
- Hours used: 45 of 60 allocated

Next steps:
- Your review and feedback on Phase 1 deliverables
- Phase 2 kickoff scheduled for [DATE]
- Milestone payment of [AMOUNT] is now due per our agreement

${toneLine(tone,
  'Please review the attached deliverables and provide feedback at your earliest convenience.',
  'Take a look at the attached deliverables and let me know your thoughts!',
  'Check out the attached stuff and let me know what you think!'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'client-delay',
    category: 'client',
    title: 'Delay Notification',
    subject: '[PROJECT_NAME] - Timeline update',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am writing to inform you of an adjustment to our project timeline for [PROJECT_NAME]. I believe in transparent communication and wanted to address this proactively.',
  'I wanted to give you a heads-up about a timeline adjustment for [PROJECT_NAME]. I always want to be upfront with you.',
  'Quick heads up - we need to adjust the timeline for [PROJECT_NAME] slightly.'
)}

What happened: During the implementation phase, we discovered additional complexity in the integration that requires more thorough testing to ensure quality.

Impact: The delivery date for Phase 2 will shift by approximately one week, from [DATE] to the following week.

What we are doing about it:
- Dedicating additional resources to accelerate the remaining work
- Implementing parallel workflows where possible
- Conducting daily progress reviews to prevent further delays

${toneLine(tone,
  'This adjustment will not affect the overall project quality or the final deadline. I sincerely apologize for any inconvenience and am committed to keeping you informed of our progress.',
  'This won\'t affect the quality of work or our final deadline. Sorry for the inconvenience - I\'ll keep you posted on progress.',
  'The final deadline and quality won\'t be affected. Sorry about this - I\'ll keep you in the loop.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'client-completion',
    category: 'client',
    title: 'Project Completion Notice',
    subject: '[PROJECT_NAME] is complete - Final delivery',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am delighted to inform you that [PROJECT_NAME] has been completed. All deliverables have been finalized and are ready for your review.',
  'Exciting news - [PROJECT_NAME] is all done! Everything is ready for your review.',
  'We did it! [PROJECT_NAME] is wrapped up and ready for you.'
)}

Final deliverables included:
- Complete project files and source code
- Documentation and user guide
- Training materials and walkthrough videos
- 30-day post-launch support plan

Final project summary:
- Total project duration: 8 weeks
- Deliverables completed: All items per scope
- Final payment due: [AMOUNT]

The final invoice is attached. Payment is due within 30 days per our agreement.

${toneLine(tone,
  'It has been a pleasure working with you on this project. I would greatly appreciate a testimonial if you are satisfied with the results. Please do not hesitate to reach out for any future needs.',
  'It\'s been a real pleasure working on this! If you\'re happy with the results, I\'d love a quick testimonial. And of course, I\'m here for any future projects!',
  'Had a blast working on this! Would love a testimonial if you\'re happy. And I\'m always here if you need anything else!'
)}

${toneClosing(tone)}`,
  },

  // === SALES (5) ===
  {
    id: 'sales-proposal-followup',
    category: 'sales',
    title: 'Proposal Follow-Up',
    subject: 'Following up on the [PROJECT_NAME] proposal',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I wanted to follow up on the proposal I sent on [DATE] for [PROJECT_NAME]. I hope you have had a chance to review it.',
  'Just checking in on the [PROJECT_NAME] proposal I sent over on [DATE]. Have you had a chance to look it over?',
  'Wanted to follow up on that proposal I sent for [PROJECT_NAME]. Had a chance to check it out?'
)}

To recap the key highlights:
- Projected ROI of 3x within 6 months
- Phased approach to minimize risk
- Dedicated support throughout the engagement

I am happy to:
- Walk through the proposal in detail over a call
- Adjust the scope or timeline to better fit your needs
- Provide additional case studies or references

${toneLine(tone,
  'The proposal pricing is valid until [DATE]. I would be pleased to schedule a brief call to address any questions you may have.',
  'The pricing in the proposal is good until [DATE]. Want to hop on a quick call to go over any questions?',
  'Pricing holds until [DATE]. Want to jump on a quick call to chat about it?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'sales-price-increase',
    category: 'sales',
    title: 'Price Increase Notice',
    subject: 'Important update to our pricing',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am writing to inform you of an upcoming adjustment to our service pricing, effective [DATE].',
  'I wanted to give you advance notice about a pricing update that takes effect on [DATE].',
  'Heads up - our pricing is changing starting [DATE].'
)}

What is changing:
- Standard hourly rate: Moving from [AMOUNT] to the updated rate
- This reflects increased demand, expanded capabilities, and additional value we now deliver

What this means for you as an existing client:
- Your current rate is locked in through the end of your current contract
- Renewing before [DATE] locks in a preferred rate
- All ongoing projects are unaffected

${toneLine(tone,
  'I value our working relationship tremendously and want to ensure a smooth transition. Please reach out if you would like to discuss renewal options.',
  'I really value our working relationship and want to make this as smooth as possible. Let me know if you want to chat about renewal options.',
  'Our working relationship means a lot to me. Let\'s chat about renewal options if you\'re interested.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'sales-upsell',
    category: 'sales',
    title: 'Upsell Offer',
    subject: 'A way to get even more from [PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'Given the success of our work on [PROJECT_NAME], I wanted to share an opportunity that I believe could deliver additional value for your business.',
  'Since [PROJECT_NAME] has been going so well, I thought you might be interested in something that could take things to the next level.',
  'Since [PROJECT_NAME] is crushing it, I wanted to share an idea that could make things even better.'
)}

I have noticed that your current setup could benefit from:
- Advanced analytics dashboard for real-time performance tracking
- Automated reporting to save your team 10+ hours per month
- SEO optimization to increase organic traffic by an estimated 50%

Package details:
- Investment: [AMOUNT] one-time setup + [AMOUNT]/month
- Implementation: 2 weeks with zero downtime
- Expected ROI: 200% within the first quarter

${toneLine(tone,
  'Shall I prepare a detailed proposal with projected outcomes specific to your business?',
  'Want me to put together a detailed proposal with projections specific to your business?',
  'Want me to whip up a quick proposal with numbers specific to your biz?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'sales-referral',
    category: 'sales',
    title: 'Referral Request',
    subject: 'Know anyone who could use similar results?',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I hope you are continuing to see great results from our work on [PROJECT_NAME]. It has been a pleasure collaborating with you.',
  'Hope you\'re still seeing great results from [PROJECT_NAME]! It\'s been awesome working with you.',
  'Hope [PROJECT_NAME] is still going strong! Been great working together.'
)}

${toneLine(tone,
  'I am currently looking to take on a few new clients, and I find that my best working relationships come from referrals. If you know of anyone in your network who could benefit from similar services, I would greatly appreciate an introduction.',
  'I\'m taking on a few new clients and my best projects always come from referrals. If anyone in your network could use similar help, I\'d love an intro!',
  'I\'ve got room for a couple new clients and figured I\'d ask - know anyone who could use what I do? Referrals always make the best projects.'
)}

As a thank you:
- You will receive a [AMOUNT] credit toward future services for each successful referral
- Your referral will receive a 10% discount on their first project
- No limit on the number of referrals

${toneClosing(tone)}`,
  },
  {
    id: 'sales-testimonial',
    category: 'sales',
    title: 'Testimonial Request',
    subject: 'Quick favor - would you share your experience?',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I trust that you have been satisfied with the results of our work on [PROJECT_NAME]. Your feedback means a great deal to me.',
  'I hope you\'re happy with how [PROJECT_NAME] turned out! Your feedback really means a lot to me.',
  'Hope you\'re loving the results from [PROJECT_NAME]! Got a quick favor to ask.'
)}

${toneLine(tone,
  'I would be honored if you could provide a brief testimonial about your experience working with me. A few sentences would be sufficient, covering:',
  'Would you mind writing a quick testimonial about our work together? Just a few sentences about:',
  'Would you be up for a quick testimonial? Just a few lines about:'
)}

- What challenge were you facing before we worked together?
- What results have you seen since project completion?
- Would you recommend my services to others?

${toneLine(tone,
  'You can simply reply to this email with your testimonial, or I can send you a brief form. I will share a draft for your approval before publishing anything.',
  'Just reply to this email with your thoughts, or I can send a quick form. I\'ll let you approve everything before it goes live.',
  'Just hit reply with your thoughts, or I can send you a simple form. Nothing goes live without your OK!'
)}

${toneClosing(tone)}`,
  },

  // === COLLECTIONS (5) ===
  {
    id: 'collections-friendly',
    category: 'collections',
    title: 'Friendly Payment Reminder',
    subject: 'Friendly reminder: Invoice #[PROJECT_NAME] is due',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I hope this message finds you well. I am writing to gently remind you that invoice #[PROJECT_NAME] for [AMOUNT] was due on [DATE].',
  'Hope you\'re doing well! Just a friendly reminder that invoice #[PROJECT_NAME] for [AMOUNT] was due on [DATE].',
  'Quick reminder - invoice #[PROJECT_NAME] for [AMOUNT] was due on [DATE].'
)}

I understand that things can sometimes slip through the cracks, so I wanted to bring this to your attention in case it was overlooked.

Payment details:
- Invoice #: [PROJECT_NAME]
- Amount due: [AMOUNT]
- Original due date: [DATE]
- Payment methods: Bank transfer, credit card, or PayPal

${toneLine(tone,
  'If payment has already been sent, please disregard this message. Otherwise, I would appreciate your attention to this at your earliest convenience.',
  'If you\'ve already sent payment, please ignore this! Otherwise, would you be able to take care of this soon?',
  'If you already paid, ignore this! Otherwise, would you mind taking care of this when you get a chance?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'collections-second',
    category: 'collections',
    title: 'Second Payment Notice',
    subject: 'Second notice: Invoice #[PROJECT_NAME] - [AMOUNT] overdue',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am following up regarding invoice #[PROJECT_NAME] for [AMOUNT], which is now 15 days past due. I sent a reminder on [DATE] and have not yet received payment or a response.',
  'Following up on invoice #[PROJECT_NAME] for [AMOUNT] - it\'s now 15 days overdue. I sent a reminder on [DATE] but haven\'t heard back.',
  'Checking in again about invoice #[PROJECT_NAME] for [AMOUNT] - it\'s 15 days past due now.'
)}

I want to resolve this quickly and amicably. If there is an issue with the invoice or if you need to arrange a payment plan, I am open to discussing options.

Outstanding balance:
- Invoice #: [PROJECT_NAME]
- Amount: [AMOUNT]
- Days overdue: 15
- Late fee (if applicable per contract): 1.5% per month

${toneLine(tone,
  'Please respond to this email within 5 business days to confirm payment status or to discuss alternative arrangements.',
  'Could you get back to me within 5 business days with a payment update or to discuss options?',
  'Please let me know within 5 days what\'s going on so we can figure this out.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'collections-final',
    category: 'collections',
    title: 'Final Payment Warning',
    subject: 'URGENT: Final notice for invoice #[PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'This is a final notice regarding the outstanding balance on invoice #[PROJECT_NAME] for [AMOUNT], which is now 30 days past due.',
  'This is a final notice about invoice #[PROJECT_NAME] for [AMOUNT], which is now 30 days overdue.',
  'Final heads up about invoice #[PROJECT_NAME] for [AMOUNT] - it\'s now 30 days past due.'
)}

I have made multiple attempts to resolve this matter and have not received payment or communication regarding the outstanding balance.

If payment is not received within 7 business days, I will be required to:
- Suspend all active services and deliverables
- Apply late fees as outlined in our contract
- Pursue formal collection procedures

Total amount due (including late fees): [AMOUNT]

${toneLine(tone,
  'I strongly prefer to resolve this directly. Please contact me immediately to discuss payment arrangements.',
  'I really want to resolve this between us. Please reach out as soon as possible to work something out.',
  'I\'d much rather work this out directly. Please get in touch ASAP so we can figure something out.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'collections-thankyou',
    category: 'collections',
    title: 'Payment Received Thank You',
    subject: 'Payment received - Thank you!',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am writing to confirm that I have received your payment of [AMOUNT] for invoice #[PROJECT_NAME]. Thank you for your prompt attention to this matter.',
  'Just confirming I received your payment of [AMOUNT] for invoice #[PROJECT_NAME]. Thank you so much!',
  'Got your payment of [AMOUNT] for invoice #[PROJECT_NAME] - thanks a lot!'
)}

Payment details:
- Invoice #: [PROJECT_NAME]
- Amount received: [AMOUNT]
- Date received: [DATE]
- Balance remaining: $0.00

Your account is now in good standing. A receipt has been attached for your records.

${toneLine(tone,
  'Thank you for your continued partnership. I look forward to our ongoing collaboration.',
  'Thanks again for the great working relationship! Looking forward to continuing our work together.',
  'Thanks for being awesome to work with! Looking forward to what\'s next.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'collections-escalation',
    category: 'collections',
    title: 'Overdue Escalation',
    subject: 'Overdue account escalation - Invoice #[PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am writing regarding the severely overdue invoice #[PROJECT_NAME] for [AMOUNT], which is now 60 days past the original due date of [DATE].',
  'I need to address the overdue invoice #[PROJECT_NAME] for [AMOUNT], which is now 60 days past due since [DATE].',
  'I need to talk about invoice #[PROJECT_NAME] for [AMOUNT] - it\'s now 60 days overdue.'
)}

Previous communication attempts:
- Friendly reminder sent (Day 7)
- Second notice sent (Day 15)
- Final warning sent (Day 30)

As a result of non-payment, the following actions have been taken:
- All services have been suspended
- Late fees of [AMOUNT] have been applied per our contract
- This matter has been escalated for formal collection

I remain open to discussing a resolution directly. A structured payment plan is available if full payment is not feasible at this time.

${toneLine(tone,
  'Please contact me within 48 hours to discuss resolution options before further action is taken.',
  'Please reach out within 48 hours so we can work out a solution before any further steps.',
  'Please get back to me within 48 hours so we can figure this out before things escalate further.'
)}

${toneClosing(tone)}`,
  },

  // === NETWORKING (5) ===
  {
    id: 'networking-conference',
    category: 'networking',
    title: 'Conference Follow-Up',
    subject: 'Great meeting you at [PROJECT_NAME]!',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'It was a pleasure meeting you at [PROJECT_NAME] last week. I thoroughly enjoyed our conversation about industry trends and digital innovation.',
  'It was so great meeting you at [PROJECT_NAME] last week! Really enjoyed our chat about what\'s happening in the industry.',
  'Awesome meeting you at [PROJECT_NAME]! Loved our conversation.'
)}

As promised, here are the resources I mentioned:
- The automation tool we discussed: [link]
- My recent case study on scaling freelance operations
- The industry report I referenced

${toneLine(tone,
  'I would enjoy continuing our conversation over coffee or a virtual meeting. Would you have availability in the coming weeks?',
  'Would love to continue our conversation over coffee or a video call. Are you free sometime in the next couple of weeks?',
  'Want to grab coffee or hop on a call soon to keep the convo going?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'networking-coffee',
    category: 'networking',
    title: 'Coffee Chat Request',
    subject: 'Coffee chat? I\'d love to learn about your work',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I have been following your work in the industry and am genuinely impressed by what you have accomplished. I would be grateful for the opportunity to learn from your experience.',
  'I\'ve been following your work and I\'m really impressed by what you\'ve built. I\'d love to learn more about your journey.',
  'Been following your work and I\'m a big fan! Would love to pick your brain over coffee.'
)}

A bit about me: I am a freelance professional specializing in [PROJECT_NAME], and I am always looking to connect with talented people in the space.

${toneLine(tone,
  'Would you be open to a 30-minute coffee meeting or video call? I would appreciate any insights you might share about your approach to business growth and client relationships.',
  'Would you be up for a 30-minute coffee or video chat? I\'d love to hear your thoughts on growing a business and building client relationships.',
  'Any chance you\'d be up for a 30-min coffee or video chat? Would love to hear your take on biz growth and client work.'
)}

I am flexible on timing and happy to work around your schedule.

${toneClosing(tone)}`,
  },
  {
    id: 'networking-collab',
    category: 'networking',
    title: 'Collaboration Proposal',
    subject: 'Collaboration idea: [PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I have an idea for a collaboration that I believe would be mutually beneficial, and I wanted to share it with you.',
  'I had an idea for a collaboration that I think could be a win-win for both of us!',
  'Had a collab idea that I think could be awesome for both of us!'
)}

The concept:
- Joint webinar or workshop on [PROJECT_NAME]
- Co-authored content piece combining our expertise
- Shared promotional efforts to both our audiences

Why I think this works:
- Our skills are complementary, not competing
- Combined audience reach doubles exposure for both of us
- Shared workload means higher quality output

${toneLine(tone,
  'I have drafted a brief outline of the collaboration structure. Would you be available to discuss this in more detail?',
  'I\'ve put together a quick outline of how this could work. Want to chat about it?',
  'I sketched out a rough plan - want to hop on a call and hash out the details?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'networking-thankyou',
    category: 'networking',
    title: 'Thank You Note',
    subject: 'Thank you for your time and insight',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I wanted to express my sincere gratitude for taking the time to meet with me. Your insights were incredibly valuable, and I have already begun implementing several of your suggestions.',
  'Thank you so much for meeting with me! Your insights were super valuable and I\'ve already started putting some of your suggestions into action.',
  'Thanks a ton for meeting with me! Already putting your suggestions to work.'
)}

Key takeaways I am acting on:
- Restructuring my service packages based on your pricing advice
- Implementing the client onboarding process you recommended
- Exploring the tools and resources you mentioned

${toneLine(tone,
  'I would be happy to return the favor in any way I can. Please do not hesitate to reach out if there is anything I can assist with.',
  'I\'d love to return the favor! Don\'t hesitate to reach out if I can help with anything.',
  'Happy to return the favor anytime - just holler if you need anything!'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'networking-recommendation',
    category: 'networking',
    title: 'Recommendation Request',
    subject: 'Would you be willing to write a recommendation?',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I hope you are doing well. I am reaching out to ask if you would be willing to write a brief recommendation for me, based on our professional interaction.',
  'Hope you\'re doing great! I wanted to ask if you\'d be willing to write a quick recommendation for me based on our work together.',
  'Hey! Quick ask - would you mind writing a short recommendation for me?'
)}

It would be used for my LinkedIn profile and professional portfolio. A brief paragraph covering any of the following would be wonderful:
- Quality of work delivered
- Communication and professionalism
- Results achieved during our collaboration

${toneLine(tone,
  'I am happy to reciprocate with a recommendation for you as well. I understand if your schedule does not permit this, and I appreciate your consideration either way.',
  'I\'d be happy to write one for you too! Totally understand if you\'re too busy though.',
  'Happy to write one for you too! No worries if you can\'t though.'
)}

${toneClosing(tone)}`,
  },

  // === ADMIN (5) ===
  {
    id: 'admin-ooo',
    category: 'admin',
    title: 'Out of Office',
    subject: 'Out of office: [DATE] to [DATE]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I am writing to inform you that I will be out of the office from [DATE] and will return on [DATE].',
  'Just a heads-up that I\'ll be out of the office from [DATE] to [DATE].',
  'Quick note - I\'ll be OOO from [DATE] to [DATE].'
)}

During this time:
- Email responses will be delayed (I will reply within 48 hours of my return)
- For urgent matters, please contact [PROJECT_NAME] at [AMOUNT]
- All scheduled deliverables have been completed or communicated separately

Current project status:
- [PROJECT_NAME]: On track, next milestone due after my return
- All pending reviews have been submitted
- Automated systems will continue running as normal

${toneLine(tone,
  'I have ensured that all time-sensitive matters are addressed before my departure. Thank you for your understanding.',
  'I\'ve made sure everything time-sensitive is taken care of before I go. Thanks for understanding!',
  'Everything urgent is handled. Thanks for your patience while I\'m away!'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'admin-reschedule',
    category: 'admin',
    title: 'Meeting Reschedule',
    subject: 'Request to reschedule our [DATE] meeting',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'I apologize for the inconvenience, but I need to request a reschedule of our meeting originally planned for [DATE].',
  'Sorry about this, but I need to reschedule our meeting that was set for [DATE].',
  'Hey, I need to move our [DATE] meeting - sorry about that!'
)}

Reason: A scheduling conflict has arisen that I was unable to avoid.

Proposed alternative times:
- Option A: [DATE] at the same time
- Option B: [DATE] - morning or afternoon
- Option C: Any time that works for you later this week

The agenda remains the same:
- [PROJECT_NAME] progress review
- Upcoming milestone discussion
- Action items and next steps

${toneLine(tone,
  'Please let me know which alternative works best for you, or suggest a time that is more convenient.',
  'Let me know which option works for you, or feel free to suggest something else!',
  'Which works for you? Or throw out another time that\'s better!'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'admin-renewal',
    category: 'admin',
    title: 'Contract Renewal',
    subject: 'Your contract renewal for [PROJECT_NAME]',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'Your current contract for [PROJECT_NAME] is approaching its expiration date of [DATE]. I am writing to discuss renewal options.',
  'Your [PROJECT_NAME] contract is coming up for renewal on [DATE]. Wanted to chat about next steps!',
  'Your [PROJECT_NAME] contract is expiring on [DATE] - let\'s talk about renewing!'
)}

Current contract summary:
- Service: [PROJECT_NAME]
- Duration: 12 months
- Monthly rate: [AMOUNT]
- Expiration: [DATE]

Renewal options:
- Option A: Same terms, 12-month renewal
- Option B: Upgraded package with additional services (+15%)
- Option C: Custom scope - let us discuss your evolving needs

Benefits of early renewal:
- Rate lock at current pricing (new rates take effect [DATE])
- Priority scheduling for the next quarter
- Bonus consultation session included

${toneLine(tone,
  'I recommend scheduling a brief review call to discuss which option best aligns with your goals for the coming year.',
  'Want to hop on a quick call to figure out which option makes the most sense for you?',
  'Want to jump on a call and figure out the best option for you?'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'admin-scope-change',
    category: 'admin',
    title: 'Scope Change Notification',
    subject: '[PROJECT_NAME] - Scope change request',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'Following our recent discussion, I want to formally document the requested scope change for [PROJECT_NAME] and its implications.',
  'Based on our recent chat, I want to lay out the scope change for [PROJECT_NAME] and what it means for the project.',
  'Putting the scope change we discussed for [PROJECT_NAME] in writing so we\'re on the same page.'
)}

Requested changes:
- Addition of [describe new feature/deliverable]
- Modification to [describe changed requirement]
- Removal of [describe removed item, if applicable]

Impact assessment:
- Timeline: Extended by approximately [X] weeks
- Budget: Additional [AMOUNT] required
- Resources: No change / Additional specialist needed

Revised totals:
- Original project fee: [AMOUNT]
- Scope change fee: [AMOUNT]
- New total: [AMOUNT]
- New deadline: [DATE]

${toneLine(tone,
  'Please review this scope change document carefully. Your written approval is required before work can proceed on the additional items.',
  'Please review this and let me know if everything looks right. I\'ll need your written OK before starting on the new items.',
  'Give this a look and let me know if it all checks out. Need your OK before I start on the new stuff.'
)}

${toneClosing(tone)}`,
  },
  {
    id: 'admin-wrapup',
    category: 'admin',
    title: 'Project Wrap-Up',
    subject: '[PROJECT_NAME] wrap-up and next steps',
    body: (tone) => `${toneGreeting(tone)}

${toneLine(tone,
  'With [PROJECT_NAME] now complete, I wanted to provide a comprehensive wrap-up and outline the transition process.',
  'Now that [PROJECT_NAME] is wrapped up, I wanted to go over everything and talk about what comes next.',
  'Now that [PROJECT_NAME] is done, here\'s a quick wrap-up and what happens next.'
)}

Project recap:
- Start date: [DATE]
- Completion date: [DATE]
- Total deliverables: All items delivered and approved
- Final budget: [AMOUNT] (on budget)

What I am handing off to you:
- All project files (shared via Google Drive/Dropbox)
- Documentation and SOPs
- Access credentials and admin rights
- Training recordings and guides

Post-project support:
- 30-day complimentary support period starts today
- After that, support is available at [AMOUNT]/hour
- I recommend a monthly maintenance retainer for ongoing optimization

${toneLine(tone,
  'I would welcome the opportunity to schedule a retrospective call to discuss what went well and identify areas for future improvement.',
  'Would love to do a quick retro call to talk about what went well and what we can improve for next time!',
  'Want to do a quick retro call? Always helps to talk about what worked and what we can do better next time.'
)}

${toneClosing(tone)}`,
  },
]

export default function App() {
  const [activeCategory, setActiveCategory] = useLocalStorage('skynet-email-templates-category', 'all')
  const [searchQuery, setSearchQuery] = useLocalStorage('skynet-email-templates-search', '')
  const [tone, setTone] = useLocalStorage('skynet-email-templates-tone', 'professional')
  const [expandedId, setExpandedId] = useState(null)

  // Personalization fields
  const [yourName, setYourName] = useLocalStorage('skynet-email-templates-yourName', '')
  const [clientNameField, setClientNameField] = useLocalStorage('skynet-email-templates-clientName', '')
  const [projectNameField, setProjectNameField] = useLocalStorage('skynet-email-templates-projectName', '')
  const [amountField, setAmountField] = useLocalStorage('skynet-email-templates-amount', '')
  const [dateField, setDateField] = useLocalStorage('skynet-email-templates-date', '')

  const personalize = (text) => {
    let result = text
    if (yourName) result = result.replace(/\[YOUR_NAME\]/g, yourName)
    if (clientNameField) result = result.replace(/\[CLIENT_NAME\]/g, clientNameField)
    if (projectNameField) result = result.replace(/\[PROJECT_NAME\]/g, projectNameField)
    if (amountField) result = result.replace(/\[AMOUNT\]/g, amountField)
    if (dateField) result = result.replace(/\[DATE\]/g, dateField)
    return result
  }

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory
      const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts = { all: TEMPLATES.length }
    CATEGORIES.forEach(c => {
      if (c.key !== 'all') {
        counts[c.key] = TEMPLATES.filter(t => t.category === c.key).length
      }
    })
    return counts
  }, [])

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-heading)',
    borderRadius: 'var(--radius)',
  }

  const labelStyle = { color: 'var(--text-muted)' }

  return (
    <ToolLayout
      title="Email Template Library"
      description="30+ professional email templates for outreach, client management, sales, collections, networking, and admin. Personalize and copy in one click."
      icon="\u2709\uFE0F"
      category="Ad Creative & Marketing"
      maxWidth="wide"
      proTip="Fill in the personalization fields once and they persist across sessions. Use the tone selector to adjust all templates between professional, friendly, and casual."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Personalization & Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personalization */}
          <ResultCard title="Personalization" icon="\uD83D\uDC64">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={labelStyle}>Your Name</label>
                <input
                  type="text"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-1.5 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={labelStyle}>Client Name</label>
                <input
                  type="text"
                  value={clientNameField}
                  onChange={(e) => setClientNameField(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-1.5 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={labelStyle}>Project Name</label>
                <input
                  type="text"
                  value={projectNameField}
                  onChange={(e) => setProjectNameField(e.target.value)}
                  placeholder="Website Redesign"
                  className="w-full px-3 py-1.5 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={labelStyle}>Amount</label>
                <input
                  type="text"
                  value={amountField}
                  onChange={(e) => setAmountField(e.target.value)}
                  placeholder="$5,000"
                  className="w-full px-3 py-1.5 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={labelStyle}>Date</label>
                <input
                  type="text"
                  value={dateField}
                  onChange={(e) => setDateField(e.target.value)}
                  placeholder="March 15, 2026"
                  className="w-full px-3 py-1.5 text-sm rounded-lg"
                  style={inputStyle}
                />
              </div>
            </div>
          </ResultCard>

          {/* Tone Selector */}
          <ResultCard title="Tone" icon="\uD83C\uDFA4">
            <div className="space-y-2">
              {TONES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTone(t.key)}
                  className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-all text-left"
                  style={{
                    background: tone === t.key ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: tone === t.key ? 'var(--text-on-accent)' : 'var(--text-body)',
                    border: `1px solid ${tone === t.key ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </ResultCard>

          {/* Category Filters */}
          <ResultCard title="Categories" icon="\uD83D\uDCC2">
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all"
                  style={{
                    background: activeCategory === c.key ? 'var(--accent-soft)' : 'transparent',
                    color: activeCategory === c.key ? 'var(--accent)' : 'var(--text-body)',
                  }}
                >
                  <span>{c.label}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: activeCategory === c.key ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: activeCategory === c.key ? 'var(--text-on-accent)' : 'var(--text-muted)',
                    }}
                  >
                    {categoryCounts[c.key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </ResultCard>
        </div>

        {/* Right: Template List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: 'var(--text-muted)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl"
              style={inputStyle}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm" style={labelStyle}>
            Showing {filteredTemplates.length} of {TEMPLATES.length} templates
          </p>

          {/* Template Cards */}
          <div className="space-y-3">
            {filteredTemplates.map(template => {
              const isExpanded = expandedId === template.id
              const bodyText = personalize(template.body(tone))
              const subjectText = personalize(template.subject)
              const fullEmail = `Subject: ${subjectText}\n\n${bodyText}`
              const categoryLabel = CATEGORIES.find(c => c.key === template.category)?.label || template.category

              return (
                <div
                  key={template.id}
                  className="rounded-xl transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${isExpanded ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {/* Header - always visible */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : template.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>
                          {template.title}
                        </h4>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >
                          {categoryLabel}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Subject: {subjectText}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 flex-shrink-0 ml-2 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{
                        color: 'var(--text-muted)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div
                        className="rounded-lg p-4 mb-3"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      >
                        <div className="mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Subject</p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{subjectText}</p>
                        </div>
                        <pre
                          className="text-sm whitespace-pre-wrap font-sans leading-relaxed"
                          style={{ color: 'var(--text-body)' }}
                        >
                          {bodyText}
                        </pre>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <CopyButton text={bodyText} label="Copy Body" />
                        <CopyButton text={fullEmail} label="Copy with Subject" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg mb-2" style={{ color: 'var(--text-heading)' }}>No templates found</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Try adjusting your search or category filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
