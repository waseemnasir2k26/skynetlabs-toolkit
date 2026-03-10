import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function generatePDF(elementId, invoiceNumber) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Invoice preview element not found')
  }

  // Store original styles
  const originalOverflow = element.style.overflow
  const originalHeight = element.style.height
  const originalMaxHeight = element.style.maxHeight

  // Temporarily remove scroll constraints so full invoice is captured
  element.style.overflow = 'visible'
  element.style.height = 'auto'
  element.style.maxHeight = 'none'

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft)
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${invoiceNumber || 'invoice'}.pdf`)
  } finally {
    // Restore original styles
    element.style.overflow = originalOverflow
    element.style.height = originalHeight
    element.style.maxHeight = originalMaxHeight
  }
}
