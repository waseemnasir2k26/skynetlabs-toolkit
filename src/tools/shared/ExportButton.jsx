import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useToast } from './Toast'
import { track } from '../../lib/analytics'

export default function ExportButton({ elementId, filename = 'export.pdf', label = 'Export PDF', className = '' }) {
  const toast = useToast()

  const handleExport = async () => {
    const slug = window.location.pathname.replace(/^\//, '') || 'home'
    track('export', slug, { filename })

    const element = document.getElementById(elementId)
    if (!element) return

    const originalOverflow = element.style.overflow
    const originalHeight = element.style.height
    const originalMaxHeight = element.style.maxHeight

    element.style.overflow = 'visible'
    element.style.height = 'auto'
    element.style.maxHeight = 'none'

    // Temporarily switch to light theme for clean white-background PDF
    const root = document.documentElement
    const originalTheme = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'light')

    // Wait for styles to repaint
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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
      if (toast) toast('PDF exported successfully!', 'success')
    } finally {
      // Restore original theme
      root.setAttribute('data-theme', originalTheme || 'dark')
      element.style.overflow = originalOverflow
      element.style.height = originalHeight
      element.style.maxHeight = originalMaxHeight
    }
  }

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all ${className}`}
      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </button>
  )
}
