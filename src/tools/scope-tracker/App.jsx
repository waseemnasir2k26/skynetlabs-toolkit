import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import ProjectSetup from './components/ProjectSetup';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import ChangeOrders from './components/ChangeOrders';
import { loadProjects, saveProjects } from './utils/storage';

export default function App() {
  const [projects, setProjects] = useState(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [view, setView] = useState('projects');

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleSaveProject = useCallback(
    (project) => {
      setProjects((prev) => {
        const exists = prev.find((p) => p.id === project.id);
        if (exists) {
          return prev.map((p) => (p.id === project.id ? project : p));
        }
        return [...prev, project];
      });
      setActiveProjectId(project.id);
      setView('dashboard');
    },
    []
  );

  const handleUpdateProject = useCallback((updatedProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  }, []);

  const handleDeleteProject = useCallback(
    (id) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
        setView('projects');
      }
    },
    [activeProjectId]
  );

  const handleArchiveProject = useCallback((id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p))
    );
  }, []);

  const handleSelectProject = useCallback((id) => {
    setActiveProjectId(id);
    setView('dashboard');
  }, []);

  const handleNavigate = useCallback((target) => {
    if (target === 'projects') {
      setActiveProjectId(null);
    }
    setView(target);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'new-project':
        return <ProjectSetup onSave={handleSaveProject} />;
      case 'dashboard':
        return activeProject ? (
          <Dashboard project={activeProject} onUpdate={handleUpdateProject} />
        ) : (
          <ProjectList
            projects={projects}
            onSelect={handleSelectProject}
            onNewProject={() => setView('new-project')}
            onDelete={handleDeleteProject}
            onArchive={handleArchiveProject}
          />
        );
      case 'analytics':
        return activeProject ? (
          <Analytics project={activeProject} />
        ) : null;
      case 'change-orders':
        return activeProject ? (
          <ChangeOrders project={activeProject} onUpdate={handleUpdateProject} />
        ) : null;
      case 'projects':
      default:
        return (
          <ProjectList
            projects={projects}
            onSelect={handleSelectProject}
            onNewProject={() => setView('new-project')}
            onDelete={handleDeleteProject}
            onArchive={handleArchiveProject}
          />
        );
    }
  };

  return (
    <div>
      <Header
        currentView={view}
        onNavigate={handleNavigate}
        hasActiveProject={!!activeProject}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}
