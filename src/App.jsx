import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'

// Lazy load all tools for code splitting
const ProposalBuilder = lazy(() => import('./tools/proposal-builder/App'))
const ScopeTracker = lazy(() => import('./tools/scope-tracker/App'))
const Testimonials = lazy(() => import('./tools/testimonials/App'))
const ProjectTracker = lazy(() => import('./tools/project-tracker/App'))
const ClientOnboarding = lazy(() => import('./tools/client-onboarding/App'))

// AI Intelligence
const BriefAnalyzer = lazy(() => import('./tools/brief-analyzer/App'))
const NicheScanner = lazy(() => import('./tools/niche-scanner/App'))
const SOWGenerator = lazy(() => import('./tools/sow-generator/App'))
const MeetingManager = lazy(() => import('./tools/meeting-manager/App'))
const PositioningGenerator = lazy(() => import('./tools/positioning-generator/App'))

// Ad Creative & Marketing
const AdROICalculator = lazy(() => import('./tools/ad-roi-calculator/App'))
const CompetitorAngles = lazy(() => import('./tools/competitor-angles/App'))

// Agency Operations
const CommandCenter = lazy(() => import('./tools/command-center/App'))
const OnboardingPortal = lazy(() => import('./tools/onboarding-portal/App'))
const ScopeChange = lazy(() => import('./tools/scope-change/App'))
const ProductizeServices = lazy(() => import('./tools/productize-services/App'))
const PostMortem = lazy(() => import('./tools/post-mortem/App'))
const ClientReport = lazy(() => import('./tools/client-report/App'))

// Revenue & Growth
const ServiceConfigurator = lazy(() => import('./tools/service-configurator/App'))
const RevenueGoal = lazy(() => import('./tools/revenue-goal/App'))
const RevenueDiversification = lazy(() => import('./tools/revenue-diversification/App'))
const WinBackCampaigns = lazy(() => import('./tools/win-back-campaigns/App'))

// Authority Building
const ContentPlanner = lazy(() => import('./tools/content-planner/App'))
const SocialProofManager = lazy(() => import('./tools/social-proof-manager/App'))
const BusinessScorecard = lazy(() => import('./tools/business-scorecard/App'))
const WebsiteAudit = lazy(() => import('./tools/website-audit/App'))
const LeadMagnetFactory = lazy(() => import('./tools/lead-magnet-factory/App'))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-dark-400 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading tool...</p>
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
        <Route path="/scope-tracker" element={<Tool><ScopeTracker /></Tool>} />
        <Route path="/testimonials/*" element={<Tool><Testimonials /></Tool>} />
        <Route path="/project-tracker/*" element={<Tool><ProjectTracker /></Tool>} />
        <Route path="/client-onboarding/*" element={<Tool><ClientOnboarding /></Tool>} />
        {/* AI Intelligence */}
        <Route path="/brief-analyzer" element={<Tool><BriefAnalyzer /></Tool>} />
        <Route path="/niche-scanner" element={<Tool><NicheScanner /></Tool>} />
        <Route path="/sow-generator" element={<Tool><SOWGenerator /></Tool>} />
        <Route path="/meeting-manager" element={<Tool><MeetingManager /></Tool>} />
        <Route path="/positioning-generator" element={<Tool><PositioningGenerator /></Tool>} />
        {/* Ad Creative & Marketing */}
        <Route path="/ad-roi-calculator" element={<Tool><AdROICalculator /></Tool>} />
        <Route path="/competitor-angles" element={<Tool><CompetitorAngles /></Tool>} />
        {/* Agency Operations */}
        <Route path="/command-center" element={<Tool><CommandCenter /></Tool>} />
        <Route path="/onboarding-portal" element={<Tool><OnboardingPortal /></Tool>} />
        <Route path="/scope-change" element={<Tool><ScopeChange /></Tool>} />
        <Route path="/productize-services" element={<Tool><ProductizeServices /></Tool>} />
        <Route path="/post-mortem" element={<Tool><PostMortem /></Tool>} />
        <Route path="/client-report" element={<Tool><ClientReport /></Tool>} />
        {/* Revenue & Growth */}
        <Route path="/service-configurator" element={<Tool><ServiceConfigurator /></Tool>} />
        <Route path="/revenue-goal" element={<Tool><RevenueGoal /></Tool>} />
        <Route path="/revenue-diversification" element={<Tool><RevenueDiversification /></Tool>} />
        <Route path="/win-back-campaigns" element={<Tool><WinBackCampaigns /></Tool>} />
        {/* Authority Building */}
        <Route path="/content-planner" element={<Tool><ContentPlanner /></Tool>} />
        <Route path="/social-proof-manager" element={<Tool><SocialProofManager /></Tool>} />
        <Route path="/business-scorecard" element={<Tool><BusinessScorecard /></Tool>} />
        <Route path="/website-audit" element={<Tool><WebsiteAudit /></Tool>} />
        <Route path="/lead-magnet-factory" element={<Tool><LeadMagnetFactory /></Tool>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
