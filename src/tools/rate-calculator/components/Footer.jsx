export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-dark text-sm">
              S
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.2em] text-gray-400">SKYNET LABS</div>
              <div className="text-[10px] text-gray-600">AI Automation Agency</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Skynet Labs. Free tool for the freelance community.
          </div>
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-primary transition-colors"
          >
            www.skynetjoe.com
          </a>
        </div>
      </div>
    </footer>
  )
}
