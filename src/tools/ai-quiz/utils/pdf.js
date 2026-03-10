import jsPDF from 'jspdf'
import { dimensions } from '../data/questions'
import {
  getScoreCategory,
  getPercentile,
  getTimeSavings,
  getEstimatedROI,
  getDimensionInsights,
  getRecommendedServices,
  getPriorityActions,
} from './scoring'

export function generatePDF(scores, answers) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const primary = [19, 185, 115]
  const dark = [10, 10, 15]
  const white = [255, 255, 255]
  const gray = [150, 150, 160]

  const category = getScoreCategory(scores.overall)
  const percentile = getPercentile(scores.overall)
  const timeSavings = getTimeSavings(answers)
  const roi = getEstimatedROI(answers)
  const services = getRecommendedServices(scores, answers)
  const actions = getPriorityActions(scores, answers)

  // Background
  doc.setFillColor(...dark)
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')

  // Header
  doc.setTextColor(...primary)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('SKYNET LABS', margin, y)
  doc.setTextColor(...gray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('AI Automation Agency', margin + 32, y)
  doc.text('www.skynetjoe.com', pageWidth - margin, y, { align: 'right' })

  y += 15

  // Title
  doc.setTextColor(...white)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Business Readiness Report', margin, y)

  y += 8
  doc.setTextColor(...gray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y)

  y += 15

  // Score section
  doc.setFillColor(20, 20, 35)
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F')

  doc.setTextColor(...white)
  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  doc.text(`${scores.overall}`, margin + 15, y + 28)

  doc.setFontSize(12)
  doc.setTextColor(...gray)
  doc.text('/100', margin + 38, y + 28)

  doc.setTextColor(...primary)
  doc.setFontSize(14)
  doc.text(category.label, margin + 65, y + 20)

  doc.setTextColor(...gray)
  doc.setFontSize(9)
  doc.text(`Top ${100 - percentile}% of businesses assessed`, margin + 65, y + 30)

  y += 50

  // Key Metrics
  const metricWidth = contentWidth / 3
  const metrics = [
    { label: 'Hours Saved/Week', value: `${timeSavings}+` },
    { label: 'Monthly Savings', value: `$${roi.monthlySavings.toLocaleString()}` },
    { label: 'Estimated ROI', value: `${roi.roi}x` },
  ]

  metrics.forEach((m, i) => {
    const x = margin + i * metricWidth
    doc.setFillColor(20, 20, 35)
    doc.roundedRect(x, y, metricWidth - 4, 25, 2, 2, 'F')
    doc.setTextColor(...primary)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(m.value, x + (metricWidth - 4) / 2, y + 12, { align: 'center' })
    doc.setTextColor(...gray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(m.label, x + (metricWidth - 4) / 2, y + 20, { align: 'center' })
  })

  y += 35

  // Dimension scores
  doc.setTextColor(...white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Score Breakdown', margin, y)
  y += 8

  dimensions.forEach((dim) => {
    const score = scores.dimensions[dim.id]
    const barWidth = (score / 100) * (contentWidth - 60)

    doc.setTextColor(...gray)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(dim.label, margin, y + 4)

    // Bar background
    doc.setFillColor(25, 25, 40)
    doc.roundedRect(margin + 55, y, contentWidth - 60, 5, 1, 1, 'F')
    // Bar fill
    doc.setFillColor(...primary)
    if (barWidth > 2) {
      doc.roundedRect(margin + 55, y, barWidth, 5, 1, 1, 'F')
    }

    doc.setTextColor(...white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`${score}`, pageWidth - margin, y + 4, { align: 'right' })

    y += 12
  })

  y += 5

  // Priority Actions
  if (y + 60 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage()
    doc.setFillColor(...dark)
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
    y = margin
  }

  doc.setTextColor(...white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Priority Actions', margin, y)
  y += 8

  actions.forEach((action, i) => {
    doc.setTextColor(...primary)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${i + 1}.`, margin, y + 4)

    doc.setTextColor(...white)
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(action.action, contentWidth - 15)
    doc.text(lines, margin + 10, y + 4)
    y += lines.length * 5

    doc.setTextColor(...gray)
    doc.setFontSize(8)
    doc.text(`Impact: ${action.impact} | Timeline: ${action.urgency}`, margin + 10, y + 3)
    y += 10
  })

  y += 5

  // Recommended Services
  if (y + 50 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage()
    doc.setFillColor(...dark)
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
    y = margin
  }

  doc.setTextColor(...white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Recommended Services', margin, y)
  y += 8

  services.forEach((service) => {
    doc.setTextColor(...white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(service.name, margin + 5, y + 4)
    if (service.priority === 'high') {
      doc.setTextColor(...primary)
      doc.setFontSize(7)
      doc.text(' [HIGH IMPACT]', margin + 5 + doc.getTextWidth(service.name) + 2, y + 4)
    }

    doc.setTextColor(...gray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const descLines = doc.splitTextToSize(service.description, contentWidth - 10)
    doc.text(descLines, margin + 5, y + 9)
    y += 8 + descLines.length * 4
  })

  // Footer CTA
  y = doc.internal.pageSize.getHeight() - 25
  doc.setDrawColor(...primary)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setTextColor(...primary)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Ready to automate? Book a free consultation at www.skynetjoe.com', pageWidth / 2, y, {
    align: 'center',
  })

  doc.setTextColor(...gray)
  doc.setFontSize(7)
  doc.text('Skynet Labs - AI Automation Agency', pageWidth / 2, y + 8, { align: 'center' })

  doc.save('AI-Readiness-Report-SkynetLabs.pdf')
}
