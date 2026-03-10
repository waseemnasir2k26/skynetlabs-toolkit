import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function SliderQuestion({ question, value, onChange }) {
  const displayValue = value ?? question.defaultValue
  const formatValue = (v) => {
    if (question.unit === '$/mo') return `$${v.toLocaleString()}`
    if (question.unit) return `${v}${v >= question.max ? '+' : ''} ${question.unit}`
    return v
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl sm:text-5xl font-black text-primary">
          {formatValue(displayValue)}
        </span>
      </div>
      <div className="px-2">
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={displayValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
        {question.labels && (
          <div className="flex justify-between mt-2">
            {Object.entries(question.labels).map(([val, label]) => (
              <span key={val} className="text-xs text-gray-500">{label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SingleChoiceQuestion({ question, value, onChange }) {
  return (
    <div className="grid gap-3">
      {question.options.map((option) => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onChange(option.value)}
          className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all ${
            value === option.value
              ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(19,185,115,0.15)]'
              : 'border-white/5 bg-dark-200/50 hover:border-white/10 hover:bg-dark-100/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                value === option.value ? 'border-primary' : 'border-gray-600'
              }`}
            >
              {value === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold ${value === option.value ? 'text-white' : 'text-gray-300'}`}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-0.5">{option.description}</div>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function MultiChoiceQuestion({ question, value, onChange }) {
  const selected = Array.isArray(value) ? value : []

  const toggle = (val) => {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val]
    onChange(next)
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {question.options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggle(option.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-white/5 bg-dark-200/50 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                  isSelected ? 'border-primary bg-primary' : 'border-gray-600'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {option.label}
              </span>
            </div>
          </motion.button>
        )
      })}
      {selected.length > 0 && (
        <div className="sm:col-span-2 text-center text-sm text-gray-500 mt-1">
          {selected.length} selected
        </div>
      )}
    </div>
  )
}

export default function QuestionCard({ question, value, onChange, direction }) {
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={question.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full"
      >
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
            {question.question}
          </h2>
          {question.subtitle && (
            <p className="text-gray-400 text-base">{question.subtitle}</p>
          )}
        </div>

        {question.type === 'slider' && (
          <SliderQuestion question={question} value={value} onChange={onChange} />
        )}
        {question.type === 'single' && (
          <SingleChoiceQuestion question={question} value={value} onChange={onChange} />
        )}
        {question.type === 'multi' && (
          <MultiChoiceQuestion question={question} value={value} onChange={onChange} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
