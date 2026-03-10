import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TemplateBuilder from './pages/TemplateBuilder';
import TemplateList from './pages/TemplateList';
import ClientOnboarding from './pages/ClientOnboarding';
import ClientView from './pages/ClientView';
import Settings from './pages/Settings';

function App() {
  const location = useLocation();
  const isClientFacing = location.pathname.includes('/onboard');

  return (
    <div>
      {!isClientFacing && <Header />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="templates" element={<TemplateList />} />
        <Route path="templates/new" element={<TemplateBuilder />} />
        <Route path="templates/:id" element={<TemplateBuilder />} />
        <Route path="client/:id" element={<ClientView />} />
        <Route path="onboard/:templateId" element={<ClientOnboarding />} />
        <Route path="onboard" element={<ClientOnboarding />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
