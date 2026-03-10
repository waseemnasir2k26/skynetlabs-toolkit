import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePDF(elementId, filename = 'onboarding-package.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0a0a0f',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgScaledWidth = imgWidth * ratio;
  const imgScaledHeight = imgHeight * ratio;

  let heightLeft = imgScaledHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgScaledHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

export async function generateClientPDF(clientData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  const addHeader = () => {
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setFillColor(19, 185, 115);
    pdf.rect(0, 38, pageWidth, 2, 'F');
    pdf.setTextColor(19, 185, 115);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SKYNET LABS', margin, 18);
    pdf.setFontSize(9);
    pdf.setTextColor(136, 136, 160);
    pdf.text('AI Automation Agency', margin, 26);
    pdf.setFontSize(8);
    pdf.text('www.skynetjoe.com', margin, 32);
    y = 50;
  };

  const checkPage = (needed = 20) => {
    if (y + needed > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      y = 20;
    }
  };

  const addSection = (title) => {
    checkPage(30);
    pdf.setFontSize(14);
    pdf.setTextColor(19, 185, 115);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, y);
    y += 2;
    pdf.setDrawColor(19, 185, 115);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, margin + contentWidth, y);
    y += 8;
  };

  const addField = (label, value) => {
    if (!value) return;
    checkPage(12);
    pdf.setFontSize(9);
    pdf.setTextColor(136, 136, 160);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label + ':', margin, y);
    pdf.setTextColor(224, 224, 232);
    pdf.setFont('helvetica', 'bold');
    const valStr = String(value);
    const lines = pdf.splitTextToSize(valStr, contentWidth - 50);
    pdf.text(lines, margin + 50, y);
    y += lines.length * 5 + 3;
  };

  const addText = (text, size = 10) => {
    checkPage(15);
    pdf.setFontSize(size);
    pdf.setTextColor(224, 224, 232);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(String(text), contentWidth);
    lines.forEach(line => {
      checkPage(6);
      pdf.text(line, margin, y);
      y += 5;
    });
    y += 3;
  };

  // Page 1: Cover
  addHeader();
  y = 80;
  pdf.setFontSize(28);
  pdf.setTextColor(224, 224, 232);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Client Onboarding', margin, y);
  y += 12;
  pdf.text('Package', margin, y);
  y += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(19, 185, 115);
  pdf.text(clientData.clientInfo?.fullName || 'Client', margin, y);
  y += 8;
  pdf.setFontSize(11);
  pdf.setTextColor(136, 136, 160);
  pdf.text(clientData.clientInfo?.companyName || '', margin, y);
  y += 15;
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);

  // Client Info
  if (clientData.clientInfo) {
    pdf.addPage();
    y = 20;
    addSection('CLIENT INFORMATION');
    const ci = clientData.clientInfo;
    addField('Full Name', ci.fullName);
    addField('Company', ci.companyName);
    addField('Registration #', ci.registrationNumber);
    addField('Email', ci.email);
    addField('Phone', ci.phone);
    addField('Address', ci.address);
    addField('Website', ci.website);
    addField('Preferred Contact', ci.preferredChannel);
    if (ci.socialMedia) {
      Object.entries(ci.socialMedia).forEach(([platform, handle]) => {
        if (handle) addField(platform, handle);
      });
    }
  }

  // Project Details
  if (clientData.projectDetails) {
    pdf.addPage();
    y = 20;
    addSection('PROJECT DETAILS');
    const pd = clientData.projectDetails;
    addField('Project Type', pd.projectType);
    addField('Budget Range', pd.budgetRange);
    addField('Timeline', pd.timeline);
    addField('Target Audience', pd.targetAudience);
    y += 5;
    if (pd.description) {
      pdf.setFontSize(10);
      pdf.setTextColor(136, 136, 160);
      pdf.text('Description:', margin, y);
      y += 6;
      addText(pd.description);
    }
    if (pd.goals?.length) {
      y += 3;
      pdf.setFontSize(10);
      pdf.setTextColor(136, 136, 160);
      pdf.text('Goals & Objectives:', margin, y);
      y += 6;
      pd.goals.forEach((g, i) => addText(`${i + 1}. ${g}`));
    }
    if (pd.competitors?.length) {
      y += 3;
      pdf.setFontSize(10);
      pdf.setTextColor(136, 136, 160);
      pdf.text('Competitors / Inspiration:', margin, y);
      y += 6;
      pd.competitors.forEach(c => addText(`- ${c}`));
    }
  }

  // Access & Credentials
  if (clientData.accessCredentials) {
    pdf.addPage();
    y = 20;
    addSection('ACCESS & CREDENTIALS');
    pdf.setFontSize(8);
    pdf.setTextColor(239, 68, 68);
    pdf.text('CONFIDENTIAL - For authorized personnel only', margin, y);
    y += 8;
    const ac = clientData.accessCredentials;
    if (ac.hosting) {
      addField('Hosting Provider', ac.hosting.provider);
      addField('Login URL', ac.hosting.loginUrl);
      addField('Username', ac.hosting.username);
      y += 3;
    }
    if (ac.domain) {
      addField('Domain Registrar', ac.domain.registrar);
      addField('Login URL', ac.domain.loginUrl);
      addField('Username', ac.domain.username);
      y += 3;
    }
    if (ac.socialAccounts) {
      Object.entries(ac.socialAccounts).forEach(([platform, creds]) => {
        if (creds?.username) addField(`${platform}`, `${creds.username}`);
      });
    }
    if (ac.analytics) {
      addField('Google Analytics', ac.analytics.propertyId);
    }
    if (ac.customAccess?.length) {
      ac.customAccess.forEach(item => {
        if (item.name) addField(item.name, `${item.url || ''} | ${item.username || ''}`);
      });
    }
  }

  // NDA
  if (clientData.nda?.agreed) {
    pdf.addPage();
    y = 20;
    addSection('NON-DISCLOSURE AGREEMENT');
    addField('Duration', clientData.nda.duration === 'indefinite' ? 'Indefinite' : `${clientData.nda.duration} Year(s)`);
    addField('Jurisdiction', clientData.nda.jurisdiction);
    addField('Purpose', clientData.nda.purpose);
    addField('Date Signed', clientData.nda.dateSigned);
    addField('Agreed', clientData.nda.agreed ? 'Yes' : 'No');
    if (clientData.nda.signature) {
      checkPage(40);
      y += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(136, 136, 160);
      pdf.text('Digital Signature:', margin, y);
      y += 5;
      try {
        pdf.addImage(clientData.nda.signature, 'PNG', margin, y, 60, 25);
        y += 30;
      } catch (e) {
        // skip if image fails
      }
    }
  }

  // Service Agreement
  if (clientData.serviceAgreement?.agreed) {
    pdf.addPage();
    y = 20;
    addSection('SERVICE AGREEMENT');
    const sa = clientData.serviceAgreement;
    addField('Payment Terms', sa.paymentTerms);
    addField('Revisions Included', sa.revisions);
    addField('Kill Fee', `${sa.killFeePercent || 15}%`);
    addField('Abandonment Period', `${sa.abandonmentDays || 14} days`);
    addField('Response Time', `${sa.responseTime || 24} hours`);
    addField('Late Fee', `${sa.lateFeePercent || 5}%`);
    addField('Date Signed', sa.dateSigned);
    if (sa.signature) {
      checkPage(40);
      y += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(136, 136, 160);
      pdf.text('Digital Signature:', margin, y);
      y += 5;
      try {
        pdf.addImage(sa.signature, 'PNG', margin, y, 60, 25);
        y += 30;
      } catch (e) {
        // skip
      }
    }
  }

  // Payment Info
  if (clientData.paymentInfo) {
    checkPage(40);
    addSection('PAYMENT INFORMATION');
    addField('Payment Method', clientData.paymentInfo.paymentMethod);
    addField('Billing Address', clientData.paymentInfo.billingAddress);
    addField('Late Penalty Acknowledged', clientData.paymentInfo.latePenaltyAcknowledged ? 'Yes' : 'No');
  }

  // Footer on last page
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 100);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pdf.internal.pageSize.getHeight() - 10);
    pdf.text('Skynet Labs | www.skynetjoe.com', margin, pdf.internal.pageSize.getHeight() - 10);
  }

  const name = clientData.clientInfo?.fullName?.replace(/\s+/g, '-') || 'client';
  pdf.save(`${name}-onboarding-package.pdf`);
}
