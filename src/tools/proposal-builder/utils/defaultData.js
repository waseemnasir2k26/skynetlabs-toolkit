import { v4 as uuidv4 } from 'uuid';

export const defaultTerms = `1. SCOPE OF WORK
The scope of this project is limited to the deliverables outlined in this proposal. Any additional work requested beyond the agreed scope will be subject to a change order and additional fees.

2. PAYMENT TERMS
Payments are due according to the schedule outlined in the Pricing section. Late payments may incur a fee of 1.5% per month on the outstanding balance. Work will be paused if payments are more than 15 days overdue.

3. TIMELINE
The timeline provided is an estimate based on the information available at the time of this proposal. Delays caused by the client (e.g., late feedback, missing assets) may extend the timeline accordingly.

4. REVISIONS
This proposal includes up to 2 rounds of revisions per deliverable. Additional revisions will be billed at the agreed hourly rate.

5. INTELLECTUAL PROPERTY
Upon full payment, all intellectual property rights for the deliverables will be transferred to the client. Until payment is received in full, all work remains the property of the service provider.

6. CONFIDENTIALITY
Both parties agree to keep confidential any proprietary information shared during the course of this project.

7. TERMINATION
Either party may terminate this agreement with 14 days written notice. The client will be responsible for payment for all work completed up to the date of termination.

8. LIABILITY
The service provider's total liability under this agreement shall not exceed the total project fee. The service provider is not liable for any indirect or consequential damages.

9. ACCEPTANCE
This proposal is valid for 30 days from the date of issue. Acceptance of this proposal constitutes agreement to all terms and conditions outlined herein.`;

export const createEmptyProposal = () => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  template: 'modern-dark',
  yourInfo: {
    name: '',
    company: '',
    email: '',
    logo: null,
    tagline: '',
  },
  clientInfo: {
    name: '',
    company: '',
    email: '',
  },
  project: {
    title: '',
    summary: '',
    objectives: [{ id: uuidv4(), text: '' }],
  },
  deliverables: [
    {
      id: uuidv4(),
      title: '',
      description: '',
      included: true,
    },
  ],
  timeline: {
    phases: [
      {
        id: uuidv4(),
        name: '',
        startDate: '',
        endDate: '',
        milestone: '',
      },
    ],
  },
  pricing: {
    items: [
      {
        id: uuidv4(),
        description: '',
        price: 0,
      },
    ],
    paymentSchedule: '50-50',
    discount: 0,
    currency: 'USD',
    tieredPricing: false,
    tiers: {
      good: {
        name: 'Basic',
        price: 0,
        turnaround: '2 weeks',
        deliverables: [],
      },
      better: {
        name: 'Standard',
        price: 0,
        turnaround: '1 week',
        deliverables: [],
      },
      best: {
        name: 'Premium',
        price: 0,
        turnaround: '3 days',
        deliverables: [],
      },
    },
  },
  terms: defaultTerms,
});

export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};
