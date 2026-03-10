import React, { useState, useEffect } from 'react'
import ProgressBar from './components/ProgressBar'
import StepBusinessInfo from './components/StepBusinessInfo'
import StepTasks from './components/StepTasks'
import StepSettings from './components/StepSettings'
import ResultsDashboard from './components/ResultsDashboard'
import { calculateROI } from './utils/calculations'
import { useLocalStorage } from './hooks/useLocalStorage'

const INITIAL_BUSINESS_INFO = {
  industry: '',
  companySize: '',
  currentTools: '',
}

const INITIAL_TASKS = [
  {
    id: '1',
    name: '',
    hoursPerWeek: 5,
    hourlyCost: 30,
    frequency: 'Weekly',
  },
]

const INITIAL_SETTINGS = {
  automationPercent: 75,
  implementationCost: 15000,
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [businessInfo, setBusinessInfo] = useLocalStorage('roi-business-info', INITIAL_BUSINESS_INFO)
  const [tasks, setTasks] = useLocalStorage('roi-tasks', INITIAL_TASKS)
  const [settings, setSettings] = useLocalStorage('roi-settings', INITIAL_SETTINGS)
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (currentStep === 4) {
      const r = calculateROI(tasks, settings.automationPercent, settings.implementationCost)
      setResults(r)
      try {
        localStorage.setItem('roi-results', JSON.stringify(r))
      } catch (e) {
        // ignore
      }
    }
  }, [currentStep, tasks, settings])

  const goToStep = (step) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentStep(step)
  }

  const handleReset = () => {
    setBusinessInfo(INITIAL_BUSINESS_INFO)
    setTasks(INITIAL_TASKS)
    setSettings(INITIAL_SETTINGS)
    setResults(null)
    goToStep(1)
  }

  return (
    <div className="py-6">
      {/* Hero (only on step 1) */}
      {currentStep === 1 && (
        <div className="text-center px-4 pt-4 pb-2 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span style={{ color: 'var(--text-heading)' }}>AI Automation</span>{' '}
            <span className="text-gradient">ROI Calculator</span>
          </h1>
          <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Discover how much time and money your business can save by implementing
            AI-powered automation. Get your personalized ROI analysis in minutes.
          </p>
        </div>
      )}

      <ProgressBar currentStep={currentStep} />

      <main className="pb-12">
        {currentStep === 1 && (
          <StepBusinessInfo
            data={businessInfo}
            onChange={setBusinessInfo}
            onNext={() => goToStep(2)}
          />
        )}
        {currentStep === 2 && (
          <StepTasks
            tasks={tasks}
            onChange={setTasks}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepSettings
            settings={settings}
            onChange={setSettings}
            tasks={tasks}
            onNext={() => goToStep(4)}
            onBack={() => goToStep(2)}
          />
        )}
        {currentStep === 4 && results && (
          <ResultsDashboard
            results={results}
            businessInfo={businessInfo}
            onBack={() => goToStep(3)}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
