import React from 'react'

export default function StepSettings({ settings, onChange, onNext, onBack, tasks }) {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value })
  }

  const totalAnnualCost = tasks.reduce(
    (sum, t) => sum + (t.hoursPerWeek || 0) * (t.hourlyCost || 0) * 52,
    0
  )

  const estimatedSavings = Math.round(totalAnnualCost * (settings.automationPercent / 100))
  const sliderPercent = ((settings.automationPercent - 50) / (95 - 50)) * 100

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Configure automation settings
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Adjust the parameters to match your implementation plan
        </p>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-8 space-y-8 gradient-border">
        {/* Automation Percentage Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">
              Automation Efficiency
            </label>
            <span className="text-2xl font-bold text-primary-400 font-mono">
              {settings.automationPercent}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Percentage of manual work that AI can automate. Most businesses achieve 70-85%.
          </p>
          <input
            type="range"
            min="50"
            max="95"
            step="1"
            value={settings.automationPercent}
            onChange={(e) => handleChange('automationPercent', parseInt(e.target.value))}
            className="w-full"
            style={{ '--value-percent': `${sliderPercent}%` }}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Conservative (50%)</span>
            <span>Moderate (75%)</span>
            <span>Aggressive (95%)</span>
          </div>

          {/* Efficiency presets */}
          <div className="flex gap-2 mt-4">
            {[
              { label: 'Conservative', value: 55 },
              { label: 'Moderate', value: 75 },
              { label: 'Optimistic', value: 85 },
              { label: 'Aggressive', value: 92 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleChange('automationPercent', preset.value)}
                className={`
                  flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${settings.automationPercent === preset.value
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400 border'
                    : 'bg-dark-300 border border-dark-400 text-gray-500 hover:border-primary-500/30'
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-400" />

        {/* Implementation Cost */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">
              Estimated Implementation Cost
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Total investment for AI tools, setup, training, and consulting.
          </p>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
            <input
              type="number"
              min="0"
              step="500"
              value={settings.implementationCost}
              onChange={(e) => handleChange('implementationCost', parseInt(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-dark-300 border border-dark-400 text-white text-lg font-mono focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Cost presets */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[5000, 10000, 15000, 25000, 50000].map((cost) => (
              <button
                key={cost}
                onClick={() => handleChange('implementationCost', cost)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${settings.implementationCost === cost
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400 border'
                    : 'bg-dark-300 border border-dark-400 text-gray-500 hover:border-primary-500/30'
                  }
                `}
              >
                ${cost.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-400" />

        {/* Preview */}
        <div className="bg-dark-300/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Preview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Current Annual Cost</p>
              <p className="text-lg font-bold text-white">${totalAnnualCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Annual Savings</p>
              <p className="text-lg font-bold text-primary-400">${estimatedSavings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Implementation Cost</p>
              <p className="text-lg font-bold text-yellow-400">${settings.implementationCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Year 1 Savings</p>
              <p className={`text-lg font-bold ${estimatedSavings - settings.implementationCost > 0 ? 'text-primary-400' : 'text-red-400'}`}>
                ${(estimatedSavings - settings.implementationCost).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-dark-400 hover:border-gray-500 transition-all duration-300"
        >
          <svg className="inline-block mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl font-semibold text-sm bg-primary-500 text-dark hover:bg-primary-400 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
        >
          Calculate ROI
          <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
