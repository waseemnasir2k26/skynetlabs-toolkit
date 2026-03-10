import { useRef, useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { exportProjectData, importProjectData } from '../utils/helpers';

export default function DataManagement() {
  const { projects, importProjects, replaceAllProjects } = useProjects();
  const fileInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    if (projects.length === 0) {
      setImportMsg('No projects to export');
      return;
    }
    exportProjectData(projects);
    setImportMsg('Data exported successfully');
    setTimeout(() => setImportMsg(''), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importProjectData(file);
      importProjects(data);
      setImportMsg(`Imported ${data.length} project(s) successfully`);
    } catch (err) {
      setImportMsg(`Import failed: ${err.message}`);
    }
    e.target.value = '';
    setTimeout(() => setImportMsg(''), 5000);
  };

  const handleClearAll = () => {
    replaceAllProjects([]);
    setShowClearConfirm(false);
    setImportMsg('All data cleared');
    setTimeout(() => setImportMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Management</h1>
        <p className="text-text-secondary text-sm mt-1">Export, import, and manage your project data</p>
      </div>

      {importMsg && (
        <div className="p-3 bg-primary/10 border border-primary/30 text-primary text-sm rounded-lg">
          {importMsg}
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-2">Storage Info</h2>
        <p className="text-sm text-text-secondary">
          All data is stored in your browser's localStorage. You currently have <span className="text-primary font-semibold">{projects.length}</span> project(s) saved.
        </p>
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Export Data</h2>
        <p className="text-sm text-text-secondary mb-4">
          Download all your project data as a JSON file. Use this for backups or to transfer data.
        </p>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Export All Projects (JSON)
        </button>
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Import Data</h2>
        <p className="text-sm text-text-secondary mb-4">
          Import projects from a previously exported JSON file. Duplicate projects (same ID) will be skipped.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 bg-border text-text-secondary hover:bg-border-light rounded-lg text-sm font-semibold transition-colors"
        >
          Import from JSON File
        </button>
      </div>

      <div className="bg-bg-card border border-status-red/30 rounded-xl p-6">
        <h2 className="font-semibold mb-4 text-status-red">Danger Zone</h2>
        <p className="text-sm text-text-secondary mb-4">
          Clear all project data from localStorage. This action cannot be undone.
        </p>
        {showClearConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-status-red font-semibold">Are you sure?</span>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-status-red text-white rounded-lg text-sm font-semibold hover:bg-status-red/80 transition-colors"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 bg-border text-text-secondary rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 bg-status-red/20 text-status-red rounded-lg text-sm font-semibold hover:bg-status-red/30 transition-colors"
          >
            Clear All Data
          </button>
        )}
      </div>
    </div>
  );
}
