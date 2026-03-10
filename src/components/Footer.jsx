import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-sm tracking-wider">SKYNET LABS</span>
                <span className="text-gray-500 text-[9px] tracking-widest uppercase ml-2">AI Automation Agency</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Free tools built for freelancers, agencies, and small businesses.
              No sign-up required. 100% free.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-1.5">
              <Link to="/roi-calculator" className="text-gray-500 hover:text-primary text-xs transition-colors">ROI Calculator</Link>
              <Link to="/rate-calculator" className="text-gray-500 hover:text-primary text-xs transition-colors">Rate Calculator</Link>
              <Link to="/invoice-generator" className="text-gray-500 hover:text-primary text-xs transition-colors">Invoice Generator</Link>
              <Link to="/proposal-builder" className="text-gray-500 hover:text-primary text-xs transition-colors">Proposal Builder</Link>
              <Link to="/content-calendar" className="text-gray-500 hover:text-primary text-xs transition-colors">Content Calendar</Link>
              <Link to="/scope-tracker" className="text-gray-500 hover:text-primary text-xs transition-colors">Scope Tracker</Link>
              <Link to="/testimonials" className="text-gray-500 hover:text-primary text-xs transition-colors">Testimonials</Link>
              <Link to="/project-tracker" className="text-gray-500 hover:text-primary text-xs transition-colors">Project Tracker</Link>
              <Link to="/ai-quiz" className="text-gray-500 hover:text-primary text-xs transition-colors">AI Readiness Quiz</Link>
              <Link to="/client-onboarding" className="text-gray-500 hover:text-primary text-xs transition-colors">Client Onboarding</Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm mb-3">Connect</h4>
            <div className="space-y-2">
              <a
                href="https://www.skynetjoe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                skynetjoe.com
              </a>
              <a
                href="https://www.waseemnasir.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                waseemnasir.com
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-4">
              <a href="https://twitter.com/skynetjoe" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/skynetlabs" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@skynetjoe" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Skynet Labs. All tools are free to use.
          </p>
          <p className="text-xs text-gray-600">
            Built with <span className="text-primary">AI</span> by{' '}
            <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
              Skynet Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
