import { useProposal } from '../../context/ProposalContext';
import { currencySymbols } from '../../utils/defaultData';

const templateStyles = {
  'modern-dark': {
    bg: '#0f0f18',
    surface: '#171724',
    accent: '#13b973',
    text: '#e0e0e8',
    muted: '#8888a0',
    border: '#2a2a3a',
    heading: '#ffffff',
    coverBg: 'linear-gradient(135deg, #0f0f18 0%, #1a1a30 50%, #0f1a14 100%)',
  },
  'classic-white': {
    bg: '#ffffff',
    surface: '#f8f9fa',
    accent: '#13b973',
    text: '#333333',
    muted: '#666666',
    border: '#e0e0e0',
    heading: '#111111',
    coverBg: 'linear-gradient(135deg, #ffffff 0%, #f0f4f0 50%, #e8f5e9 100%)',
  },
  colorful: {
    bg: '#1a0a2e',
    surface: '#251245',
    accent: '#00e5a0',
    text: '#e0d8f0',
    muted: '#9988cc',
    border: '#3a2a5a',
    heading: '#ffffff',
    coverBg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #0a2e1a 100%)',
  },
};

const scheduleLabels = {
  '50-50': '50% upfront, 50% on completion',
  '30-40-30': '30% upfront, 40% at midpoint, 30% on completion',
  milestone: 'Payments tied to project milestones',
  monthly: 'Equal monthly installments',
  'full-upfront': '100% payment upfront before work begins',
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProposalPreview = () => {
  const { proposal } = useProposal();
  const s = templateStyles[proposal.template] || templateStyles['modern-dark'];
  const sym = currencySymbols[proposal.pricing.currency] || '$';
  const subtotal = proposal.pricing.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
  const discountAmt = subtotal * ((parseFloat(proposal.pricing.discount) || 0) / 100);
  const total = subtotal - discountAmt;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isDark = proposal.template !== 'classic-white';

  return (
    <div
      id="proposal-preview"
      className="proposal-preview"
      style={{
        background: s.bg,
        color: s.text,
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        lineHeight: 1.6,
        minHeight: '100%',
      }}
    >
      {/* Cover Page */}
      <div
        style={{
          background: s.coverBg,
          padding: '60px 40px',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: `3px solid ${s.accent}`,
        }}
      >
        <div style={{ position: 'absolute', top: '30px', left: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {proposal.yourInfo.logo && (
            <img src={proposal.yourInfo.logo} alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
          )}
          <div>
            <div style={{ color: s.heading, fontWeight: 700, fontSize: '14px' }}>
              {proposal.yourInfo.company || proposal.yourInfo.name || 'Your Company'}
            </div>
            {proposal.yourInfo.tagline && (
              <div style={{ color: s.muted, fontSize: '10px' }}>{proposal.yourInfo.tagline}</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <div style={{ color: s.accent, fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Project Proposal
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '32px', fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.2 }}>
            {proposal.project.title || 'Project Title'}
          </h1>
          <div style={{ color: s.muted, fontSize: '13px' }}>
            Prepared for <span style={{ color: s.accent, fontWeight: 600 }}>{proposal.clientInfo.company || proposal.clientInfo.name || 'Client Name'}</span>
          </div>
          <div style={{ color: s.muted, fontSize: '11px', marginTop: '8px' }}>{today}</div>
        </div>

        <div style={{ position: 'absolute', bottom: '30px', right: '40px', textAlign: 'right' }}>
          <div style={{ color: s.muted, fontSize: '10px' }}>Prepared by</div>
          <div style={{ color: s.heading, fontWeight: 600, fontSize: '12px' }}>{proposal.yourInfo.name || 'Your Name'}</div>
          <div style={{ color: s.muted, fontSize: '10px' }}>{proposal.yourInfo.email}</div>
        </div>
      </div>

      {/* Table of Contents */}
      <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', marginBottom: '20px' }}>
          Table of Contents
        </h2>
        {['Project Overview', 'Scope & Deliverables', 'Timeline', 'Pricing', 'Terms & Conditions', 'Acceptance'].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${s.border}` }}>
            <span style={{ color: s.text, fontSize: '12px' }}>{item}</span>
            <span style={{ color: s.muted, fontSize: '11px' }}>{String(i + 1).padStart(2, '0')}</span>
          </div>
        ))}
      </div>

      {/* Project Overview */}
      <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '24px', background: s.accent, borderRadius: '2px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', margin: 0 }}>
            Project Overview
          </h2>
        </div>
        {proposal.project.summary && (
          <p style={{ color: s.text, fontSize: '12px', lineHeight: 1.8, marginBottom: '20px' }}>
            {proposal.project.summary}
          </p>
        )}
        {proposal.project.objectives.some((o) => o.text) && (
          <div>
            <h3 style={{ color: s.heading, fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Objectives</h3>
            <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
              {proposal.project.objectives.filter((o) => o.text).map((obj, i) => (
                <li key={obj.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: s.accent, fontWeight: 700, fontSize: '12px', minWidth: '20px' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: s.text, fontSize: '12px' }}>{obj.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Deliverables */}
      <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '24px', background: s.accent, borderRadius: '2px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', margin: 0 }}>
            Scope & Deliverables
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {proposal.deliverables.filter((d) => d.title).map((del, i) => (
            <div
              key={del.id}
              style={{
                background: s.surface,
                border: `1px solid ${s.border}`,
                borderRadius: '8px',
                padding: '16px',
                borderLeft: `3px solid ${del.included ? s.accent : '#ef4444'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: s.heading, fontWeight: 600, fontSize: '12px' }}>{del.title}</span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: del.included ? `${s.accent}20` : '#ef444420',
                  color: del.included ? s.accent : '#ef4444',
                }}>
                  {del.included ? 'INCLUDED' : 'EXCLUDED'}
                </span>
              </div>
              {del.description && (
                <p style={{ color: s.muted, fontSize: '11px', margin: 0, lineHeight: 1.6 }}>{del.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {proposal.timeline.phases.some((p) => p.name) && (
        <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: s.accent, borderRadius: '2px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', margin: 0 }}>
              Timeline
            </h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: '24px' }}>
            <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '2px', background: s.accent, opacity: 0.3 }} />
            {proposal.timeline.phases.filter((p) => p.name).map((phase, i) => (
              <div key={phase.id} style={{ position: 'relative', marginBottom: '24px', paddingBottom: '4px' }}>
                <div style={{
                  position: 'absolute',
                  left: '-21px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: s.accent,
                  border: `2px solid ${s.bg}`,
                }} />
                <div style={{ color: s.heading, fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                  {phase.name}
                </div>
                {(phase.startDate || phase.endDate) && (
                  <div style={{ color: s.accent, fontSize: '10px', fontWeight: 500, marginBottom: '4px' }}>
                    {formatDate(phase.startDate)}{phase.startDate && phase.endDate ? ' - ' : ''}{formatDate(phase.endDate)}
                  </div>
                )}
                {phase.milestone && (
                  <div style={{ color: s.muted, fontSize: '11px' }}>
                    Milestone: {phase.milestone}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '24px', background: s.accent, borderRadius: '2px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', margin: 0 }}>
            Pricing
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${s.accent}` }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: s.heading, fontSize: '11px', fontWeight: 600 }}>Description</th>
              <th style={{ textAlign: 'right', padding: '8px 0', color: s.heading, fontSize: '11px', fontWeight: 600, width: '120px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {proposal.pricing.items.filter((i) => i.description).map((item) => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${s.border}` }}>
                <td style={{ padding: '10px 0', color: s.text, fontSize: '12px' }}>{item.description}</td>
                <td style={{ padding: '10px 0', color: s.text, fontSize: '12px', textAlign: 'right', fontWeight: 500 }}>
                  {sym}{(parseFloat(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
            <span style={{ color: s.muted, fontSize: '11px' }}>Subtotal</span>
            <span style={{ color: s.text, fontSize: '11px', fontWeight: 500 }}>{sym}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          {discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
              <span style={{ color: s.muted, fontSize: '11px' }}>Discount ({proposal.pricing.discount}%)</span>
              <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 500 }}>-{sym}{discountAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', borderTop: `2px solid ${s.accent}`, paddingTop: '8px', marginTop: '4px' }}>
            <span style={{ color: s.heading, fontSize: '14px', fontWeight: 700 }}>Total</span>
            <span style={{ color: s.accent, fontSize: '14px', fontWeight: 700 }}>{sym}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', background: s.surface, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '14px' }}>
          <div style={{ color: s.heading, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Payment Schedule</div>
          <div style={{ color: s.muted, fontSize: '11px' }}>{scheduleLabels[proposal.pricing.paymentSchedule]}</div>
        </div>
      </div>

      {/* Terms */}
      <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '24px', background: s.accent, borderRadius: '2px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', margin: 0 }}>
            Terms & Conditions
          </h2>
        </div>
        <div style={{ color: s.muted, fontSize: '10px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {proposal.terms}
        </div>
      </div>

      {/* Signature / Acceptance */}
      <div style={{ padding: '40px', borderBottom: `1px solid ${s.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '24px', background: s.accent, borderRadius: '2px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: s.heading, fontSize: '18px', margin: 0 }}>
            Acceptance
          </h2>
        </div>
        <p style={{ color: s.muted, fontSize: '11px', marginBottom: '24px', lineHeight: 1.6 }}>
          By signing below, you acknowledge that you have read, understood, and agree to the terms outlined in this proposal.
        </p>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ color: s.heading, fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>Client</div>
            <div style={{ borderBottom: `1px solid ${s.border}`, paddingBottom: '30px', marginBottom: '6px' }} />
            <div style={{ color: s.muted, fontSize: '10px' }}>Signature</div>
            <div style={{ borderBottom: `1px solid ${s.border}`, paddingBottom: '20px', marginBottom: '6px', marginTop: '12px' }} />
            <div style={{ color: s.muted, fontSize: '10px' }}>Date</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ color: s.heading, fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>Service Provider</div>
            <div style={{ borderBottom: `1px solid ${s.border}`, paddingBottom: '30px', marginBottom: '6px' }} />
            <div style={{ color: s.muted, fontSize: '10px' }}>Signature</div>
            <div style={{ borderBottom: `1px solid ${s.border}`, paddingBottom: '20px', marginBottom: '6px', marginTop: '12px' }} />
            <div style={{ color: s.muted, fontSize: '10px' }}>Date</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px 40px', textAlign: 'center' }}>
        <div style={{ color: s.muted, fontSize: '10px', marginBottom: '6px' }}>
          Powered by <span style={{ color: s.accent, fontWeight: 600 }}>Skynet Labs</span>
        </div>
        <div style={{ color: s.muted, fontSize: '9px' }}>
          Need help with your project?{' '}
          <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" style={{ color: s.accent, textDecoration: 'none' }}>
            Visit skynetjoe.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProposalPreview;
