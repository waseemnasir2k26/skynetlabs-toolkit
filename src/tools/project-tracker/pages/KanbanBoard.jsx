import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { calculateOverallProgress, getHealthStatus } from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';

const columns = [
  { key: 'active', label: 'Active', color: 'border-status-green' },
  { key: 'on-hold', label: 'On Hold', color: 'border-status-amber' },
  { key: 'completed', label: 'Completed', color: 'border-status-blue' },
  { key: 'archived', label: 'Archived', color: 'border-text-muted' },
];

export default function KanbanBoard() {
  const { projects, updateProject } = useProjects();
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, projectId) => {
    setDragItem(projectId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, colKey) => {
    e.preventDefault();
    if (dragItem) {
      updateProject(dragItem, { status: colKey });
    }
    setDragItem(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDragOverCol(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-text-secondary text-sm mt-1">Drag projects between columns to change status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[60vh]">
        {columns.map(col => {
          const colProjects = projects.filter(p => p.status === col.key);
          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={e => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.key)}
              className={`flex flex-col bg-bg-dark border-t-2 ${col.color} rounded-xl transition-colors ${
                isOver ? 'bg-bg-card ring-2 ring-primary/30' : ''
              }`}
            >
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs text-text-muted bg-border rounded-full px-2 py-0.5">
                    {colProjects.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colProjects.map(project => {
                  const progress = calculateOverallProgress(project.phases);
                  const health = getHealthStatus(project);
                  const isDragging = dragItem === project.id;

                  return (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={e => handleDragStart(e, project.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-border-light ${
                        isDragging ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <Link to={`/project-tracker/project/${project.id}`} className="block" onClick={e => { if (isDragging) e.preventDefault(); }}>
                        <h4 className="text-sm font-semibold truncate hover:text-primary transition-colors">
                          {project.name || 'Untitled'}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5 truncate">{project.clientName}</p>
                        <ProgressBar value={progress} size="sm" className="mt-2" />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-text-muted">{project.projectType}</span>
                          <StatusBadge status={health} type="health" />
                        </div>
                      </Link>
                    </div>
                  );
                })}

                {colProjects.length === 0 && (
                  <div className="text-center py-8 text-text-muted text-xs">
                    {isOver ? 'Drop here' : 'No projects'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
