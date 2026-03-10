import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { questions } from '../data/questions'
import ProgressBar from './ProgressBar'
import QuestionCard from './QuestionCard'
import { saveAnswersProgress } from '../utils/storage'

export default function QuizScreen({ onComplete, savedProgress }) {
  const [currentIndex, setCurrentIndex] = useState(savedProgress?.currentQuestion || 0)
  const [answers, setAnswers] = useState(savedProgress?.answers || {})
  const [direction, setDirection] = useState(1)

  const question = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1

  const currentAnswer = answers[question.id]
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== null &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true)

  // Save progress
  useEffect(() => {
    saveAnswersProgress(answers, currentIndex)
  }, [answers, currentIndex])

  const handleAnswer = useCallback((value) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }, [question.id])

  const goNext = useCallback(() => {
    if (isLast) {
      // Set default for slider questions that were skipped
      const finalAnswers = { ...answers }
      questions.forEach((q) => {
        if (q.type === 'slider' && finalAnswers[q.id] === undefined) {
          finalAnswers[q.id] = q.defaultValue
        }
      })
      onComplete(finalAnswers)
    } else {
      setDirection(1)
      setCurrentIndex((i) => i + 1)
    }
  }, [isLast, answers, onComplete])

  const goBack = useCallback(() => {
    if (!isFirst) {
      setDirection(-1)
      setCurrentIndex((i) => i - 1)
    }
  }, [isFirst])

  // Auto-advance for single choice
  useEffect(() => {
    if (question.type === 'single' && currentAnswer !== undefined) {
      const timer = setTimeout(() => {
        if (!isLast) {
          setDirection(1)
          setCurrentIndex((i) => i + 1)
        }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [currentAnswer, question.type])

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Progress */}
      <div className="sticky top-16 z-40 bg-dark-500/90 backdrop-blur-lg px-4 py-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <ProgressBar
            current={currentIndex}
            total={questions.length}
            currentDimension={question.dimension}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <QuestionCard
            question={question}
            value={currentAnswer}
            onChange={handleAnswer}
            direction={direction}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-dark-500/90 backdrop-blur-lg border-t border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goBack}
            disabled={isFirst}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              isFirst
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 bg-dark-200 hover:bg-dark-100 border border-white/5'
            }`}
          >
            ← Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goNext}
            disabled={!hasAnswer && question.type !== 'slider'}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              hasAnswer || question.type === 'slider'
                ? 'bg-primary text-white hover:bg-primary-dark glow-green'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLast ? 'See My Results' : 'Next →'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
