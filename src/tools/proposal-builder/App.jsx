import { useState, useCallback } from 'react';
import { ProposalProvider, useProposal } from './context/ProposalContext';
import ProgressBar from './components/ProgressBar';
import TemplateSelector from './components/TemplateSelector';
import ProposalPreview from './components/preview/ProposalPreview';
import ProposalHistory from './components/ProposalHistory';
import YourInfoStep from './components/steps/YourInfoStep';
import ClientInfoStep from './components/steps/ClientInfoStep';
import ProjectOverviewStep from './components/steps/ProjectOverviewStep';
import DeliverablesStep from './components/steps/DeliverablesStep';
import TimelineStep from './components/steps/TimelineStep';
import PricingStep from './components/steps/PricingStep';
import TermsStep from './components/steps/TermsStep';
import { exportToPDF } from './utils/pdfExport';
import { createEmptyProposal } from './utils/defaultData';
import { useToast } from '../shared/Toast';

const TOTAL_STEPS = 7;

const stepComponents = [
  YourInfoStep,
  ClientInfoStep,
  ProjectOverviewStep,
  DeliverablesStep,
  TimelineStep,
  PricingStep,
  TermsStep,
];

function AppContent() {
  const { currentStep, setStep, saveProposal, setProposal, proposal } = useProposal();
  const [showHistory, setShowHistory] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const toast = useToast();

  const StepComponent = stepComponents[currentStep];

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) setStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  const handleSave = useCallback(() => {
    setSaving(true);
    try {
      saveProposal();
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
      if (toast) toast('Proposal saved!', 'success');
    } finally {
      setSaving(false);
    }
  }, [saveProposal]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const filename = `${proposal.project.title || 'Proposal'} - ${proposal.clientInfo.company || proposal.clientInfo.name || 'Client'}.pdf`;
      await exportToPDF('proposal-preview', filename);
      if (toast) toast('Proposal exported as PDF!', 'success');
    } finally {
      setExporting(false);
    }
  }, [proposal]);

  const handleNewProposal = () => {
    if (confirm('Start a new proposal? Any unsaved changes will be lost.')) {
      setProposal(createEmptyProposal());
      setStep(0);
    }
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* Tool sub-header */}
      <div className="border-b px-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Proposal Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 transition rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            title="Saved Proposals"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
          <button
            onClick={handleNewProposal}
            className="p-2 transition rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            title="New Proposal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {saveMsg ? (
              <span className="font-medium" style={{ color: 'var(--accent)' }}>{saveMsg}</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
          >
            {exporting ? (
              <span>Exporting...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        {/* Form Panel */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col border-r-0 lg:border-r" style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <ProgressBar currentStep={currentStep} onStepClick={setStep} />
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <StepComponent />
          </div>
          <div className="p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={handleSave}
                className="sm:hidden flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm transition"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {saveMsg ? (
                  <span className="text-xs" style={{ color: 'var(--accent)' }}>{saveMsg}</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === TOTAL_STEPS - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition"
                style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`w-full lg:w-1/2 xl:w-[55%] flex flex-col ${showPreviewMobile ? 'block' : 'hidden lg:flex'}`} style={{ background: 'var(--bg-card)' }}>
          <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>Live Preview</h3>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            </div>
            <TemplateSelector />
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-[700px] mx-auto rounded-lg overflow-hidden shadow-2xl border" style={{ borderColor: 'var(--border)' }}>
              <ProposalPreview />
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && <ProposalHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
}

function App() {
  return (
    <ProposalProvider>
      <AppContent />
    </ProposalProvider>
  );
}

export default App;
