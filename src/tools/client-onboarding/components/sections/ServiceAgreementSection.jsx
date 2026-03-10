import { FormField, TextInput, TextArea, Select, Checkbox } from '../FormField';
import { PAYMENT_TERMS } from '../../data/sections';
import { SERVICE_AGREEMENT_TEMPLATE } from '../../data/templates';
import SignaturePad from '../SignaturePad';
import { getAgencyInfo } from '../../utils/storage';

export default function ServiceAgreementSection({ data = {}, onChange, clientInfo = {}, projectDetails = {} }) {
  const agencyInfo = getAgencyInfo();

  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const addPaymentMilestone = () => {
    const milestones = [...(data.milestones || []), { description: '', amount: '', dueDate: '' }];
    update('milestones', milestones);
  };

  const updateMilestone = (idx, key, value) => {
    const milestones = [...(data.milestones || [])];
    milestones[idx] = { ...milestones[idx], [key]: value };
    update('milestones', milestones);
  };

  const removeMilestone = (idx) => {
    const milestones = (data.milestones || []).filter((_, i) => i !== idx);
    update('milestones', milestones);
  };

  const templateData = {
    date: data.dateSigned || new Date().toLocaleDateString(),
    providerName: agencyInfo.name || 'Skynet Labs',
    providerAddress: agencyInfo.address || '',
    providerEmail: agencyInfo.email || '',
    clientName: clientInfo.fullName || '',
    clientCompany: clientInfo.companyName || '',
    clientAddress: clientInfo.address || '',
    clientEmail: clientInfo.email || '',
    scopeOfWork: data.scopeOfWork || projectDetails.description || '',
    projectType: projectDetails.projectType || '',
    timeline: projectDetails.timeline || '',
    totalValue: data.totalValue || '',
    paymentTerms: data.paymentTerms || '',
    paymentSchedule: data.milestones?.map((m, i) =>
      `${i + 1}. ${m.description}: $${m.amount} (Due: ${m.dueDate})`
    ).join('\n') || '- To be determined upon mutual agreement',
    revisions: data.revisions || '3',
    killFeePercent: data.killFeePercent || '15',
    cancelPhase1: data.cancelPhase1 || '25',
    cancelPhase2: data.cancelPhase2 || '50',
    cancelPhase3: data.cancelPhase3 || '75',
    abandonmentDays: data.abandonmentDays || '14',
    materialsDays: data.materialsDays || '21',
    paymentGraceDays: data.paymentGraceDays || '7',
    abandonmentFee: data.abandonmentFee || '25',
    responseTime: data.responseTime || '24',
    meetingFrequency: data.meetingFrequency || 'Weekly status updates',
    commChannel: data.commChannel || clientInfo.preferredChannel || 'Email',
    clientResponseTime: data.clientResponseTime || '48',
    lateFeePercent: data.lateFeePercent || '5',
    dailyLateFee: data.dailyLateFee || '1',
    pauseAfterDays: data.pauseAfterDays || '14',
    terminateAfterDays: data.terminateAfterDays || '30',
    negotiationDays: data.negotiationDays || '30',
    jurisdiction: data.jurisdiction || '',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Service Agreement</h3>
          <p className="text-xs text-dark-muted">Scope, payment terms, and commitment</p>
        </div>
      </div>

      {/* Scope of Work */}
      <FormField label="Scope of Work" required hint="Detailed description of deliverables">
        <TextArea
          value={data.scopeOfWork || projectDetails.description}
          onChange={(v) => update('scopeOfWork', v)}
          placeholder="Describe the exact deliverables and scope of the project..."
          rows={5}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Total Project Value" required>
          <TextInput
            value={data.totalValue}
            onChange={(v) => update('totalValue', v)}
            placeholder="e.g., $5,000"
            required
          />
        </FormField>

        <FormField label="Payment Structure" required>
          <Select
            value={data.paymentTerms}
            onChange={(v) => update('paymentTerms', v)}
            options={PAYMENT_TERMS.map(t => ({ value: t.id, label: `${t.label} - ${t.description}` }))}
            placeholder="Select payment structure..."
            required
          />
        </FormField>
      </div>

      {/* Payment Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-dark-text">Payment Schedule</label>
          <button
            type="button"
            onClick={addPaymentMilestone}
            className="text-xs px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors cursor-pointer"
          >
            + Add Milestone
          </button>
        </div>
        <div className="space-y-3">
          {(data.milestones || []).map((m, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-dark-bg rounded-lg p-3">
              <FormField label="Description">
                <TextInput value={m.description} onChange={(v) => updateMilestone(idx, 'description', v)} placeholder="e.g., Project Kickoff" />
              </FormField>
              <FormField label="Amount">
                <TextInput value={m.amount} onChange={(v) => updateMilestone(idx, 'amount', v)} placeholder="$0.00" />
              </FormField>
              <FormField label="Due Date">
                <TextInput type="date" value={m.dueDate} onChange={(v) => updateMilestone(idx, 'dueDate', v)} />
              </FormField>
              <button
                type="button"
                onClick={() => removeMilestone(idx)}
                className="p-2 text-dark-muted hover:text-danger transition-colors cursor-pointer self-end mb-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Terms Configuration */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4 border border-dark-border">
        <h4 className="text-sm font-semibold text-primary">Anti-Runaway Protection</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Revisions Included" hint="Free revision rounds">
            <TextInput value={data.revisions || '3'} onChange={(v) => update('revisions', v)} placeholder="3" />
          </FormField>
          <FormField label="Kill Fee %" hint="Admin fee if cancelled before start">
            <TextInput value={data.killFeePercent || '15'} onChange={(v) => update('killFeePercent', v)} placeholder="15" />
          </FormField>
          <FormField label="Abandonment Fee %" hint="Fee if client abandons project">
            <TextInput value={data.abandonmentFee || '25'} onChange={(v) => update('abandonmentFee', v)} placeholder="25" />
          </FormField>
          <FormField label="Abandonment Trigger (days)" hint="No response = abandoned">
            <TextInput value={data.abandonmentDays || '14'} onChange={(v) => update('abandonmentDays', v)} placeholder="14" />
          </FormField>
          <FormField label="Late Fee %" hint="% of overdue amount">
            <TextInput value={data.lateFeePercent || '5'} onChange={(v) => update('lateFeePercent', v)} placeholder="5" />
          </FormField>
          <FormField label="Payment Grace Period (days)">
            <TextInput value={data.paymentGraceDays || '7'} onChange={(v) => update('paymentGraceDays', v)} placeholder="7" />
          </FormField>
        </div>
      </div>

      {/* Communication Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Provider Response Time (hours)">
          <TextInput value={data.responseTime || '24'} onChange={(v) => update('responseTime', v)} placeholder="24" />
        </FormField>
        <FormField label="Client Response Time (hours)">
          <TextInput value={data.clientResponseTime || '48'} onChange={(v) => update('clientResponseTime', v)} placeholder="48" />
        </FormField>
        <FormField label="Meeting Frequency">
          <TextInput value={data.meetingFrequency || 'Weekly status updates'} onChange={(v) => update('meetingFrequency', v)} placeholder="Weekly status updates" />
        </FormField>
        <FormField label="Governing Law / Jurisdiction">
          <TextInput value={data.jurisdiction} onChange={(v) => update('jurisdiction', v)} placeholder="e.g., State of California" />
        </FormField>
      </div>

      {/* Agreement Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-dark-text">Agreement Preview</h4>
          <span className="text-xs text-dark-muted">Scroll to read the full agreement</span>
        </div>
        <div className="bg-dark-bg border border-dark-border rounded-lg p-6 max-h-96 overflow-y-auto">
          <pre className="text-xs text-dark-text whitespace-pre-wrap font-sans leading-relaxed">
            {SERVICE_AGREEMENT_TEMPLATE(templateData)}
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
            const updates = { ...data, signature: sig };
            if (!data.dateSigned) updates.dateSigned = new Date().toLocaleDateString();
            onChange(updates);
          }}
          existingSignature={data.signature}
        />

        <Checkbox
          checked={data.agreed}
          onChange={(v) => update('agreed', v)}
          label="I have read and agree to the terms of this Service Agreement"
          description="By checking this box and signing above, you commit to the scope of work, payment terms, cancellation policy, and project abandonment clauses outlined in this agreement."
        />
      </div>
    </div>
  );
}
