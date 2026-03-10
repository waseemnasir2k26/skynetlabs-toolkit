import { FormField, TextInput, TextArea, Select, Checkbox } from '../FormField';

export default function PaymentInfoSection({ data = {}, onChange }) {
  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Payment Information</h3>
          <p className="text-xs text-dark-muted">Billing and payment preferences</p>
        </div>
      </div>

      <FormField label="Preferred Payment Method" required>
        <Select
          value={data.paymentMethod}
          onChange={(v) => update('paymentMethod', v)}
          options={[
            'Bank Transfer / Wire',
            'PayPal',
            'Stripe',
            'Credit Card',
            'Check',
            'Cryptocurrency',
            'Zelle',
            'Venmo',
            'Other',
          ]}
          placeholder="Select payment method..."
          required
        />
      </FormField>

      <FormField label="Billing Address" required>
        <TextArea
          value={data.billingAddress}
          onChange={(v) => update('billingAddress', v)}
          placeholder="Full billing address including city, state/province, ZIP/postal code, and country"
          rows={3}
          required
        />
      </FormField>

      {data.paymentMethod === 'Bank Transfer / Wire' && (
        <div className="bg-dark-surface rounded-lg p-5 space-y-4 border border-dark-border">
          <h4 className="text-sm font-semibold text-dark-text">Bank Details (optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Bank Name">
              <TextInput value={data.bankName} onChange={(v) => update('bankName', v)} placeholder="Bank name" />
            </FormField>
            <FormField label="Account Holder">
              <TextInput value={data.accountHolder} onChange={(v) => update('accountHolder', v)} placeholder="Account holder name" />
            </FormField>
          </div>
        </div>
      )}

      {data.paymentMethod === 'PayPal' && (
        <FormField label="PayPal Email">
          <TextInput type="email" value={data.paypalEmail} onChange={(v) => update('paypalEmail', v)} placeholder="paypal@email.com" />
        </FormField>
      )}

      <div className="bg-dark-surface rounded-lg p-5 border border-dark-border space-y-4">
        <h4 className="text-sm font-semibold text-dark-text">Acknowledgments</h4>

        <Checkbox
          checked={data.scheduleAcknowledged}
          onChange={(v) => update('scheduleAcknowledged', v)}
          label="I acknowledge the payment schedule"
          description="I understand that payments are due on the dates specified in the service agreement and that work may be paused if payments are not received on time."
        />

        <Checkbox
          checked={data.latePenaltyAcknowledged}
          onChange={(v) => update('latePenaltyAcknowledged', v)}
          label="I acknowledge the late payment penalties"
          description="I understand that late payments will incur a fee as outlined in the service agreement, and continued non-payment may result in project termination."
        />

        <Checkbox
          checked={data.cancellationAcknowledged}
          onChange={(v) => update('cancellationAcknowledged', v)}
          label="I acknowledge the cancellation / kill fee policy"
          description="I understand that cancelling the project after work has begun will require payment according to the cancellation terms in the service agreement."
        />
      </div>
    </div>
  );
}
