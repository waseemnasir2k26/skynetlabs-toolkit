import { Routes, Route } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewProject from './pages/NewProject'
import ProjectDetail from './pages/ProjectDetail'
import ClientView from './pages/ClientView'
import KanbanBoard from './pages/KanbanBoard'
import CalendarView from './pages/CalendarView'
import DataManagement from './pages/DataManagement'

function AppContent() {
  return (
    <Routes>
      {/* Client view - standalone, no sidebar */}
      <Route path="client/:id" element={<ClientView />} />

      {/* Agency views - with sidebar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="new-project" element={<NewProject />} />
        <Route path="project/:id" element={<ProjectDetail />} />
        <Route path="kanban" element={<KanbanBoard />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="settings" element={<DataManagement />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  )
}

export default App
