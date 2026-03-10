import { useState } from 'react'
import { Code, Copy, Palette, Eye } from 'lucide-react'
import { useTestimonials } from '../contexts/TestimonialContext'
import Toast from '../components/Toast'

export default function EmbedPage() {
  const { approvedTestimonials, settings } = useTestimonials()
  const [embedType, setEmbedType] = useState('wall')
  const [selectedId, setSelectedId] = useState('')
  const [widgetBg, setWidgetBg] = useState('#0a0a0f')
  const [widgetText, setWidgetText] = useState('#e8e8ea')
  const [widgetAccent, setWidgetAccent] = useState('#13b973')
  const [widgetWidth, setWidgetWidth] = useState('100%')
  const [widgetHeight, setWidgetHeight] = useState('600')
  const [toast, setToast] = useState(null)

  const baseUrl = window.location.origin + window.location.pathname

  const getWallEmbedUrl = () => {
    const params = new URLSearchParams()
    params.set('embed', '1')
    params.set('bg', widgetBg)
    params.set('text', widgetText)
    params.set('accent', widgetAccent)
    return `${window.location.origin}/testimonials/wall?${params.toString()}`
  }

  const generateIframeCode = () => {
    if (embedType === 'wall') {
      return `<iframe
  src="${getWallEmbedUrl()}"
  width="${widgetWidth}"
  height="${widgetHeight}px"
  frameborder="0"
  style="border: none; border-radius: 12px; overflow: hidden;"
  title="Testimonial Wall of Love"
></iframe>`
    }

    if (embedType === 'single' && selectedId) {
      const t = approvedTestimonials.find(t => t.id === selectedId)
      if (!t) return '<!-- Select a testimonial -->'
      return `<!-- Single Testimonial Embed -->
<div style="background: ${widgetBg}; color: ${widgetText}; padding: 24px; border-radius: 16px; font-family: Inter, system-ui, sans-serif; max-width: 480px; border: 1px solid rgba(255,255,255,0.08);">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
    ${t.photoUrl ? `<img src="${t.photoUrl}" alt="${t.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid ${widgetAccent}33;" />` : `<div style="width: 48px; height: 48px; border-radius: 50%; background: ${widgetAccent}22; border: 2px solid ${widgetAccent}33; display: flex; align-items: center; justify-content: center; color: ${widgetAccent}; font-weight: bold;">${(t.name || 'A').charAt(0).toUpperCase()}</div>`}
    <div>
      <div style="font-weight: 600; font-size: 14px;">${t.name}</div>
      ${t.company ? `<div style="font-size: 12px; opacity: 0.6;">${t.company}</div>` : ''}
    </div>
  </div>
  ${t.rating ? `<div style="color: #facc15; font-size: 16px; margin-bottom: 8px;">${'&#9733;'.repeat(t.rating)}${'&#9734;'.repeat(5 - t.rating)}</div>` : ''}
  <p style="font-size: 14px; line-height: 1.6; opacity: 0.85; margin: 0;">"${t.testimonial}"</p>
  ${t.service ? `<div style="margin-top: 12px;"><span style="font-size: 11px; padding: 4px 10px; border-radius: 20px; background: ${widgetAccent}18; color: ${widgetAccent}; border: 1px solid ${widgetAccent}30;">${t.service}</span></div>` : ''}
</div>`
    }

    return '<!-- Select embed type and options -->'
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateIframeCode())
    setToast({ message: 'Embed code copied to clipboard', type: 'success' })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
          <Code className="w-7 h-7 text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-dark-50 mb-2">Embed Widget</h1>
        <p className="text-dark-300">Generate embed code for your testimonials to display on any website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Embed Type */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-3">Embed Type</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setEmbedType('wall')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  embedType === 'wall'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-700 text-dark-300 border border-dark-400/20 hover:border-dark-300/30'
                }`}
              >
                Full Wall
              </button>
              <button
                onClick={() => setEmbedType('single')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  embedType === 'single'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-700 text-dark-300 border border-dark-400/20 hover:border-dark-300/30'
                }`}
              >
                Single Testimonial
              </button>
            </div>
          </div>

          {/* Single Select */}
          {embedType === 'single' && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-dark-200 mb-3">Select Testimonial</h3>
              {approvedTestimonials.length === 0 ? (
                <p className="text-dark-400 text-sm">No approved testimonials available.</p>
              ) : (
                <select
                  className="input-field text-sm"
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                >
                  <option value="">Choose a testimonial...</option>
                  {approvedTestimonials.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} - "{t.testimonial?.substring(0, 50)}..."
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Colors */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Customize Colors
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-dark-400 block mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={widgetBg}
                    onChange={e => setWidgetBg(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    className="input-field py-1.5 text-xs font-mono"
                    value={widgetBg}
                    onChange={e => setWidgetBg(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">Text</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={widgetText}
                    onChange={e => setWidgetText(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    className="input-field py-1.5 text-xs font-mono"
                    value={widgetText}
                    onChange={e => setWidgetText(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={widgetAccent}
                    onChange={e => setWidgetAccent(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    className="input-field py-1.5 text-xs font-mono"
                    value={widgetAccent}
                    onChange={e => setWidgetAccent(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size (wall only) */}
          {embedType === 'wall' && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-dark-200 mb-3">Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-dark-400 block mb-1">Width</label>
                  <input
                    type="text"
                    className="input-field py-2 text-sm"
                    value={widgetWidth}
                    onChange={e => setWidgetWidth(e.target.value)}
                    placeholder="100% or 800px"
                  />
                </div>
                <div>
                  <label className="text-xs text-dark-400 block mb-1">Height (px)</label>
                  <input
                    type="number"
                    className="input-field py-2 text-sm"
                    value={widgetHeight}
                    onChange={e => setWidgetHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Output */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                <Code className="w-4 h-4" /> Embed Code
              </h3>
              <button
                onClick={handleCopy}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
            </div>
            <pre className="bg-dark-900 rounded-xl p-4 text-sm font-mono text-dark-200 overflow-x-auto whitespace-pre-wrap break-all border border-dark-400/10 max-h-[400px] overflow-y-auto">
              {generateIframeCode()}
            </pre>
          </div>

          {/* Preview for single */}
          {embedType === 'single' && selectedId && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview
              </h3>
              <div
                className="rounded-xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: generateIframeCode().replace('<!-- Single Testimonial Embed -->\n', '') }}
              />
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-200 mb-2">How to Use</h3>
            <ol className="text-sm text-dark-300 space-y-2 list-decimal list-inside">
              <li>Customize the colors and dimensions above to match your website</li>
              <li>Click "Copy Code" to copy the embed snippet</li>
              <li>Paste the code into your website's HTML where you want the testimonials to appear</li>
              <li>The widget will automatically display your approved testimonials</li>
            </ol>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
