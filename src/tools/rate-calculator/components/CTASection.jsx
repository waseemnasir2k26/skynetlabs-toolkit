import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1 }}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
      <div className="relative p-8 sm:p-12 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Ready to Get More Clients?
        </h3>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          Let Skynet Labs help you automate your lead generation, streamline operations,
          and scale your freelance business with AI-powered solutions.
        </p>
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-dark font-bold text-sm hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Get More Clients
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>AI Automation</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span>Lead Generation</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span>Business Growth</span>
        </div>
      </div>
    </motion.div>
  )
}
