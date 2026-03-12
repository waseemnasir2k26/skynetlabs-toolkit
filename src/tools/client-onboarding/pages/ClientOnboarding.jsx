import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { SECTION_DEFINITIONS } from '../data/sections';
import { getTemplates, saveClient } from '../utils/storage';
import { calculateCompletion } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';
import SuccessScreen from '../components/SuccessScreen';

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

export default function ClientOnboarding() {
  const { templateId } = useParams();
  const [sections, setSections] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [clientId] = useState(uuidv4());
  const [submitted, setSubmitted] = useState(false);
  const [templateName, setTemplateName] = useState('Client Onboarding');

  useEffect(() => {
    if (templateId) {
      const templates = getTemplates();
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSections(template.sections);
        setTemplateName(template.name);
      } else {
        setSections(SECTION_DEFINITIONS.filter(s => s.required).map(s => s.id));
      }
    } else {
      setSections(SECTION_DEFINITIONS.map(s => s.id));
    }
  }, [templateId]);

  const currentSectionId = sections[currentStep];
  const currentSectionDef = SECTION_DEFINITIONS.find(s => s.id === currentSectionId);
  const SectionComponent = SECTION_COMPONENTS[currentSectionId];

  const sectionTitles = sections.map(sId => SECTION_DEFINITIONS.find(s => s.id === sId)?.title || '');

  const completion = calculateCompletion(formData, sections);

  const handleSectionChange = (sectionId, data) => {
    setFormData(prev => ({ ...prev, [sectionId]: data }));
  };

  const handleNext = () => {
    // Auto-save
    saveClient({
      id: clientId,
      ...formData,
      sections,
      templateId,
      status: 'in-progress',
    });

    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    saveClient({
      id: clientId,
      ...formData,
      sections,
      templateId,
      status: 'completed',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return <SuccessScreen clientName={formData.clientInfo?.fullName} />;
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }}></div>
          <p className="text-dark-muted">Loading onboarding form...</p>
        </div>
      </div>
    );
  }

  const getSectionProps = () => {
    const props = {
      data: formData[currentSectionId] || {},
      onChange: (data) => handleSectionChange(currentSectionId, data),
    };
    if (currentSectionId === 'nda') {
      props.clientInfo = formData.clientInfo || {};
    }
    if (currentSectionId === 'serviceAgreement') {
      props.clientInfo = formData.clientInfo || {};
      props.projectDetails = formData.projectDetails || {};
    }
    return props;
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Client-facing header */}
      <div className="bg-dark-card/80 backdrop-blur-sm border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-dark-text tracking-wider">SKYNET LABS</p>
                <p className="text-[9px] text-dark-muted tracking-widest uppercase">AI Automation Agency</p>
              </div>
            </div>
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-muted transition-colors hover:opacity-80 no-underline"
            >
              skynetjoe.com
            </a>
          </div>
          <ProgressBar
            currentStep={currentStep}
            totalSteps={sections.length}
            completionPercent={completion}
            sectionTitles={sectionTitles}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8 mb-6">
          {SectionComponent && <SectionComponent {...getSectionProps()} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-5 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-sm text-dark-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="text-sm text-dark-muted hidden sm:block">
            {currentSectionDef?.title}
          </span>

          {currentStep < sections.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
              style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 animate-pulse-glow"
              style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Onboarding
            </button>
          )}
        </div>

        {/* Section Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {sections.map((sId, idx) => {
            const sDef = SECTION_DEFINITIONS.find(s => s.id === sId);
            return (
              <button
                key={sId}
                onClick={() => setCurrentStep(idx)}
                title={sDef?.title}
                className="w-3 h-3 rounded-full transition-all cursor-pointer"
                style={
                  idx === currentStep
                    ? { background: 'var(--accent)', transform: 'scale(1.25)' }
                    : idx < currentStep
                    ? { background: 'var(--accent-soft)' }
                    : { background: 'var(--border)' }
                }
              />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-border py-6 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-dark-muted">
            Powered by{' '}
            <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-80 no-underline" style={{ color: 'var(--accent)' }}>
              Skynet Labs
            </a>
            {' '} | All data is stored securely in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
