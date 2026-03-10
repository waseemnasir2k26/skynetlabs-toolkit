import { FormField, TextInput, Select } from '../FormField';
import { SOCIAL_PLATFORMS } from '../../data/sections';

export default function ClientInfoSection({ data = {}, onChange }) {
  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const updateSocial = (platform, value) => {
    onChange({
      ...data,
      socialMedia: { ...(data.socialMedia || {}), [platform]: value },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Client Information</h3>
          <p className="text-xs text-dark-muted">Your contact and company details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Full Legal Name" required>
          <TextInput value={data.fullName} onChange={(v) => update('fullName', v)} placeholder="John Doe" required />
        </FormField>

        <FormField label="Company Name">
          <TextInput value={data.companyName} onChange={(v) => update('companyName', v)} placeholder="Acme Corp" />
        </FormField>

        <FormField label="Company Registration Number">
          <TextInput value={data.registrationNumber} onChange={(v) => update('registrationNumber', v)} placeholder="REG-12345" />
        </FormField>

        <FormField label="Email Address" required>
          <TextInput type="email" value={data.email} onChange={(v) => update('email', v)} placeholder="john@company.com" required />
        </FormField>

        <FormField label="Phone Number" required>
          <TextInput type="tel" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+1 (555) 000-0000" required />
        </FormField>

        <FormField label="Website URL">
          <TextInput type="url" value={data.website} onChange={(v) => update('website', v)} placeholder="https://www.company.com" />
        </FormField>
      </div>

      <FormField label="Full Address" required>
        <TextInput value={data.address} onChange={(v) => update('address', v)} placeholder="123 Main St, City, State, ZIP, Country" required />
      </FormField>

      <FormField label="Preferred Communication Channel">
        <Select
          value={data.preferredChannel}
          onChange={(v) => update('preferredChannel', v)}
          placeholder="Select preferred channel..."
          options={['Email', 'Phone', 'WhatsApp', 'Slack', 'Microsoft Teams', 'Zoom', 'Discord', 'Telegram']}
        />
      </FormField>

      <div>
        <h4 className="text-sm font-semibold text-dark-text mb-3">Social Media Handles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform} className="flex items-center gap-2">
              <span className="text-xs text-dark-muted w-24 shrink-0">{platform}</span>
              <TextInput
                value={data.socialMedia?.[platform]}
                onChange={(v) => updateSocial(platform, v)}
                placeholder={`@handle`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
