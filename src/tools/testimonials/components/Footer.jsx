export default function Footer() {
  return (
    <footer className="border-t border-dark-400/20 bg-dark-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-dark-300">
            <span>Powered by</span>
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-400 hover:text-primary-300 transition-colors"
            >
              SKYNET LABS
            </a>
            <span className="text-dark-400">|</span>
            <span className="text-dark-400">AI Automation Agency</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-300 hover:text-primary-400 transition-colors"
            >
              Visit skynetjoe.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
