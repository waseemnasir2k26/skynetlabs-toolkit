import { FormField, TextInput } from '../FormField';
import { SOCIAL_PLATFORMS } from '../../data/sections';

export default function AccessCredentialsSection({ data = {}, onChange }) {
  const update = (section, key, value) => {
    onChange({
      ...data,
      [section]: { ...(data[section] || {}), [key]: value },
    });
  };

  const updateSocialAccount = (platform, key, value) => {
    onChange({
      ...data,
      socialAccounts: {
        ...(data.socialAccounts || {}),
        [platform]: { ...(data.socialAccounts?.[platform] || {}), [key]: value },
      },
    });
  };

  const addCustomAccess = () => {
    const customAccess = [...(data.customAccess || []), { name: '', url: '', username: '', password: '' }];
    onChange({ ...data, customAccess });
  };

  const updateCustomAccess = (idx, key, value) => {
    const customAccess = [...(data.customAccess || [])];
    customAccess[idx] = { ...customAccess[idx], [key]: value };
    onChange({ ...data, customAccess });
  };

  const removeCustomAccess = (idx) => {
    const customAccess = (data.customAccess || []).filter((_, i) => i !== idx);
    onChange({ ...data, customAccess });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Access & Credentials</h3>
          <p className="text-xs text-dark-muted">Platform logins and access details</p>
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
        <svg className="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p className="text-sm text-warning font-medium">Security Notice</p>
          <p className="text-xs text-dark-muted">All credentials are stored locally in your browser only. Data never leaves your device. We recommend using temporary passwords and changing them after the project.</p>
        </div>
      </div>

      {/* Website Hosting */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Website Hosting
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Hosting Provider">
            <TextInput value={data.hosting?.provider} onChange={(v) => update('hosting', 'provider', v)} placeholder="e.g., GoDaddy, Hostinger, AWS" />
          </FormField>
          <FormField label="Login URL">
            <TextInput value={data.hosting?.loginUrl} onChange={(v) => update('hosting', 'loginUrl', v)} placeholder="https://..." />
          </FormField>
          <FormField label="Username">
            <TextInput value={data.hosting?.username} onChange={(v) => update('hosting', 'username', v)} placeholder="Username" />
          </FormField>
          <FormField label="Password">
            <TextInput type="password" value={data.hosting?.password} onChange={(v) => update('hosting', 'password', v)} placeholder="Password" />
          </FormField>
        </div>
      </div>

      {/* Domain Registrar */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Domain Registrar
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Registrar">
            <TextInput value={data.domain?.registrar} onChange={(v) => update('domain', 'registrar', v)} placeholder="e.g., Namecheap, GoDaddy" />
          </FormField>
          <FormField label="Login URL">
            <TextInput value={data.domain?.loginUrl} onChange={(v) => update('domain', 'loginUrl', v)} placeholder="https://..." />
          </FormField>
          <FormField label="Username">
            <TextInput value={data.domain?.username} onChange={(v) => update('domain', 'username', v)} placeholder="Username" />
          </FormField>
          <FormField label="Password">
            <TextInput type="password" value={data.domain?.password} onChange={(v) => update('domain', 'password', v)} placeholder="Password" />
          </FormField>
        </div>
      </div>

      {/* Social Media Accounts */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Social Media Accounts
        </h4>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform} className="grid grid-cols-3 gap-3 items-center">
              <span className="text-sm text-dark-muted">{platform}</span>
              <TextInput
                value={data.socialAccounts?.[platform]?.username}
                onChange={(v) => updateSocialAccount(platform, 'username', v)}
                placeholder="Username/Email"
              />
              <TextInput
                type="password"
                value={data.socialAccounts?.[platform]?.password}
                onChange={(v) => updateSocialAccount(platform, 'password', v)}
                placeholder="Password"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Google Analytics */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Google Analytics / Search Console
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Property ID">
            <TextInput value={data.analytics?.propertyId} onChange={(v) => update('analytics', 'propertyId', v)} placeholder="UA-XXXXXXX or G-XXXXXXX" />
          </FormField>
          <FormField label="Access Email">
            <TextInput type="email" value={data.analytics?.email} onChange={(v) => update('analytics', 'email', v)} placeholder="analytics@company.com" />
          </FormField>
        </div>
      </div>

      {/* Payment Gateway */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Payment Gateway
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Provider">
            <TextInput value={data.payment?.provider} onChange={(v) => update('payment', 'provider', v)} placeholder="e.g., Stripe, PayPal" />
          </FormField>
          <FormField label="Login URL">
            <TextInput value={data.payment?.loginUrl} onChange={(v) => update('payment', 'loginUrl', v)} placeholder="https://..." />
          </FormField>
        </div>
      </div>

      {/* CRM */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          CRM Access
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="CRM Platform">
            <TextInput value={data.crm?.platform} onChange={(v) => update('crm', 'platform', v)} placeholder="e.g., HubSpot, Salesforce" />
          </FormField>
          <FormField label="Login URL">
            <TextInput value={data.crm?.loginUrl} onChange={(v) => update('crm', 'loginUrl', v)} placeholder="https://..." />
          </FormField>
          <FormField label="Username">
            <TextInput value={data.crm?.username} onChange={(v) => update('crm', 'username', v)} placeholder="Username" />
          </FormField>
          <FormField label="Password">
            <TextInput type="password" value={data.crm?.password} onChange={(v) => update('crm', 'password', v)} placeholder="Password" />
          </FormField>
        </div>
      </div>

      {/* Custom Access */}
      <div className="bg-dark-surface rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-dark-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Other Tools / Platforms
          </h4>
          <button
            type="button"
            onClick={addCustomAccess}
            className="text-xs px-3 py-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors cursor-pointer"
          >
            + Add Platform
          </button>
        </div>
        {data.customAccess?.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-dark-bg rounded-lg p-3">
            <FormField label="Platform Name">
              <TextInput value={item.name} onChange={(v) => updateCustomAccess(idx, 'name', v)} placeholder="Platform" />
            </FormField>
            <FormField label="URL">
              <TextInput value={item.url} onChange={(v) => updateCustomAccess(idx, 'url', v)} placeholder="https://..." />
            </FormField>
            <FormField label="Username">
              <TextInput value={item.username} onChange={(v) => updateCustomAccess(idx, 'username', v)} placeholder="Username" />
            </FormField>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormField label="Password">
                  <TextInput type="password" value={item.password} onChange={(v) => updateCustomAccess(idx, 'password', v)} placeholder="Password" />
                </FormField>
              </div>
              <button
                type="button"
                onClick={() => removeCustomAccess(idx)}
                className="mb-0.5 p-2 text-dark-muted hover:text-danger transition-colors self-end cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
