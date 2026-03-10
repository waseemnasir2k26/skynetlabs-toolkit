import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ExportButton({ elementId, filename = 'export.pdf', label = 'Export PDF', className = '' }) {
  const handleExport = async () => {
    const element = document.getElementById(elementId)
    if (!element) return

    const originalOverflow = element.style.overflow
    const originalHeight = element.style.height
    const originalMaxHeight = element.style.maxHeight

    element.style.overflow = 'visible'
    element.style.height = 'auto'
    element.style.maxHeight = 'none'

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0a0a0f',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = pdfWidth / imgWidth
      const totalPdfHeight = imgHeight * ratio
      let position = 0

      while (position < totalPdfHeight) {
        if (position > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, totalPdfHeight)
        position += pdfHeight
      }

      pdf.save(filename)
    } finally {
      element.style.overflow = originalOverflow
      element.style.height = originalHeight
      element.style.maxHeight = originalMaxHeight
    }
  }

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-all ${className}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </button>
  )
}
