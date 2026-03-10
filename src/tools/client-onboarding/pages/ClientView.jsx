import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, saveClient } from '../utils/storage';
import { generateClientPDF } from '../utils/pdf';
import { calculateCompletion } from '../utils/storage';
import { SECTION_DEFINITIONS, STATUS_OPTIONS } from '../data/sections';

import ClientInfoSection from '../components/sections/ClientInfoSection';
import ProjectDetailsSection from '../components/sections/ProjectDetailsSection';
import AccessCredentialsSection from '../components/sections/AccessCredentialsSection';
import BrandAssetsSection from '../components/sections/BrandAssetsSection';
import ContentMediaSection from '../components/sections/ContentMediaSection';
import NDASection from '../components/sections/NDASection';
import ServiceAgreementSection from '../components/sections/ServiceAgreementSection';
import PaymentInfoSection from '../components/sections/PaymentInfoSection';

const SECTION_COMPONENTS = {
  clientInfo: ClientInfoSection,
  projectDetails: ProjectDetailsSection,
  accessCredentials: AccessCredentialsSection,
  brandAssets: BrandAssetsSection,
  contentMedia: ContentMediaSection,
  nda: NDASection,
  serviceAgreement: ServiceAgreementSection,
  paymentInfo: PaymentInfoSection,
};

export default function ClientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const c = getClient(id);
    if (!c) {
      navigate('/client-onboarding');
      return;
    }
    setClient(c);
  }, [id]);

  if (!client) return null;

  const sections = client.sections || SECTION_DEFINITIONS.map(s => s.id);
  const completion = calculateCompletion(client, sections);

  const handleSectionChange = (sectionId, data) => {
    const updated = { ...client, [sectionId]: data };
    setClient(updated);
    saveClient(updated);
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleStatusChange = (status) => {
    const updated = { ...client, status };
    setClient(updated);
    saveClient(updated);
  };

  const handleDownloadPDF = async () => {
    await generateClientPDF(client);
  };

  const getSectionProps = (sectionId) => {
    const props = {
      data: client[sectionId] || {},
      onChange: (data) => handleSectionChange(sectionId, data),
    };
    if (sectionId === 'nda') {
      props.clientInfo = client.clientInfo || {};
    }
    if (sectionId === 'serviceAgreement') {
      props.clientInfo = client.clientInfo || {};
      props.projectDetails = client.projectDetails || {};
    }
    return props;
  };

  const isSectionComplete = (sectionId) => {
    const data = client[sectionId];
    if (!data) return false;
    switch (sectionId) {
      case 'clientInfo': return !!(data.fullName && data.email);
      case 'projectDetails': return !!(data.projectType && data.description);
      case 'accessCredentials': return Object.keys(data).length > 0;
      case 'brandAssets': return !!(data.logos?.length > 0 || data.colors?.length > 0);
      case 'contentMedia': return !!data.companyBio;
      case 'nda': return !!(data.signature && data.agreed);
      case 'serviceAgreement': return !!(data.signature && data.agreed);
      case 'paymentInfo': return !!(data.paymentMethod && data.billingAddress);
      default: return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/client-onboarding')}
          className="text-sm text-dark-muted hover:text-primary transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>
        {saving && (
          <span className="text-xs text-primary ml-auto animate-fade-in">Saved</span>
        )}
      </div>

      {/* Client Header Card */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-text">
              {client.clientInfo?.fullName || 'Unnamed Client'}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-dark-muted">
              {client.clientInfo?.companyName && <span>{client.clientInfo.companyName}</span>}
              {client.clientInfo?.email && <span>{client.clientInfo.email}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={client.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border bg-transparent cursor-pointer focus:outline-none"
              style={{
                borderColor: STATUS_OPTIONS.find(s => s.value === client.status)?.color,
                color: STATUS_OPTIONS.find(s => s.value === client.status)?.color,
              }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="mt-4 pt-4 border-t border-dark-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-dark-muted">Completion</span>
            <span className="text-primary font-semibold">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-dark to-primary-light rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-3">
        {sections.map((sectionId) => {
          const sectionDef = SECTION_DEFINITIONS.find(s => s.id === sectionId);
          const isExpanded = expandedSection === sectionId;
          const isComplete = isSectionComplete(sectionId);
          const SectionComponent = SECTION_COMPONENTS[sectionId];

          return (
            <div
              key={sectionId}
              className={`bg-dark-card border rounded-xl overflow-hidden transition-colors ${
                isExpanded ? 'border-primary/30' : 'border-dark-border'
              }`}
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : sectionId)}
                className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer bg-transparent border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-primary' : 'bg-dark-surface border border-dark-border'
                  }`}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-dark-muted/50" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-dark-text">{sectionDef?.title}</h3>
                    <p className="text-xs text-dark-muted">{sectionDef?.description}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-dark-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && SectionComponent && (
                <div className="px-5 pb-6 pt-2 border-t border-dark-border">
                  <SectionComponent {...getSectionProps(sectionId)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
