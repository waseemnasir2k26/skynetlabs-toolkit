import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="relative z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-dark text-lg">
            S
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.25em] text-white group-hover:text-primary transition-colors">
              SKYNET LABS
            </div>
            <div className="text-[10px] tracking-[0.15em] text-gray-500 uppercase">
              AI Automation Agency
            </div>
          </div>
        </a>
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
        >
          Visit skynetjoe.com
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Free Tool by Skynet Labs
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Freelance Rate</span>{' '}
            <span className="gradient-text">Calculator</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Know your worth. Calculate the perfect hourly, project, and retainer rates
            based on your goals, expenses, and market data.
          </p>
        </motion.div>
      </div>
    </header>
  )
}
