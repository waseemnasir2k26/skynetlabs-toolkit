import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId, filename = 'proposal.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const originalOverflow = element.style.overflow;
  const originalHeight = element.style.height;
  const originalMaxHeight = element.style.maxHeight;

  element.style.overflow = 'visible';
  element.style.height = 'auto';
  element.style.maxHeight = 'none';

  const root = document.documentElement;
  const originalTheme = root.getAttribute('data-theme');
  root.setAttribute('data-theme', 'light');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const totalPdfHeight = imgHeight * ratio;
    let position = 0;

    while (position < totalPdfHeight) {
      if (position > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, totalPdfHeight);
      position += pdfHeight;
    }

    pdf.save(filename);
  } finally {
    root.setAttribute('data-theme', originalTheme || 'dark');
    element.style.overflow = originalOverflow;
    element.style.height = originalHeight;
    element.style.maxHeight = originalMaxHeight;
  }
};
