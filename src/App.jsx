import React, { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'

// Lazy load all tools for code splitting
const ROICalculator = lazy(() => import('./tools/roi-calculator/App'))
const RateCalculator = lazy(() => import('./tools/rate-calculator/App'))
const InvoiceGenerator = lazy(() => import('./tools/invoice-generator/App'))
const ProposalBuilder = lazy(() => import('./tools/proposal-builder/App'))
const ContentCalendar = lazy(() => import('./tools/content-calendar/App'))
const ScopeTracker = lazy(() => import('./tools/scope-tracker/App'))
const Testimonials = lazy(() => import('./tools/testimonials/App'))
const ProjectTracker = lazy(() => import('./tools/project-tracker/App'))
const AIQuiz = lazy(() => import('./tools/ai-quiz/App'))
const ClientOnboarding = lazy(() => import('./tools/client-onboarding/App'))

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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/roi-calculator" element={
          <Suspense fallback={<LoadingSpinner />}><ROICalculator /></Suspense>
        } />
        <Route path="/rate-calculator" element={
          <Suspense fallback={<LoadingSpinner />}><RateCalculator /></Suspense>
        } />
        <Route path="/invoice-generator" element={
          <Suspense fallback={<LoadingSpinner />}><InvoiceGenerator /></Suspense>
        } />
        <Route path="/proposal-builder" element={
          <Suspense fallback={<LoadingSpinner />}><ProposalBuilder /></Suspense>
        } />
        <Route path="/content-calendar" element={
          <Suspense fallback={<LoadingSpinner />}><ContentCalendar /></Suspense>
        } />
        <Route path="/scope-tracker" element={
          <Suspense fallback={<LoadingSpinner />}><ScopeTracker /></Suspense>
        } />
        <Route path="/testimonials/*" element={
          <Suspense fallback={<LoadingSpinner />}><Testimonials /></Suspense>
        } />
        <Route path="/project-tracker/*" element={
          <Suspense fallback={<LoadingSpinner />}><ProjectTracker /></Suspense>
        } />
        <Route path="/ai-quiz" element={
          <Suspense fallback={<LoadingSpinner />}><AIQuiz /></Suspense>
        } />
        <Route path="/client-onboarding/*" element={
          <Suspense fallback={<LoadingSpinner />}><ClientOnboarding /></Suspense>
        } />
      </Route>
    </Routes>
  )
}
