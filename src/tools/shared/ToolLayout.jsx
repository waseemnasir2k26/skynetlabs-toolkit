export default function ToolLayout({ title, description, children }) {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
          {description && (
            <p className="text-gray-400 text-lg max-w-3xl">{description}</p>
          )}
        </div>

        {/* Tool Content */}
        <div>{children}</div>

        {/* Branded Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm">
            Built by{' '}
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              SkynetLabs
            </a>
            {' '}&mdash; AI Automation Agency
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Need custom automation solutions?{' '}
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors"
            >
              Book a free consultation &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
