export default function Footer() {
  return (
    <footer className="no-print border-t border-dark-600/50 bg-dark-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CTA Banner */}
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 sm:p-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            Need us to automate your social media?
          </h3>
          <p className="text-gray-400 text-sm mb-4 max-w-lg mx-auto">
            Let Skynet Labs handle your content creation, scheduling, and analytics with AI-powered automation.
          </p>
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider">SKYNET LABS</span>
            <span className="text-gray-700">|</span>
            <span>AI Automation Agency</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              www.skynetjoe.com
            </a>
            <span className="text-gray-700">&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
