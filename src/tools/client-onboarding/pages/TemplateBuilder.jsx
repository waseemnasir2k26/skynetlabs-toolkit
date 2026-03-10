import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { SECTION_DEFINITIONS } from '../data/sections';
import { getTemplates, saveTemplate } from '../utils/storage';
import { generateShareLink } from '../utils/storage';

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('');
  const [selectedSections, setSelectedSections] = useState(
    SECTION_DEFINITIONS.filter(s => s.required).map(s => s.id)
  );
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      const templates = getTemplates();
      const template = templates.find(t => t.id === id);
      if (template) {
        setTemplateName(template.name);
        setSelectedSections(template.sections);
      }
    }
  }, [id]);

  const toggleSection = (sectionId) => {
    const section = SECTION_DEFINITIONS.find(s => s.id === sectionId);
    if (section?.required) return;

    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const templateId = id || uuidv4();
    saveTemplate({
      id: templateId,
      name: templateName.trim(),
      sections: selectedSections,
    });

    const link = generateShareLink(templateId);
    setShareLink(link);
    setSaved(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSectionIcon = (iconName) => {
    const icons = {
      user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
      key: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
      palette: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
      image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
      'file-text': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      'credit-card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    };
    return icons[iconName] || icons.user;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/client-onboarding/templates')}
          className="text-sm text-dark-muted hover:text-primary transition-colors mb-4 flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Templates
        </button>
        <h2 className="text-2xl font-bold text-dark-text">{id ? 'Edit' : 'Create'} Onboarding Template</h2>
        <p className="text-sm text-dark-muted mt-1">
          Select which sections to include in the client onboarding form
        </p>
      </div>

      {/* Template Name */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-dark-text mb-2">Template Name</label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g., Full Onboarding, Quick Start, Website Project..."
          className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-sm"
        />
      </div>

      {/* Section Selection */}
      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider">Sections</h3>
        {SECTION_DEFINITIONS.map((section) => {
          const isSelected = selectedSections.includes(section.id);
          return (
            <div
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`bg-dark-card border rounded-xl p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-dark-border hover:border-dark-muted/50'
              } ${section.required ? 'cursor-default' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-primary/20' : 'bg-dark-surface'
                }`}>
                  <svg className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-dark-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {getSectionIcon(section.icon)}
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${isSelected ? 'text-dark-text' : 'text-dark-muted'}`}>
                      {section.title}
                    </h4>
                    {section.required && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium">REQUIRED</span>
                    )}
                  </div>
                  <p className="text-xs text-dark-muted mt-0.5">{section.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary bg-primary' : 'border-dark-border'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6">
        <h4 className="text-sm font-semibold text-dark-text mb-2">Template Summary</h4>
        <p className="text-sm text-dark-muted">
          {selectedSections.length} of {SECTION_DEFINITIONS.length} sections selected
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedSections.map(sId => {
            const s = SECTION_DEFINITIONS.find(sec => sec.id === sId);
            return (
              <span key={sId} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                {s?.title}
              </span>
            );
          })}
        </div>
      </div>

      {/* Save & Generate Link */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          {saved ? 'Update & Regenerate Link' : 'Save Template & Generate Link'}
        </button>

        {shareLink && (
          <div className="bg-dark-card border border-primary/30 rounded-xl p-5 animate-fade-in">
            <h4 className="text-sm font-semibold text-primary mb-2">Shareable Client Link</h4>
            <p className="text-xs text-dark-muted mb-3">Share this link with your client to fill out the onboarding form:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text text-sm"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
