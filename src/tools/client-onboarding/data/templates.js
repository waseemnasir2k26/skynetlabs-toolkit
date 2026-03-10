export const NDA_TEMPLATE = (data = {}) => `
NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into as of ${data.date || '_______________'} ("Effective Date") by and between:

DISCLOSING PARTY:
${data.disclosingParty || 'Skynet Labs'}
${data.disclosingAddress || '_______________'}
Email: ${data.disclosingEmail || '_______________'}

AND

RECEIVING PARTY:
${data.receivingParty || '_______________'}
${data.receivingCompany || ''}
${data.receivingAddress || '_______________'}
Email: ${data.receivingEmail || '_______________'}

1. PURPOSE
The parties wish to explore a potential business relationship concerning: ${data.purpose || 'digital services and software development'} ("Purpose"). In connection with this Purpose, the Disclosing Party may disclose certain confidential and proprietary information to the Receiving Party.

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any and all non-public information, in any form, disclosed by the Disclosing Party to the Receiving Party, including but not limited to:
(a) Business plans, strategies, and financial information;
(b) Customer lists, vendor relationships, and market data;
(c) Software code, algorithms, designs, and technical specifications;
(d) Trade secrets, know-how, and inventions;
(e) Marketing plans, pricing, and sales data;
(f) Any information marked or designated as "confidential" or "proprietary";
(g) All notes, analyses, compilations, and other materials prepared by the Receiving Party that contain or reflect Confidential Information.

3. EXCLUSIONS
Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of the Receiving Party;
(b) Was already known to the Receiving Party prior to disclosure;
(c) Is received from a third party without restriction on disclosure;
(d) Is independently developed by the Receiving Party without use of Confidential Information.

4. OBLIGATIONS OF THE RECEIVING PARTY
The Receiving Party agrees to:
(a) Hold and maintain Confidential Information in strict confidence;
(b) Not disclose Confidential Information to any third party without prior written consent;
(c) Use Confidential Information solely for the Purpose;
(d) Take reasonable measures to protect the confidentiality, at least the same measures used to protect its own confidential information;
(e) Limit access to Confidential Information to those who need to know and who have signed similar non-disclosure agreements.

5. TERM AND TERMINATION
This Agreement shall remain in effect for a period of ${data.duration === 'indefinite' ? 'an indefinite period' : `${data.duration || '2'} year(s)`} from the Effective Date. The obligations of confidentiality shall survive termination of this Agreement.

6. RETURN OF MATERIALS
Upon termination or upon request, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.

7. NO LICENSE
Nothing in this Agreement grants any license or right to use the Confidential Information except as expressly set forth herein.

8. REMEDIES
The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party, entitling the Disclosing Party to seek injunctive relief in addition to any other remedies available at law.

9. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of ${data.jurisdiction || '_______________'}.

10. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof and supersedes all prior agreements or understandings.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

DISCLOSING PARTY:

Signature: ___________________________
Name: ${data.disclosingParty || '_______________'}
Date: ${data.date || '_______________'}

RECEIVING PARTY:

Signature: ___________________________
Name: ${data.receivingParty || '_______________'}
Date: ${data.date || '_______________'}
`;

export const SERVICE_AGREEMENT_TEMPLATE = (data = {}) => `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${data.date || '_______________'} by and between:

SERVICE PROVIDER:
${data.providerName || 'Skynet Labs'}
${data.providerAddress || '_______________'}
Email: ${data.providerEmail || '_______________'}

AND

CLIENT:
${data.clientName || '_______________'}
${data.clientCompany || ''}
${data.clientAddress || '_______________'}
Email: ${data.clientEmail || '_______________'}

1. SCOPE OF WORK
The Service Provider agrees to provide the following services:
${data.scopeOfWork || '_______________'}

Project Type: ${data.projectType || '_______________'}
Estimated Timeline: ${data.timeline || '_______________'}

2. PAYMENT TERMS
Total Project Value: ${data.totalValue || '_______________'}
Payment Structure: ${data.paymentTerms || '_______________'}

Payment Schedule:
${data.paymentSchedule || '- To be determined upon mutual agreement'}

3. REVISION POLICY
The project includes ${data.revisions || '3'} rounds of revisions at no additional cost. Additional revisions will be billed at the Service Provider's standard hourly rate.

4. CANCELLATION & KILL FEE
In the event the Client cancels the project:
- Before work begins: Full refund minus a ${data.killFeePercent || '15'}% administrative fee
- During Phase 1 (Discovery/Planning): ${data.cancelPhase1 || '25'}% of total project value is due
- During Phase 2 (Development/Execution): ${data.cancelPhase2 || '50'}% of total project value is due
- During Phase 3 (Review/Launch): ${data.cancelPhase3 || '75'}% of total project value is due
- After delivery: Full payment is due regardless of client usage

5. PROJECT ABANDONMENT
A project shall be deemed "abandoned" by the Client if:
(a) The Client fails to respond to communications for ${data.abandonmentDays || '14'} consecutive business days;
(b) The Client fails to provide required materials, feedback, or approvals within ${data.materialsDays || '21'} days of request;
(c) The Client fails to make a scheduled payment within ${data.paymentGraceDays || '7'} days of the due date.

In the event of project abandonment:
- All work completed up to the point of abandonment becomes the property of the Service Provider;
- The Client shall be liable for payment of all work completed;
- A ${data.abandonmentFee || '25'}% abandonment fee of the remaining project value shall be due;
- All access credentials shall be changed and access revoked.

6. INTELLECTUAL PROPERTY
Upon full payment of all amounts due:
- All deliverables and work product shall be transferred to the Client;
- The Service Provider retains the right to showcase the work in their portfolio;
- The Service Provider retains ownership of all proprietary tools, templates, and pre-existing materials used.

Prior to full payment, all intellectual property remains the property of the Service Provider.

7. COMMUNICATION EXPECTATIONS
- Response time: The Service Provider will respond to inquiries within ${data.responseTime || '24'} hours during business days;
- Meeting frequency: ${data.meetingFrequency || 'Weekly status updates'};
- Primary communication channel: ${data.commChannel || 'Email'};
- The Client agrees to respond to requests within ${data.clientResponseTime || '48'} hours.

8. LATE PAYMENT PENALTIES
Payments not received within ${data.paymentGraceDays || '7'} days of the due date shall incur:
- A late fee of ${data.lateFeePercent || '5'}% of the overdue amount;
- Additional ${data.dailyLateFee || '1'}% per day for each subsequent day of non-payment;
- Work on the project will be paused after ${data.pauseAfterDays || '14'} days of non-payment;
- After ${data.terminateAfterDays || '30'} days of non-payment, the Agreement may be terminated by the Service Provider.

9. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all proprietary information shared during the course of this project. This obligation survives the termination of this Agreement.

10. LIMITATION OF LIABILITY
The Service Provider's total liability under this Agreement shall not exceed the total fees paid by the Client for the services.

11. DISPUTE RESOLUTION
Any disputes arising from this Agreement shall be resolved through:
(a) Good faith negotiation between the parties;
(b) If unresolved within ${data.negotiationDays || '30'} days, through mediation;
(c) If mediation fails, through binding arbitration in ${data.arbitrationLocation || 'the agreed-upon jurisdiction'}.

12. GOVERNING LAW
This Agreement shall be governed by the laws of ${data.jurisdiction || '_______________'}.

13. ENTIRE AGREEMENT
This Agreement, together with any attachments and the accompanying NDA (if applicable), constitutes the entire agreement between the parties.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

SERVICE PROVIDER:

Signature: ___________________________
Name: ${data.providerName || '_______________'}
Date: ${data.date || '_______________'}

CLIENT:

Signature: ___________________________
Name: ${data.clientName || '_______________'}
Date: ${data.date || '_______________'}
`;
