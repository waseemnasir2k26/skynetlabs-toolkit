import { questions, dimensions } from '../data/questions'

export function calculateScores(answers) {
  const dimensionScores = {}

  dimensions.forEach((dim) => {
    const dimQuestions = questions.filter((q) => q.dimension === dim.id)
    let totalPoints = 0
    let maxPoints = 0

    dimQuestions.forEach((q) => {
      const answer = answers[q.id]
      if (answer === undefined || answer === null) return

      switch (q.id) {
        case 'repetitive_hours': {
          // More hours = more opportunity = higher score for needing AI
          const val = typeof answer === 'number' ? answer : 10
          totalPoints += Math.min(val / 40, 1) * 100
          maxPoints += 100
          break
        }
        case 'tools_count': {
          // More tools = more complex = more benefit from integration
          totalPoints += (answer / 4) * 100
          maxPoints += 100
          break
        }
        case 'automation_level': {
          // Higher automation = more ready
          const val = typeof answer === 'number' ? answer : 3
          totalPoints += (val / 10) * 100
          maxPoints += 100
          break
        }
        case 'time_sink': {
          // Any answer shows awareness, give moderate score
          totalPoints += 60
          maxPoints += 100
          break
        }
        case 'tech_stack': {
          // More tools = more integrated = more ready
          const arr = Array.isArray(answer) ? answer : []
          totalPoints += Math.min(arr.length / 5, 1) * 100
          maxPoints += 100
          break
        }
        case 'tech_comfort': {
          const val = typeof answer === 'number' ? answer : 5
          totalPoints += (val / 10) * 100
          maxPoints += 100
          break
        }
        case 'existing_automations': {
          totalPoints += (answer / 3) * 100
          maxPoints += 100
          break
        }
        case 'content_creation': {
          totalPoints += (answer / 3) * 100
          maxPoints += 100
          break
        }
        case 'data_organization': {
          totalPoints += (answer / 3) * 100
          maxPoints += 100
          break
        }
        case 'content_strategy': {
          totalPoints += (answer / 3) * 100
          maxPoints += 100
          break
        }
        case 'monthly_budget': {
          const val = typeof answer === 'number' ? answer : 500
          totalPoints += Math.min(val / 3000, 1) * 100
          maxPoints += 100
          break
        }
        case 'investment_readiness': {
          totalPoints += (answer / 3) * 100
          maxPoints += 100
          break
        }
        case 'expected_roi': {
          // Lower ROI expectation = more realistic = higher readiness
          const roiMap = { 2: 100, 3: 80, 5: 50, 10: 30 }
          totalPoints += roiMap[answer] || 50
          maxPoints += 100
          break
        }
        case 'growth_goals': {
          const arr = Array.isArray(answer) ? answer : []
          totalPoints += Math.min(arr.length / 4, 1) * 100
          maxPoints += 100
          break
        }
        case 'twelve_month_vision': {
          const visionMap = {
            double_revenue: 80,
            work_less: 70,
            automated: 100,
            new_products: 75,
            leader: 85,
          }
          totalPoints += visionMap[answer] || 60
          maxPoints += 100
          break
        }
        case 'growth_blockers': {
          const blockerMap = {
            time: 80,
            money: 40,
            knowledge: 60,
            team: 70,
            technology: 90,
            all: 75,
          }
          totalPoints += blockerMap[answer] || 50
          maxPoints += 100
          break
        }
        default: {
          totalPoints += 50
          maxPoints += 100
        }
      }
    })

    dimensionScores[dim.id] = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
  })

  const overall = Math.round(
    Object.values(dimensionScores).reduce((sum, s) => sum + s, 0) / dimensions.length
  )

  return { overall, dimensions: dimensionScores }
}

export function getScoreCategory(score) {
  if (score <= 25) return { label: 'Not Ready', color: '#ef4444', gradient: 'from-red-600 to-red-800' }
  if (score <= 50)
    return { label: 'Getting Started', color: '#f59e0b', gradient: 'from-yellow-500 to-orange-600' }
  if (score <= 75)
    return { label: 'Almost Ready', color: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' }
  return { label: 'AI Ready', color: '#13b973', gradient: 'from-primary to-primary-light' }
}

export function getPercentile(score) {
  // Simulated percentile based on score distribution
  if (score >= 80) return Math.min(95, 80 + Math.floor((score - 80) * 0.75))
  if (score >= 60) return Math.min(79, 55 + Math.floor((score - 60) * 1.2))
  if (score >= 40) return Math.min(54, 30 + Math.floor((score - 40) * 1.2))
  return Math.max(5, Math.floor(score * 0.75))
}

export function getTimeSavings(answers) {
  const hours = typeof answers.repetitive_hours === 'number' ? answers.repetitive_hours : 10
  const automationLevel = typeof answers.automation_level === 'number' ? answers.automation_level : 3
  const savingsPercent = Math.min(0.7, 0.3 + (10 - automationLevel) * 0.05)
  return Math.round(hours * savingsPercent)
}

export function getEstimatedROI(answers) {
  const budget = typeof answers.monthly_budget === 'number' ? answers.monthly_budget : 500
  const hours = typeof answers.repetitive_hours === 'number' ? answers.repetitive_hours : 10
  const hourlyValue = 75 // estimated hourly value of time
  const timeSaved = getTimeSavings(answers)
  const monthlySavings = timeSaved * 4 * hourlyValue // weekly savings * 4 weeks
  const annualSavings = monthlySavings * 12
  const annualCost = budget * 12 + 2000 // existing cost + implementation
  const roi = annualCost > 0 ? Math.round((annualSavings / annualCost) * 100) / 100 : 0
  return { monthlySavings, annualSavings, roi: Math.max(roi, 1.5) }
}

export function getDimensionInsights(dimensionId, score, answers) {
  const insights = {
    operations: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
    technology: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
    data: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
    budget: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
    growth: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
  }

  // Operations insights
  if (dimensionId === 'operations') {
    const hours = answers.repetitive_hours || 0
    const autoLevel = answers.automation_level || 1
    if (hours >= 20) {
      insights.operations.weaknesses.push('You spend significant time on repetitive tasks - prime for automation')
      insights.operations.recommendations.push('Implement n8n or Make.com workflows to automate repetitive processes')
    } else if (hours >= 10) {
      insights.operations.weaknesses.push('Moderate time on repetitive tasks could be reduced')
      insights.operations.recommendations.push('Identify your top 3 repetitive tasks and automate them first')
    } else {
      insights.operations.strengths.push('Low time on repetitive tasks shows existing efficiency')
    }
    if (autoLevel >= 7) {
      insights.operations.strengths.push('Strong automation foundation already in place')
    } else if (autoLevel <= 3) {
      insights.operations.weaknesses.push('Very low automation level means huge opportunity for improvement')
      insights.operations.recommendations.push('Start with simple automations like email workflows and data sync')
    }
    if (answers.tools_count >= 3) {
      insights.operations.recommendations.push('Integrate your many tools with a centralized automation platform')
    }
  }

  // Technology insights
  if (dimensionId === 'technology') {
    const stack = answers.tech_stack || []
    const comfort = answers.tech_comfort || 5
    const automations = answers.existing_automations || 0

    if (stack.length >= 4) {
      insights.technology.strengths.push('Diverse tech stack provides many integration opportunities')
    } else if (stack.length <= 2) {
      insights.technology.weaknesses.push('Limited tech stack may need expansion before full AI implementation')
      insights.technology.recommendations.push('Consider adding a CRM and project management tool as foundations')
    }
    if (comfort >= 7) {
      insights.technology.strengths.push('Team is comfortable with new tech - adoption will be smooth')
    } else if (comfort <= 4) {
      insights.technology.weaknesses.push('Team may resist new technology adoption')
      insights.technology.recommendations.push('Start with user-friendly tools and provide training sessions')
    }
    if (automations >= 2) {
      insights.technology.strengths.push('Existing automation experience provides a strong foundation')
    } else {
      insights.technology.recommendations.push('Begin with simple Zapier-style automations to build confidence')
    }
  }

  // Data & Content insights
  if (dimensionId === 'data') {
    const content = answers.content_creation || 0
    const dataOrg = answers.data_organization || 0
    const strategy = answers.content_strategy || 0

    if (content >= 2) {
      insights.data.strengths.push('Already leveraging AI for content creation')
    } else {
      insights.data.weaknesses.push('Manual content creation is slow and costly')
      insights.data.recommendations.push('Implement AI content tools for social media, blogs, and marketing')
    }
    if (dataOrg >= 2) {
      insights.data.strengths.push('Well-organized data is ready for AI processing')
    } else {
      insights.data.weaknesses.push('Disorganized data will limit AI effectiveness')
      insights.data.recommendations.push('Centralize your data into a CRM or database before automating')
    }
    if (strategy >= 2) {
      insights.data.strengths.push('Documented content strategy enables systematic automation')
    } else {
      insights.data.recommendations.push('Create a content calendar and strategy to maximize AI content tools')
    }
  }

  // Budget insights
  if (dimensionId === 'budget') {
    const budget = answers.monthly_budget || 0
    const readiness = answers.investment_readiness || 0

    if (budget >= 2000) {
      insights.budget.strengths.push('Strong budget allocation enables comprehensive automation')
    } else if (budget >= 500) {
      insights.budget.strengths.push('Moderate budget can cover essential automation tools')
    } else {
      insights.budget.weaknesses.push('Limited budget may restrict automation options')
      insights.budget.recommendations.push('Start with free/low-cost tools like n8n self-hosted and free AI tiers')
    }
    if (readiness >= 2) {
      insights.budget.strengths.push('Ready and willing to invest in automation')
    } else {
      insights.budget.weaknesses.push('Hesitation to invest may delay competitive advantages')
      insights.budget.recommendations.push('Start small - automate one process to prove ROI before scaling')
    }
  }

  // Growth insights
  if (dimensionId === 'growth') {
    const goals = answers.growth_goals || []
    const blocker = answers.growth_blockers

    if (goals.length >= 4) {
      insights.growth.strengths.push('Ambitious and multi-faceted growth goals show strong vision')
    } else if (goals.length >= 2) {
      insights.growth.strengths.push('Clear growth goals provide good direction for automation')
    } else {
      insights.growth.weaknesses.push('Unclear goals make it harder to prioritize automation')
      insights.growth.recommendations.push('Define 2-3 specific, measurable goals before starting automation')
    }
    if (blocker === 'time' || blocker === 'all') {
      insights.growth.recommendations.push('Time is your bottleneck - automation directly solves this')
    }
    if (blocker === 'technology' || blocker === 'all') {
      insights.growth.recommendations.push('Upgrade your tech stack with modern automation-friendly tools')
    }
    if (goals.includes('time')) {
      insights.growth.recommendations.push('Focus on task automation to reclaim 10-20+ hours per week')
    }
    if (goals.includes('revenue')) {
      insights.growth.recommendations.push('Implement automated lead generation and sales follow-up')
    }
  }

  return insights[dimensionId]
}

export function getRecommendedServices(scores, answers) {
  const services = []

  if (scores.dimensions.operations <= 50) {
    services.push({
      name: 'n8n Workflow Automation',
      description: 'Custom automated workflows to eliminate repetitive tasks and connect your tools',
      priority: 'high',
      icon: '⚡',
    })
  }

  if (scores.dimensions.operations <= 60 || scores.dimensions.technology <= 50) {
    services.push({
      name: 'GoHighLevel CRM Setup',
      description: 'All-in-one CRM with automated follow-ups, pipelines, and client management',
      priority: scores.dimensions.operations <= 40 ? 'high' : 'medium',
      icon: '📋',
    })
  }

  if (scores.dimensions.data <= 50) {
    services.push({
      name: 'AI Content Creation System',
      description: 'Automated content pipeline for social media, blogs, and marketing materials',
      priority: 'high',
      icon: '✍️',
    })
    services.push({
      name: 'Social Media Automation',
      description: 'Auto-scheduled posts, engagement tracking, and AI-generated content',
      priority: 'medium',
      icon: '📱',
    })
  }

  if (scores.dimensions.technology <= 40) {
    services.push({
      name: 'Technology Consulting',
      description: 'Expert guidance on building the right tech stack for AI integration',
      priority: 'high',
      icon: '🔧',
    })
    services.push({
      name: 'Implementation & Setup',
      description: 'Full hands-on setup of your automation infrastructure',
      priority: 'medium',
      icon: '🏗️',
    })
  }

  const goals = answers.growth_goals || []
  if (goals.length >= 3 || scores.overall >= 60) {
    services.push({
      name: 'Full Automation Package',
      description: 'End-to-end automation strategy covering all business operations',
      priority: scores.overall >= 70 ? 'high' : 'medium',
      icon: '🚀',
    })
  }

  if (answers.growth_blockers === 'time' || answers.growth_blockers === 'all') {
    services.push({
      name: 'AI Virtual Assistant Setup',
      description: 'AI-powered assistant to handle scheduling, emails, and routine tasks',
      priority: 'medium',
      icon: '🤖',
    })
  }

  // Deduplicate and sort by priority
  const seen = new Set()
  return services
    .filter((s) => {
      if (seen.has(s.name)) return false
      seen.add(s.name)
      return true
    })
    .sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1))
    .slice(0, 5)
}

export function getPriorityActions(scores, answers) {
  const actions = []

  // Find the two weakest dimensions
  const sortedDims = Object.entries(scores.dimensions).sort((a, b) => a[1] - b[1])

  sortedDims.slice(0, 2).forEach(([dim, score]) => {
    switch (dim) {
      case 'operations':
        actions.push({
          action: 'Audit your daily workflows and identify the top 3 tasks to automate',
          impact: 'Save ' + getTimeSavings(answers) + '+ hours per week',
          urgency: 'Start this week',
        })
        break
      case 'technology':
        actions.push({
          action: 'Set up a centralized automation platform (n8n or Make.com)',
          impact: 'Foundation for all future automations',
          urgency: 'Within 2 weeks',
        })
        break
      case 'data':
        actions.push({
          action: 'Organize your data and implement an AI content creation workflow',
          impact: 'Reduce content creation time by 70%',
          urgency: 'Within 30 days',
        })
        break
      case 'budget':
        actions.push({
          action: 'Start with one high-ROI automation to prove value before scaling',
          impact: 'Build confidence and justify larger investment',
          urgency: 'This month',
        })
        break
      case 'growth':
        actions.push({
          action: 'Define clear, measurable growth KPIs and align automation to them',
          impact: 'Focused automation delivers faster results',
          urgency: 'This week',
        })
        break
    }
  })

  actions.push({
    action: 'Book a free AI readiness consultation with Skynet Labs',
    impact: 'Get a custom automation roadmap for your business',
    urgency: 'Today',
  })

  return actions.slice(0, 3)
}
