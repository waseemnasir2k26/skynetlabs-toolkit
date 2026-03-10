import { useState, useEffect } from 'react';
import { getAgencyInfo, saveAgencyInfo } from '../utils/storage';
import { FormField, TextInput, TextArea } from '../components/FormField';

export default function Settings() {
  const [info, setInfo] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInfo(getAgencyInfo());
  }, []);

  const update = (key, value) => {
    setInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveAgencyInfo(info);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark-text">Agency Settings</h2>
        <p className="text-sm text-dark-muted mt-1">
          Configure your agency/freelancer details for agreements and documents
        </p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Agency / Freelancer Name" required>
            <TextInput value={info.name} onChange={(v) => update('name', v)} placeholder="Skynet Labs" />
          </FormField>

          <FormField label="Contact Email" required>
            <TextInput type="email" value={info.email} onChange={(v) => update('email', v)} placeholder="hello@skynetjoe.com" />
          </FormField>

          <FormField label="Phone Number">
            <TextInput type="tel" value={info.phone} onChange={(v) => update('phone', v)} placeholder="+1 (555) 000-0000" />
          </FormField>

          <FormField label="Website">
            <TextInput type="url" value={info.website} onChange={(v) => update('website', v)} placeholder="https://www.skynetjoe.com" />
          </FormField>
        </div>

        <FormField label="Business Address">
          <TextArea value={info.address} onChange={(v) => update('address', v)} placeholder="Full business address" rows={2} />
        </FormField>

        <FormField label="Default Jurisdiction / Governing Law">
          <TextInput value={info.jurisdiction} onChange={(v) => update('jurisdiction', v)} placeholder="e.g., State of California, United States" />
        </FormField>

        <FormField label="Tax ID / Registration Number">
          <TextInput value={info.taxId} onChange={(v) => update('taxId', v)} placeholder="EIN, VAT, or registration number" />
        </FormField>

        <div className="pt-4 border-t border-dark-border flex items-center justify-between">
          <div>
            {saved && (
              <span className="text-sm text-primary flex items-center gap-1 animate-fade-in">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Settings saved
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-dark-card border border-dark-border rounded-xl p-5">
        <h4 className="text-sm font-semibold text-dark-text mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About This Tool
        </h4>
        <p className="text-sm text-dark-muted leading-relaxed">
          This Client Onboarding & NDA System is a tool by{' '}
          <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light no-underline">
            Skynet Labs
          </a>.
          All data is stored locally in your browser using localStorage. No data is transmitted to any server.
          For maximum security, we recommend using temporary credentials and changing passwords after project completion.
        </p>
      </div>
    </div>
  );
}
