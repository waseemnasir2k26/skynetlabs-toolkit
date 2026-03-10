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

const PricingStep = () => {
  const { proposal, updateField } = useProposal();
  const { items, paymentSchedule, discount, currency } = proposal.pricing;

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
