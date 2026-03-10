export default function Header() {
  return (
    <header className="no-print border-b border-dark-600/50 bg-dark-800/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="text-primary font-black text-lg">S</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] text-white">SKYNET LABS</h1>
            <p className="text-[10px] text-gray-500 tracking-wider">AI Automation Agency</p>
          </div>
        </a>
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <span>skynetjoe.com</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </header>
  );
}
