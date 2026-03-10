import React from 'react'
import { INDUSTRIES, COMPANY_SIZES, CURRENT_TOOLS } from '../utils/constants'

export default function StepBusinessInfo({ data, onChange, onNext }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const isValid = data.industry && data.companySize && data.currentTools

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Tell us about your business
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Help us understand your current operations to calculate accurate savings
        </p>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 gradient-border">
        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Industry
          </label>
          <select
            value={data.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-300 border border-dark-400 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select your industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Size
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleChange('companySize', size)}
                className={`
                  px-3 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                  ${data.companySize === size
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400 border shadow-lg shadow-primary/10'
                    : 'bg-dark-300 border border-dark-400 text-gray-400 hover:border-primary-500/30 hover:text-gray-300'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Current Tools */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Automation Level
          </label>
          <select
            value={data.currentTools}
            onChange={(e) => handleChange('currentTools', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-300 border border-dark-400 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select current tools</option>
            {CURRENT_TOOLS.map((tool) => (
              <option key={tool} value={tool}>{tool}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`
            px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300
            ${isValid
              ? 'bg-primary-500 text-dark hover:bg-primary-400 shadow-lg shadow-primary/30 hover:shadow-primary/50'
              : 'bg-dark-400 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          Next Step
          <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
