import React from 'react'

const STEPS = [
  { num: 1, label: 'Business Info' },
  { num: 2, label: 'Your Tasks' },
  { num: 3, label: 'Settings' },
  { num: 4, label: 'Results' },
]

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 hidden sm:block" style={{ left: '10%', right: '10%', background: 'var(--border)' }} />
        {/* Active line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-0.5 transition-all duration-700 ease-out hidden sm:block"
          style={{
            left: '10%',
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 80}%`,
            background: 'linear-gradient(to right, var(--accent), var(--accent))',
          }}
        />

        {STEPS.map((step) => {
          const isActive = currentStep === step.num
          const isCompleted = currentStep > step.num

          return (
            <div key={step.num} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold
                  transition-all duration-500 ease-out
                  ${isCompleted
                    ? 'shadow-lg'
                    : isActive
                    ? 'border-2 shadow-lg'
                    : 'border'
                  }
                `}
                style={
                  isCompleted
                    ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                    : isActive
                    ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }
                    : { background: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                }
              >
                {isCompleted ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className="mt-2 text-xs sm:text-sm font-medium transition-colors duration-300"
                style={{ color: isActive || isCompleted ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
