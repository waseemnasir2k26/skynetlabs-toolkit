import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './helpers';
import { getNextChangeOrderNumber } from './storage';

export async function generateChangeOrderPDF(project, selectedRequests, stats) {
  const orderNumber = getNextChangeOrderNumber();
  const today = new Date().toISOString().split('T')[0];

  const container = document.createElement('div');
  container.id = 'change-order-render';
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:800px;background:#ffffff;color:#1a1a2e;font-family:Inter,Helvetica,Arial,sans-serif;padding:48px;';

  const totalAdditionalHours = selectedRequests.reduce(
    (s, r) => s + (parseFloat(r.hours) || 0),
    0
  );
  const totalAdditionalCost = selectedRequests.reduce(
    (s, r) => s + (parseFloat(r.hours) || 0) * stats.rate,
    0
  );
  const totalTimelineImpact = selectedRequests.reduce(
    (s, r) => s + (parseFloat(r.timelineImpact) || 0),
    0
  );
  const newProjectTotal =
    (parseFloat(project.contractValue) || stats.originalValue) +
    totalAdditionalCost;

  const requestRows = selectedRequests
    .map(
      (r, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px 8px;font-size:13px;">${i + 1}</td>
      <td style="padding:12px 8px;font-size:13px;">${r.description}</td>
      <td style="padding:12px 8px;font-size:13px;text-align:center;">${r.category}</td>
      <td style="padding:12px 8px;font-size:13px;text-align:center;">${r.priority}</td>
      <td style="padding:12px 8px;font-size:13px;text-align:right;">${r.hours}h</td>
      <td style="padding:12px 8px;font-size:13px;text-align:right;">${formatCurrency(parseFloat(r.hours) * stats.rate)}</td>
      <td style="padding:12px 8px;font-size:13px;text-align:right;">+${r.timelineImpact}d</td>
    </tr>
  `
    )
    .join('');

  const deliverablesList = project.deliverables
    .map(
      (d) =>
        `<li style="margin-bottom:4px;font-size:13px;color:#4b5563;">${d.name} (${d.hours}h @ ${formatCurrency(d.rate)}/hr)</li>`
    )
    .join('');

  container.innerHTML = `
    <div style="margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:11px;letter-spacing:4px;color:#13b973;font-weight:700;margin-bottom:2px;">SKYNET LABS</div>
        <div style="font-size:9px;color:#9ca3af;letter-spacing:1px;">AI AUTOMATION AGENCY</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:24px;font-weight:800;color:#0a0a0f;">CHANGE ORDER</div>
        <div style="font-size:13px;color:#6b7280;margin-top:2px;">#CO-${String(orderNumber).padStart(4, '0')}</div>
      </div>
    </div>

    <div style="border-top:3px solid #13b973;margin-bottom:28px;"></div>

    <div style="display:flex;justify-content:space-between;margin-bottom:28px;">
      <div>
        <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Project</div>
        <div style="font-size:16px;font-weight:700;color:#0a0a0f;">${project.projectName}</div>
        <div style="font-size:13px;color:#4b5563;margin-top:2px;">Client: ${project.clientName}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Date Issued</div>
        <div style="font-size:14px;font-weight:600;color:#0a0a0f;">${formatDate(today)}</div>
        <div style="font-size:13px;color:#4b5563;margin-top:2px;">Rate: ${formatCurrency(stats.rate)}/hr</div>
      </div>
    </div>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:28px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0a0a0f;margin-bottom:12px;">Original Scope Summary</div>
      <ul style="list-style:disc;padding-left:20px;margin:0;">
        ${deliverablesList}
      </ul>
      <div style="margin-top:12px;font-size:13px;color:#0a0a0f;font-weight:600;">
        Original Contract Value: ${formatCurrency(parseFloat(project.contractValue) || stats.originalValue)}
        &nbsp;&nbsp;|&nbsp;&nbsp;Deadline: ${formatDate(project.deadline)}
      </div>
    </div>

    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0a0a0f;margin-bottom:12px;">Requested Changes</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:left;color:#6b7280;">#</th>
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:left;color:#6b7280;">Description</th>
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;color:#6b7280;">Category</th>
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;color:#6b7280;">Priority</th>
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:right;color:#6b7280;">Hours</th>
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:right;color:#6b7280;">Cost</th>
          <th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:right;color:#6b7280;">Timeline</th>
        </tr>
      </thead>
      <tbody>
        ${requestRows}
      </tbody>
      <tfoot>
        <tr style="background:#f3f4f6;font-weight:700;">
          <td colspan="4" style="padding:12px 8px;font-size:13px;">TOTAL IMPACT</td>
          <td style="padding:12px 8px;font-size:13px;text-align:right;">${totalAdditionalHours}h</td>
          <td style="padding:12px 8px;font-size:13px;text-align:right;color:#13b973;">${formatCurrency(totalAdditionalCost)}</td>
          <td style="padding:12px 8px;font-size:13px;text-align:right;">+${totalTimelineImpact}d</td>
        </tr>
      </tfoot>
    </table>

    <div style="display:flex;gap:16px;margin-bottom:28px;">
      <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">New Project Total</div>
        <div style="font-size:24px;font-weight:800;color:#0a0a0f;">${formatCurrency(newProjectTotal)}</div>
      </div>
      <div style="flex:1;background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#a16207;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Additional Cost</div>
        <div style="font-size:24px;font-weight:800;color:#0a0a0f;">${formatCurrency(totalAdditionalCost)}</div>
      </div>
      <div style="flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#b91c1c;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">New Deadline</div>
        <div style="font-size:16px;font-weight:800;color:#0a0a0f;">${project.deadline ? formatDate(addDaysStr(project.deadline, totalTimelineImpact)) : 'TBD'}</div>
      </div>
    </div>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:32px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0a0a0f;margin-bottom:8px;">Terms & Conditions</div>
      <ol style="font-size:12px;color:#4b5563;line-height:1.8;padding-left:20px;margin:0;">
        <li>Additional payment of ${formatCurrency(totalAdditionalCost)} is required before work on change items begins.</li>
        <li>The project deadline will be extended by ${totalTimelineImpact} business day(s).</li>
        <li>This change order becomes part of the original project agreement.</li>
        <li>Any further scope changes will require a separate change order.</li>
        <li>Payment terms: Net 15 from change order approval date.</li>
      </ol>
    </div>

    <div style="display:flex;justify-content:space-between;gap:60px;margin-bottom:16px;">
      <div style="flex:1;">
        <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:40px;">Client Approval</div>
        <div style="border-bottom:1px solid #0a0a0f;margin-bottom:8px;"></div>
        <div style="font-size:12px;color:#6b7280;">Signature &amp; Date</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">${project.clientName}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:40px;">Provider Approval</div>
        <div style="border-bottom:1px solid #0a0a0f;margin-bottom:8px;"></div>
        <div style="font-size:12px;color:#6b7280;">Signature &amp; Date</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">Skynet Labs</div>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
      <div style="font-size:10px;color:#9ca3af;">Generated by Skynet Labs Scope Creep Tracker | www.skynetjoe.com</div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(
      `Change-Order-CO-${String(orderNumber).padStart(4, '0')}-${project.projectName.replace(/\s+/g, '-')}.pdf`
    );

    return orderNumber;
  } finally {
    document.body.removeChild(container);
  }
}

function addDaysStr(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
