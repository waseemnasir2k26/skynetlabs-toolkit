import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'

// Lazy load all tools for code splitting
const ProposalBuilder = lazy(() => import('./tools/proposal-builder/App'))
const ProjectTracker = lazy(() => import('./tools/project-tracker/App'))
const ClientOnboarding = lazy(() => import('./tools/client-onboarding/App'))

// AI Intelligence
const BriefAnalyzer = lazy(() => import('./tools/brief-analyzer/App'))
const SOWGenerator = lazy(() => import('./tools/sow-generator/App'))
const MeetingManager = lazy(() => import('./tools/meeting-manager/App'))

// Ad Creative & Marketing
const SubjectLineTester = lazy(() => import('./tools/subject-line-tester/App'))
const EmailTemplates = lazy(() => import('./tools/email-templates/App'))
const ColdOutreach = lazy(() => import('./tools/cold-outreach/App'))

// Agency Operations
const OnboardingPortal = lazy(() => import('./tools/onboarding-portal/App'))
const ClientReport = lazy(() => import('./tools/client-report/App'))

// Freelancer Tools
const FiverrGigCreator = lazy(() => import('./tools/fiverr-gig-creator/App'))

// Generator
const ContractGenerator = lazy(() => import('./tools/contract-generator/App'))
const BrandKitGenerator = lazy(() => import('./tools/brand-kit-generator/App'))

// Authority Building
const ContentPlanner = lazy(() => import('./tools/content-planner/App'))
const SocialProofManager = lazy(() => import('./tools/social-proof-manager/App'))
const BusinessScorecard = lazy(() => import('./tools/business-scorecard/App'))
const WebsiteAudit = lazy(() => import('./tools/website-audit/App'))
const LeadMagnetFactory = lazy(() => import('./tools/lead-magnet-factory/App'))
const FeedbackSurvey = lazy(() => import('./tools/feedback-survey/App'))
const SocialCalendar = lazy(() => import('./tools/social-calendar/App'))
const CaseStudyGenerator = lazy(() => import('./tools/case-study-generator/App'))

// Admin
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading tool...</p>
      </div>
    </div>
  )
}

function Tool({ children }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        {/* Core Tools */}
        <Route path="/proposal-builder" element={<Tool><ProposalBuilder /></Tool>} />
        <Route path="/project-tracker/*" element={<Tool><ProjectTracker /></Tool>} />
        <Route path="/client-onboarding/*" element={<Tool><ClientOnboarding /></Tool>} />
        {/* AI Intelligence */}
        <Route path="/brief-analyzer" element={<Tool><BriefAnalyzer /></Tool>} />
        <Route path="/sow-generator" element={<Tool><SOWGenerator /></Tool>} />
        <Route path="/meeting-manager" element={<Tool><MeetingManager /></Tool>} />
        {/* Ad Creative & Marketing */}
        <Route path="/subject-line-tester" element={<Tool><SubjectLineTester /></Tool>} />
        <Route path="/email-templates" element={<Tool><EmailTemplates /></Tool>} />
        <Route path="/cold-outreach" element={<Tool><ColdOutreach /></Tool>} />
        {/* Agency Operations */}
        <Route path="/onboarding-portal" element={<Tool><OnboardingPortal /></Tool>} />
        <Route path="/client-report" element={<Tool><ClientReport /></Tool>} />
        {/* Freelancer Tools */}
        <Route path="/fiverr-gig-creator" element={<Tool><FiverrGigCreator /></Tool>} />
        {/* Generators */}
        <Route path="/contract-generator" element={<Tool><ContractGenerator /></Tool>} />
        <Route path="/brand-kit-generator" element={<Tool><BrandKitGenerator /></Tool>} />
        {/* Authority Building */}
        <Route path="/content-planner" element={<Tool><ContentPlanner /></Tool>} />
        <Route path="/social-proof-manager" element={<Tool><SocialProofManager /></Tool>} />
        <Route path="/business-scorecard" element={<Tool><BusinessScorecard /></Tool>} />
        <Route path="/website-audit" element={<Tool><WebsiteAudit /></Tool>} />
        <Route path="/lead-magnet-factory" element={<Tool><LeadMagnetFactory /></Tool>} />
        <Route path="/feedback-survey" element={<Tool><FeedbackSurvey /></Tool>} />
        <Route path="/social-calendar" element={<Tool><SocialCalendar /></Tool>} />
        <Route path="/case-study-generator" element={<Tool><CaseStudyGenerator /></Tool>} />
        {/* Admin */}
        <Route path="/admin" element={<Tool><AdminLogin /></Tool>} />
        <Route path="/admin/dashboard" element={<Tool><AdminDashboard /></Tool>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
