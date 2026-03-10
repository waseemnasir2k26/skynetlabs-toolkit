import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import LandingScreen from './components/LandingScreen'
import QuizScreen from './components/QuizScreen'
import ResultsScreen from './components/ResultsScreen'
import AdminPanel from './components/AdminPanel'
import { calculateScores } from './utils/scoring'
import { saveResult, getAnswersProgress, clearProgress } from './utils/storage'
import { generatePDF } from './utils/pdf'

const SCREENS = {
  LANDING: 'landing',
  QUIZ: 'quiz',
  RESULTS: 'results',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING)
  const [scores, setScores] = useState(null)
  const [answers, setAnswers] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [savedProgress, setSavedProgress] = useState(null)

  useEffect(() => {
    const progress = getAnswersProgress()
    if (progress && Object.keys(progress.answers).length > 0) {
      setSavedProgress(progress)
    }
  }, [])

  useEffect(() => {
    let count = 0
    let timer = null
    const handler = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        count++
        clearTimeout(timer)
        timer = setTimeout(() => (count = 0), 1000)
        if (count >= 3) {
          setShowAdmin(true)
          count = 0
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleStart = useCallback(() => {
    setScreen(SCREENS.QUIZ)
    window.scrollTo(0, 0)
  }, [])

  const handleQuizComplete = useCallback((quizAnswers) => {
    const computed = calculateScores(quizAnswers)
    setScores(computed)
    setAnswers(quizAnswers)
    saveResult(quizAnswers, computed)
    clearProgress()
    setSavedProgress(null)
    setScreen(SCREENS.RESULTS)
    window.scrollTo(0, 0)
  }, [])

  const handleRetake = useCallback(() => {
    setScores(null)
    setAnswers(null)
    setSavedProgress(null)
    clearProgress()
    setScreen(SCREENS.LANDING)
    window.scrollTo(0, 0)
  }, [])

  const handleDownloadPDF = useCallback(() => {
    if (scores && answers) {
      generatePDF(scores, answers)
    }
  }, [scores, answers])

  return (
    <div className="py-6">
      {screen === SCREENS.LANDING && (
        <LandingScreen
          onStart={handleStart}
          hasProgress={!!savedProgress}
        />
      )}

      {screen === SCREENS.QUIZ && (
        <QuizScreen
          onComplete={handleQuizComplete}
          savedProgress={savedProgress}
        />
      )}

      {screen === SCREENS.RESULTS && scores && answers && (
        <ResultsScreen
          scores={scores}
          answers={answers}
          onRetake={handleRetake}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      <AnimatePresence>
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
    </div>
  )
}
