import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProposal } from '../../context/ProposalContext';
import { currencySymbols } from '../../utils/defaultData';

const scheduleOptions = [
  { value: '50-50', label: '50/50', desc: '50% upfront, 50% on completion' },
  { value: '30-40-30', label: '30/40/30', desc: '30% upfront, 40% midpoint, 30% completion' },
  { value: 'milestone', label: 'Milestone', desc: 'Payment tied to project milestones' },
  { value: 'monthly', label: 'Monthly', desc: 'Equal monthly installments' },
  { value: 'full-upfront', label: '100% Upfront', desc: 'Full payment before work begins' },
];

const TIER_KEYS = ['good', 'better', 'best'];
const TIER_LABELS = { good: 'Good', better: 'Better', best: 'Best' };
const TIER_DEFAULTS = { good: 'Basic', better: 'Standard', best: 'Premium' };

const PricingStep = () => {
  const { proposal, updateField } = useProposal();
  const { items, paymentSchedule, discount, currency, tieredPricing, tiers } = proposal.pricing;
  const [newDeliverable, setNewDeliverable] = useState({ good: '', better: '', best: '' });

  // Ensure tiers exist (backward compat with old proposals)
  const safeTiers = tiers || {
    good: { name: 'Basic', price: 0, turnaround: '2 weeks', deliverables: [] },
    better: { name: 'Standard', price: 0, turnaround: '1 week', deliverables: [] },
    best: { name: 'Premium', price: 0, turnaround: '3 days', deliverables: [] },
  };

  const addItem = () => {
    updateField('pricing', 'items', [
      ...items,
      { id: uuidv4(), description: '', price: 0 },
    ]);
  };

  const removeItem = (id) => {
    if (items.length <= 1) return;
    updateField('pricing', 'items', items.filter((i) => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    updateField(
      'pricing',
      'items',
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const updateTier = (tierKey, field, value) => {
    updateField('pricing', 'tiers', {
      ...safeTiers,
      [tierKey]: { ...safeTiers[tierKey], [field]: value },
    });
  };

  const addTierDeliverable = (tierKey) => {
    const text = newDeliverable[tierKey]?.trim();
    if (!text) return;
    const currentDeliverables = safeTiers[tierKey].deliverables || [];
    updateTier(tierKey, 'deliverables', [...currentDeliverables, { id: uuidv4(), text }]);
    setNewDeliverable((prev) => ({ ...prev, [tierKey]: '' }));
  };

  const removeTierDeliverable = (tierKey, delId) => {
    const currentDeliverables = safeTiers[tierKey].deliverables || [];
    updateTier(tierKey, 'deliverables', currentDeliverables.filter((d) => d.id !== delId));
  };

  // Cascade deliverables: Better includes Good, Best includes Better
  const getInheritedDeliverables = (tierKey) => {
    const goodDels = safeTiers.good.deliverables || [];
    const betterDels = safeTiers.better.deliverables || [];
    const bestDels = safeTiers.best.deliverables || [];
    if (tierKey === 'good') return goodDels;
    if (tierKey === 'better') return [...goodDels, ...betterDels];
    return [...goodDels, ...betterDels, ...bestDels];
  };

  const getOwnDeliverables = (tierKey) => {
    return safeTiers[tierKey].deliverables || [];
  };

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
  const discountAmount = subtotal * ((parseFloat(discount) || 0) / 100);
  const total = subtotal - discountAmount;
  const sym = currencySymbols[currency] || '$';

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Pricing</h2>
        <p className="text-dark-muted">Set your line items, payment schedule, and any discounts.</p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <label className="text-sm text-dark-muted">Currency:</label>
        <select
          value={currency}
          onChange={(e) => updateField('pricing', 'currency', e.target.value)}
          className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition"
        >
          {Object.entries(currencySymbols).map(([code, symbol]) => (
            <option key={code} value={code}>{code} ({symbol})</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <span className="text-dark-muted text-sm min-w-[20px]">{index + 1}.</span>
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              placeholder="Item description..."
              className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm">{sym}</span>
              <input
                type="number"
                value={item.price || ''}
                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                placeholder="0"
                className="w-32 bg-dark-surface border border-dark-border rounded-lg pl-7 pr-3 py-2.5 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm text-right"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              disabled={items.length <= 1}
              className="p-1.5 text-dark-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-primary hover:text-primary-light text-sm font-medium transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Line Item
      </button>

      <div className="border-t border-dark-border pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-dark-muted text-sm">Subtotal</span>
          <span className="text-white font-medium">{sym}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-dark-muted text-sm">Discount (%)</span>
          <input
            type="number"
            value={discount || ''}
            onChange={(e) => updateField('pricing', 'discount', e.target.value)}
            placeholder="0"
            min="0"
            max="100"
            className="w-20 bg-dark-surface border border-dark-border rounded-lg px-3 py-1.5 text-white text-sm text-right focus:outline-none focus:border-primary transition"
          />
          {discountAmount > 0 && (
            <span className="text-red-400 text-sm">-{sym}{discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-dark-border pt-3">
          <span className="text-white font-bold text-lg">Total</span>
          <span className="text-primary font-bold text-xl">{sym}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Tiered Pricing Toggle */}
      <div className="border-t border-dark-border pt-5">
        <label className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-lg bg-dark-surface border border-dark-border">
          <input
            type="checkbox"
            checked={tieredPricing || false}
            onChange={(e) => updateField('pricing', 'tieredPricing', e.target.checked)}
            className="accent-primary"
          />
          <div>
            <span className="text-sm font-medium text-white">Enable Good / Better / Best Pricing</span>
            <p className="text-xs text-dark-muted mt-0.5">Show a 3-tier pricing comparison table in your proposal</p>
          </div>
        </label>
      </div>

      {/* Tiered Pricing Section */}
      {tieredPricing && (
        <div className="border-t border-dark-border pt-5 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Package Tiers</h3>
            <p className="text-dark-muted text-xs">
              Define three pricing packages. Deliverables cascade upward: Better includes everything in Good, Best includes everything in Better.
            </p>
          </div>

          <div className="space-y-6">
            {TIER_KEYS.map((tierKey) => {
              const tier = safeTiers[tierKey];
              const ownDeliverables = getOwnDeliverables(tierKey);
              const inheritedDeliverables = getInheritedDeliverables(tierKey);
              const inheritedFromBelow = tierKey === 'good' ? [] : tierKey === 'better' ? (safeTiers.good.deliverables || []) : [...(safeTiers.good.deliverables || []), ...(safeTiers.better.deliverables || [])];
              const isBetter = tierKey === 'better';

              return (
                <div
                  key={tierKey}
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: 'var(--bg-elevated, #171724)',
                    border: isBetter ? '2px solid var(--accent, #13b973)' : '1px solid var(--border, #2a2a3a)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: isBetter ? 'var(--accent, #13b973)' : 'var(--bg-card, #0f0f18)',
                          color: isBetter ? 'var(--text-on-accent, #000)' : 'var(--text-muted, #8888a0)',
                        }}
                      >
                        {TIER_LABELS[tierKey].toUpperCase()}
                      </span>
                      {isBetter && (
                        <span className="text-[10px] font-bold text-primary">MOST POPULAR</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-dark-muted mb-1">Package Name</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => updateTier(tierKey, 'name', e.target.value)}
                        placeholder={TIER_DEFAULTS[tierKey]}
                        className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-muted mb-1">Price ({sym})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm">{sym}</span>
                        <input
                          type="number"
                          value={tier.price || ''}
                          onChange={(e) => updateTier(tierKey, 'price', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full bg-dark-card border border-dark-border rounded-lg pl-7 pr-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-dark-muted mb-1">Turnaround</label>
                      <input
                        type="text"
                        value={tier.turnaround}
                        onChange={(e) => updateTier(tierKey, 'turnaround', e.target.value)}
                        placeholder="e.g., 2 weeks"
                        className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Inherited deliverables (read-only) */}
                  {inheritedFromBelow.length > 0 && (
                    <div>
                      <label className="block text-xs text-dark-muted mb-1.5">
                        Inherited from {tierKey === 'better' ? 'Good' : 'Good + Better'}
                      </label>
                      <div className="space-y-1">
                        {inheritedFromBelow.map((del) => (
                          <div key={del.id} className="flex items-center gap-2 px-2 py-1 rounded text-xs" style={{ background: 'rgba(19, 185, 115, 0.08)' }}>
                            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent, #13b973)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-dark-muted">{del.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Own deliverables */}
                  <div>
                    <label className="block text-xs text-dark-muted mb-1.5">
                      {tierKey === 'good' ? 'Deliverables' : 'Additional Deliverables'}
                    </label>
                    <div className="space-y-1.5">
                      {ownDeliverables.map((del) => (
                        <div key={del.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-dark-card border border-dark-border text-sm">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent, #13b973)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="flex-1 text-white text-xs">{del.text}</span>
                          <button
                            onClick={() => removeTierDeliverable(tierKey, del.id)}
                            className="p-0.5 text-dark-muted hover:text-red-400 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newDeliverable[tierKey] || ''}
                        onChange={(e) => setNewDeliverable((prev) => ({ ...prev, [tierKey]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTierDeliverable(tierKey);
                          }
                        }}
                        placeholder="Add deliverable..."
                        className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-xs"
                      />
                      <button
                        onClick={() => addTierDeliverable(tierKey)}
                        disabled={!newDeliverable[tierKey]?.trim()}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg disabled:opacity-30 transition"
                        style={{ background: 'var(--accent, #13b973)', color: 'var(--text-on-accent, #000)' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-dark-border pt-5">
        <label className="block text-sm font-medium text-dark-muted mb-3">Payment Schedule</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scheduleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateField('pricing', 'paymentSchedule', opt.value)}
              className={`text-left p-3 rounded-lg border transition ${
                paymentSchedule === opt.value
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-dark-border bg-dark-surface text-dark-muted hover:border-dark-muted'
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingStep;
