import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};

export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const getHealthStatus = (project) => {
  if (project.status === 'completed') return 'completed';
  if (project.status === 'on-hold' || project.status === 'archived') return 'on-hold';
  if (!project.estimatedEndDate) return 'on-track';
  const today = new Date();
  const end = new Date(project.estimatedEndDate);
  const daysLeft = daysBetween(today, end);
  const overallProgress = calculateOverallProgress(project.phases || []);
  if (daysLeft < 0) return 'behind';
  if (daysLeft < 7 && overallProgress < 80) return 'at-risk';
  return 'on-track';
};

export const calculateOverallProgress = (phases) => {
  if (!phases || phases.length === 0) return 0;
  const total = phases.reduce((sum, p) => sum + (p.progress || 0), 0);
  return Math.round(total / phases.length);
};

export const getCurrentPhase = (phases) => {
  if (!phases || phases.length === 0) return null;
  const inProgress = phases.find(p => p.status === 'in-progress');
  if (inProgress) return inProgress;
  const review = phases.find(p => p.status === 'review');
  if (review) return review;
  const notStarted = phases.find(p => p.status === 'not-started');
  if (notStarted) return notStarted;
  return phases[phases.length - 1];
};

export const healthColors = {
  'on-track': { bg: 'bg-status-green/20', text: 'text-status-green', label: 'On Track' },
  'at-risk': { bg: 'bg-status-amber/20', text: 'text-status-amber', label: 'At Risk' },
  'behind': { bg: 'bg-status-red/20', text: 'text-status-red', label: 'Behind' },
  'completed': { bg: 'bg-status-blue/20', text: 'text-status-blue', label: 'Completed' },
  'on-hold': { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'On Hold' },
};

export const statusColors = {
  'not-started': { bg: 'bg-text-muted/20', text: 'text-text-muted', label: 'Not Started' },
  'in-progress': { bg: 'bg-status-green/20', text: 'text-status-green', label: 'In Progress' },
  'review': { bg: 'bg-status-amber/20', text: 'text-status-amber', label: 'Review' },
  'completed': { bg: 'bg-status-blue/20', text: 'text-status-blue', label: 'Completed' },
};

export const projectTypes = [
  'Website', 'App', 'Branding', 'Marketing', 'Automation',
  'E-Commerce', 'SEO', 'Social Media', 'Consulting', 'Other'
];

export const defaultPhases = [
  { name: 'Discovery', description: 'Research, requirements gathering, and project planning' },
  { name: 'Design', description: 'Visual design, wireframes, and prototyping' },
  { name: 'Development', description: 'Building and implementing the solution' },
  { name: 'Testing', description: 'Quality assurance and bug fixing' },
  { name: 'Launch', description: 'Deployment, handoff, and go-live' },
];

export const createEmptyProject = () => ({
  id: generateId(),
  name: '',
  clientName: '',
  clientEmail: '',
  projectType: 'Website',
  startDate: new Date().toISOString().split('T')[0],
  estimatedEndDate: '',
  budget: '',
  status: 'active',
  phases: [],
  paymentMilestones: [],
  updates: [],
  actionItems: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createPhase = (name = '', description = '') => ({
  id: generateId(),
  name,
  description,
  status: 'not-started',
  progress: 0,
  startDate: '',
  endDate: '',
  tasks: [],
  deliverables: '',
});

export const createPaymentMilestone = () => ({
  id: generateId(),
  name: '',
  amount: '',
  status: 'upcoming',
});

export const createUpdate = (text = '', visibility = 'client', attachments = []) => ({
  id: generateId(),
  text,
  visibility,
  attachments,
  pinned: false,
  createdAt: new Date().toISOString(),
});

export const createActionItem = (text = '') => ({
  id: generateId(),
  text,
  completed: false,
  createdAt: new Date().toISOString(),
});

export const createTask = (text = '') => ({
  id: generateId(),
  text,
  completed: false,
});

export const exportProjectData = (projects) => {
  const data = JSON.stringify(projects, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `project-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importProjectData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch {
        reject(new Error('Invalid JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const duplicateProject = (project) => {
  const newProject = JSON.parse(JSON.stringify(project));
  newProject.id = generateId();
  newProject.name = `${project.name} (Copy)`;
  newProject.status = 'active';
  newProject.createdAt = new Date().toISOString();
  newProject.updatedAt = new Date().toISOString();
  newProject.phases = newProject.phases.map(p => ({
    ...p,
    id: generateId(),
    status: 'not-started',
    progress: 0,
    tasks: p.tasks.map(t => ({ ...t, id: generateId(), completed: false })),
  }));
  newProject.paymentMilestones = newProject.paymentMilestones.map(m => ({
    ...m,
    id: generateId(),
    status: 'upcoming',
  }));
  newProject.updates = [];
  newProject.actionItems = newProject.actionItems.map(a => ({
    ...a,
    id: generateId(),
    completed: false,
  }));
  return newProject;
};
