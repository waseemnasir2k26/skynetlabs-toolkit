import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTemplates, deleteTemplate, saveTemplate } from '../utils/storage';
import { generateShareLink } from '../utils/storage';
import { SECTION_DEFINITIONS } from '../data/sections';
import { v4 as uuidv4 } from 'uuid';

export default function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleDelete = (id) => {
    if (confirm('Delete this template?')) {
      const updated = deleteTemplate(id);
      setTemplates(updated);
    }
  };

  const handleDuplicate = (template) => {
    const newId = uuidv4();
    saveTemplate({
      id: newId,
      name: `${template.name} (Copy)`,
      sections: [...template.sections],
    });
    setTemplates(getTemplates());
  };

  const copyLink = (templateId) => {
    const link = generateShareLink(templateId);
    navigator.clipboard.writeText(link);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-text">Onboarding Templates</h2>
          <p className="text-sm text-dark-muted mt-1">Create and manage form templates for different project types</p>
        </div>
        <Link
          to="/client-onboarding/templates/new"
          className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors no-underline flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-dark-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="text-lg font-semibold text-dark-text mb-2">No templates yet</h3>
          <p className="text-sm text-dark-muted mb-6">Create your first onboarding template to get started</p>
          <Link
            to="/client-onboarding/templates/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors no-underline"
          >
            Create Template
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-dark-text">{template.name}</h3>
                <span className="text-xs text-dark-muted">
                  {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.sections.map(sId => {
                  const s = SECTION_DEFINITIONS.find(sec => sec.id === sId);
                  return (
                    <span key={sId} className="text-xs px-2 py-1 bg-dark-surface text-dark-muted rounded-md">
                      {s?.title || sId}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyLink(template.id)}
                  className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors cursor-pointer"
                >
                  {copiedId === template.id ? 'Copied!' : 'Copy Link'}
                </button>
                <Link
                  to={`/client-onboarding/templates/${template.id}`}
                  className="px-3 py-1.5 text-xs bg-dark-surface text-dark-muted rounded-md hover:text-dark-text transition-colors no-underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(template)}
                  className="px-3 py-1.5 text-xs bg-dark-surface text-dark-muted rounded-md hover:text-dark-text transition-colors cursor-pointer"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-1.5 text-xs text-dark-muted hover:text-danger transition-colors cursor-pointer ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
