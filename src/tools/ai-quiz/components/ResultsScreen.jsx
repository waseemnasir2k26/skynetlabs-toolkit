import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { dimensions } from '../data/questions'
import {
  getScoreCategory,
  getPercentile,
  getTimeSavings,
  getEstimatedROI,
  getDimensionInsights,
  getRecommendedServices,
  getPriorityActions,
} from '../utils/scoring'
import ScoreGauge from './ScoreGauge'
import RadarChart from './RadarChart'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

function Section({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-dark-200/50 border border-white/5 rounded-2xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  )
}

export default function ResultsScreen({ scores, answers, onRetake, onDownloadPDF }) {
  const category = getScoreCategory(scores.overall)
  const percentile = getPercentile(scores.overall)
  const timeSavings = getTimeSavings(answers)
  const roi = getEstimatedROI(answers)
  const services = getRecommendedServices(scores, answers)
  const actions = getPriorityActions(scores, answers)
  const resultsRef = useRef(null)

  useEffect(() => {
    if (scores.overall >= 60) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#13b973', '#17d684', '#0f9a5f', '#ffffff'],
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [scores.overall])

  const handleShare = () => {
    const text = `I scored ${scores.overall}/100 on the AI Business Readiness Quiz! ${category.label}. Take the quiz to see how ready your business is for AI automation.`
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'AI Business Readiness Quiz', text, url }).catch(() => {})
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      window.open(twitterUrl, '_blank')
    }
  }

  return (
    <div ref={resultsRef} className="min-h-screen pt-20 pb-16 px-4 bg-grid">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <Section>
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Your AI Readiness Report
            </h1>
            <p className="text-gray-400">Here is your personalized assessment</p>
          </div>

          <Card className="text-center py-10">
            <ScoreGauge score={scores.overall} />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 text-gray-400"
            >
              You are in the <span className="text-primary font-bold">top {100 - percentile}%</span> of
              businesses assessed
            </motion.p>
          </Card>
        </Section>

        {/* Key Metrics */}
        <Section delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <div className="text-3xl font-black text-primary">{timeSavings}+</div>
              <div className="text-sm text-gray-400 mt-1">Hours saved per week</div>
              <div className="text-xs text-gray-600 mt-1">with AI automation</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-black text-primary">
                ${roi.monthlySavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-1">Potential monthly savings</div>
              <div className="text-xs text-gray-600 mt-1">estimated value of time saved</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-black text-primary">{roi.roi}x</div>
              <div className="text-sm text-gray-400 mt-1">Estimated ROI</div>
              <div className="text-xs text-gray-600 mt-1">within first 12 months</div>
            </Card>
          </div>
        </Section>

        {/* Radar Chart */}
        <Section delay={0.15}>
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Score Breakdown</h2>
            <RadarChart dimensionScores={scores.dimensions} />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {dimensions.map((dim) => (
                <div
                  key={dim.id}
                  className="text-center p-3 rounded-xl bg-dark-300/50"
                >
                  <div className="text-lg">{dim.icon}</div>
                  <div className="text-2xl font-bold text-white">{scores.dimensions[dim.id]}</div>
                  <div className="text-xs text-gray-500">{dim.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Dimension Insights */}
        <Section delay={0.2}>
          <h2 className="text-xl font-bold text-white mb-4">Detailed Insights</h2>
          <div className="space-y-4">
            {dimensions.map((dim) => {
              const insight = getDimensionInsights(dim.id, scores.dimensions[dim.id], answers)
              return (
                <Card key={dim.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{dim.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{dim.label}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-dark-400 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${scores.dimensions[dim.id]}%`,
                              backgroundColor: getScoreCategory(scores.dimensions[dim.id]).color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-mono font-bold" style={{ color: getScoreCategory(scores.dimensions[dim.id]).color }}>
                          {scores.dimensions[dim.id]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {insight.strengths.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1.5">Strengths</div>
                        {insight.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-green-400 mt-0.5 flex-shrink-0">+</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {insight.weaknesses.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1.5">Areas to Improve</div>
                        {insight.weaknesses.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-yellow-400 mt-0.5 flex-shrink-0">!</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {insight.recommendations.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5">Recommendations</div>
                        {insight.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-blue-400 mt-0.5 flex-shrink-0">&#8594;</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>

        {/* Priority Actions */}
        <Section delay={0.25}>
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Priority Action Plan</h2>
            <div className="space-y-4">
              {actions.map((action, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl bg-dark-300/50 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{action.action}</div>
                    <div className="text-sm text-gray-400 mt-1">Impact: {action.impact}</div>
                    <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                      {action.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Recommended Services */}
        <Section delay={0.3}>
          <Card>
            <h2 className="text-xl font-bold text-white mb-2">
              Recommended Skynet Labs Services
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Based on your assessment, here are the services that would have the highest impact:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    service.priority === 'high'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-white/5 bg-dark-300/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{service.name}</span>
                        {service.priority === 'high' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-primary/20 text-primary">
                            High Impact
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* CTA Section */}
        <Section delay={0.35}>
          <Card className="text-center bg-gradient-to-br from-dark-200/80 to-dark-300/80 border-primary/20">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Ready to Automate Your Business?
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Get a free, personalized AI automation roadmap from our team. No obligations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.skynetjoe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors glow-green-strong"
              >
                Book a Free AI Consultation
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://www.skynetjoe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark-300 text-white font-bold rounded-xl border border-white/10 hover:bg-dark-100 transition-colors"
              >
                Get Custom Roadmap
              </a>
            </div>
            <div className="mt-4">
              <a
                href="https://wa.me/message/SKYNETLABS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.504 3.935 1.395 5.608L.046 23.395a.75.75 0 00.912.912l5.787-1.349A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.83 0-3.542-.494-5.015-1.358l-.36-.213-3.437.801.815-3.437-.233-.37A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </Card>
        </Section>

        {/* Action Buttons */}
        <Section delay={0.4}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onDownloadPDF}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-200 text-gray-300 font-medium rounded-xl border border-white/5 hover:bg-dark-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-200 text-gray-300 font-medium rounded-xl border border-white/5 hover:bg-dark-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Results
            </button>
            <button
              onClick={onRetake}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-200 text-gray-300 font-medium rounded-xl border border-white/5 hover:bg-dark-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Quiz
            </button>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 pt-8 border-t border-white/5">
          <p>
            Powered by{' '}
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Skynet Labs
            </a>{' '}
            — AI Automation Agency
          </p>
        </div>
      </div>
    </div>
  )
}
