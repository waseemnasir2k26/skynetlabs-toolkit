import { FormField, TextInput, TextArea, Select, Checkbox } from '../FormField';
import { NDA_DURATIONS } from '../../data/sections';
import { NDA_TEMPLATE } from '../../data/templates';
import SignaturePad from '../SignaturePad';
import { getAgencyInfo } from '../../utils/storage';

export default function NDASection({ data = {}, onChange, clientInfo = {} }) {
  const agencyInfo = getAgencyInfo();

  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const templateData = {
    date: data.dateSigned || new Date().toLocaleDateString(),
    disclosingParty: agencyInfo.name || 'Skynet Labs',
    disclosingAddress: agencyInfo.address || '',
    disclosingEmail: agencyInfo.email || '',
    receivingParty: clientInfo.fullName || '',
    receivingCompany: clientInfo.companyName || '',
    receivingAddress: clientInfo.address || '',
    receivingEmail: clientInfo.email || '',
    purpose: data.purpose || 'digital services and software development',
    duration: data.duration || '2',
    jurisdiction: data.jurisdiction || '',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Non-Disclosure Agreement</h3>
          <p className="text-xs text-dark-muted">Mutual confidentiality protection</p>
        </div>
      </div>

      {/* NDA Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Duration" required>
          <Select
            value={data.duration}
            onChange={(v) => update('duration', v)}
            options={NDA_DURATIONS}
            placeholder="Select duration..."
            required
          />
        </FormField>

        <FormField label="Governing Law / Jurisdiction" required>
          <TextInput
            value={data.jurisdiction}
            onChange={(v) => update('jurisdiction', v)}
            placeholder="e.g., State of California, United States"
            required
          />
        </FormField>
      </div>

      <FormField label="Purpose of Disclosure">
        <TextArea
          value={data.purpose}
          onChange={(v) => update('purpose', v)}
          placeholder="Describe the purpose of sharing confidential information..."
          rows={3}
        />
      </FormField>

      {/* NDA Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-dark-text">Agreement Preview</h4>
          <span className="text-xs text-dark-muted">Scroll to read the full agreement</span>
        </div>
        <div className="bg-dark-bg border border-dark-border rounded-lg p-6 max-h-96 overflow-y-auto">
          <pre className="text-xs text-dark-text whitespace-pre-wrap font-sans leading-relaxed">
            {NDA_TEMPLATE(templateData)}
          </pre>
        </div>
      </div>

      {/* Signature */}
      <div className="bg-dark-surface rounded-lg p-5 border border-dark-border space-y-4">
        <h4 className="text-sm font-semibold text-dark-text">Sign the Agreement</h4>

        <div className="flex items-center gap-3">
          <span className="text-sm text-dark-muted">Date:</span>
          <span className="text-sm text-dark-text font-medium">
            {data.dateSigned || new Date().toLocaleDateString()}
          </span>
        </div>

        <SignaturePad
          onSignatureChange={(sig) => {
            update('signature', sig);
            if (!data.dateSigned) update('dateSigned', new Date().toLocaleDateString());
          }}
          existingSignature={data.signature}
        />

        <Checkbox
          checked={data.agreed}
          onChange={(v) => update('agreed', v)}
          label="I have read and agree to the terms of this Non-Disclosure Agreement"
          description="By checking this box and signing above, you acknowledge that this constitutes a legally binding agreement."
        />
      </div>
    </div>
  );
}
