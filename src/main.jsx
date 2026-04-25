import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './tools/shared/ThemeProvider'
import { ToastProvider } from './tools/shared/Toast'
import { initMonitoring, Sentry } from './lib/monitoring'
import ErrorFallback from './components/ErrorFallback'
import App from './App'
import './index.css'

initMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
)
