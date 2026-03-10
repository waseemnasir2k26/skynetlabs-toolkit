import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 mt-auto border-t border-dark-300">
      <div className="max-w-7xl mx-auto text-center space-y-3">
        <p className="text-sm text-gray-500">
          Built by{' '}
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
          >
            Skynet Labs
          </a>
          {' '} — AI Automation Agency
        </p>
        <p className="text-xs text-gray-700">
          This calculator provides estimates based on the data you enter. Actual savings may vary.
        </p>
        <p className="text-xs text-gray-700">
          &copy; {new Date().getFullYear()} Skynet Labs. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
