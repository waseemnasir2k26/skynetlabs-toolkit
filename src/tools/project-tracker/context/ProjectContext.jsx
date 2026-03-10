import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProjectContext = createContext();

const STORAGE_KEY = 'skynet-project-tracker';

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const addProject = useCallback((project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProject = useCallback((id) => {
    return projects.find(p => p.id === id) || null;
  }, [projects]);

  const importProjects = useCallback((imported) => {
    setProjects(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newProjects = imported.filter(p => !existingIds.has(p.id));
      return [...prev, ...newProjects];
    });
  }, []);

  const replaceAllProjects = useCallback((newProjects) => {
    setProjects(newProjects);
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProject,
      importProjects,
      replaceAllProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
