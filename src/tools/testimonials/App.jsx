import { Routes, Route } from 'react-router-dom'
import { TestimonialProvider } from './contexts/TestimonialContext'
import Header from './components/Header'
import DashboardPage from './pages/DashboardPage'
import WallOfLovePage from './pages/WallOfLovePage'
import CollectPage from './pages/CollectPage'
import EmbedPage from './pages/EmbedPage'
import SettingsPage from './pages/SettingsPage'
import { useSearchParams, useLocation } from 'react-router-dom'

function AppContent() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === '1'

  if (isEmbed && location.pathname.endsWith('/wall')) {
    return (
      <div>
        <WallOfLovePage />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/wall" element={<WallOfLovePage />} />
          <Route path="/collect" element={<CollectPage />} />
          <Route path="/embed" element={<EmbedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <TestimonialProvider>
      <AppContent />
    </TestimonialProvider>
  )
}
