import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { calculateOverallProgress, getCurrentPhase, getHealthStatus, healthColors, formatDate, projectTypes } from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { projects } = useProjects();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const clients = useMemo(() => {
    const set = new Set(projects.map(p => p.clientName).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (filterStatus !== 'all') {
        const health = getHealthStatus(p);
        if (filterStatus === 'active' && (p.status !== 'active' || health === 'completed')) return false;
        if (filterStatus === 'on-track' && health !== 'on-track') return false;
        if (filterStatus === 'at-risk' && health !== 'at-risk') return false;
        if (filterStatus === 'behind' && health !== 'behind') return false;
        if (filterStatus === 'completed' && p.status !== 'completed') return false;
      }
      if (filterClient !== 'all' && p.clientName !== filterClient) return false;
      if (filterType !== 'all' && p.projectType !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.clientName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [projects, filterStatus, filterClient, filterType, search]);

  const stats = useMemo(() => {
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const atRisk = projects.filter(p => getHealthStatus(p) === 'at-risk').length;
    const behind = projects.filter(p => getHealthStatus(p) === 'behind').length;
    return { total: projects.length, active, completed, atRisk, behind };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Manage and track all your projects</p>
        </div>
        <Link
          to="/project-tracker/new-project"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-text-primary' },
          { label: 'Active', value: stats.active, color: 'text-primary' },
          { label: 'Completed', value: stats.completed, color: 'text-status-blue' },
          { label: 'At Risk', value: stats.atRisk, color: 'text-status-amber' },
          { label: 'Behind', value: stats.behind, color: 'text-status-red' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary w-full sm:w-64"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="behind">Behind</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
        >
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
        >
          <option value="all">All Types</option>
          {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-bg-card border border-border rounded-xl">
          <svg className="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <h3 className="text-lg font-semibold text-text-secondary">No projects found</h3>
          <p className="text-text-muted mt-1">
            {projects.length === 0 ? 'Create your first project to get started' : 'Try adjusting your filters'}
          </p>
          {projects.length === 0 && (
            <Link to="/project-tracker/new-project" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors">
              Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  const progress = calculateOverallProgress(project.phases);
  const currentPhase = getCurrentPhase(project.phases);
  const health = getHealthStatus(project);
  const actionItems = (project.actionItems || []).filter(a => !a.completed).length;

  return (
    <Link
      to={`/project-tracker/project/${project.id}`}
      className="block bg-bg-card hover:bg-bg-card-hover border border-border rounded-xl p-5 transition-all hover:border-border-light group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
            {project.name || 'Untitled Project'}
          </h3>
          <p className="text-sm text-text-muted mt-0.5">{project.clientName || 'No client'}</p>
        </div>
        <StatusBadge status={health} type="health" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 bg-border/50 rounded-full text-text-secondary">{project.projectType}</span>
        {currentPhase && (
          <span className="text-xs text-text-muted truncate">
            Phase: {currentPhase.name}
          </span>
        )}
      </div>

      <ProgressBar value={progress} size="sm" />

      <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
        <span>{formatDate(project.startDate)} - {formatDate(project.estimatedEndDate) || 'TBD'}</span>
        {actionItems > 0 && (
          <span className="text-status-amber font-semibold">{actionItems} action{actionItems > 1 ? 's' : ''} needed</span>
        )}
      </div>
    </Link>
  );
}
