import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'

const FONT_STYLES = [
  { value: 'modern', label: 'Modern', fontFamily: "'Inter', 'Segoe UI', sans-serif", weights: { heading: 700, body: 400 } },
  { value: 'classic', label: 'Classic', fontFamily: "'Georgia', 'Times New Roman', serif", weights: { heading: 700, body: 400 } },
  { value: 'bold', label: 'Bold', fontFamily: "'Impact', 'Arial Black', sans-serif", weights: { heading: 900, body: 600 } },
  { value: 'minimal', label: 'Minimal', fontFamily: "'Helvetica Neue', 'Arial', sans-serif", weights: { heading: 300, body: 300 } },
]

const VOICE_GUIDELINES = {
  Professional: {
    tone: 'Authoritative, knowledgeable, and trustworthy',
    doList: ['Use precise language and industry terminology', 'Back claims with data and case studies', 'Maintain formal but approachable tone', 'Lead with expertise and credentials'],
    dontList: ['Use slang or overly casual language', 'Make unsupported claims', 'Be condescending or overly complex', 'Use excessive exclamation marks'],
    example: 'Our proven methodology delivers measurable results. With 15+ years of experience, we transform challenges into opportunities for growth.',
  },
  Friendly: {
    tone: 'Warm, approachable, and conversational',
    doList: ['Use inclusive language (we, our, together)', 'Share stories and relatable examples', 'Ask questions to engage the audience', 'Keep sentences short and punchy'],
    dontList: ['Be overly formal or stiff', 'Use jargon without explanation', 'Sound robotic or impersonal', 'Ignore the human element'],
    example: 'Hey there! We\'re so glad you found us. Let\'s work together to make something amazing happen for your business.',
  },
  Bold: {
    tone: 'Confident, direct, and impactful',
    doList: ['Lead with strong statements', 'Use action-oriented language', 'Challenge the status quo', 'Be unapologetically direct'],
    dontList: ['Be wishy-washy or use hedging language', 'Bury the lead', 'Play it safe with generic messaging', 'Apologize for being direct'],
    example: 'Stop settling for average. Your brand deserves to dominate. We don\'t just meet expectations - we shatter them.',
  },
  Minimal: {
    tone: 'Clean, concise, and understated',
    doList: ['Say more with less', 'Use white space intentionally', 'Focus on essential information only', 'Let the work speak for itself'],
    dontList: ['Over-explain or use filler words', 'Add unnecessary decoration', 'Use multiple adjectives when one will do', 'Clutter messaging with buzzwords'],
    example: 'Simple solutions. Real results. That\'s what we do.',
  },
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function lightenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  )
}

function darkenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

function generateAccent(primary, secondary) {
  const p = hexToRgb(primary)
  const s = hexToRgb(secondary)
  return rgbToHex(
    Math.round((p.r + s.r) / 2),
    Math.round((p.g + s.g) / 2),
    Math.round((p.b + s.b) / 2)
  )
}

function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

function ColorSwatch({ name, hex, className = '' }) {
  const rgb = hexToRgb(hex)
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ border: '1px solid var(--border)' }}>
      <div className="h-20 flex items-end p-2" style={{ background: hex }}>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
          {name}
        </span>
      </div>
      <div className="p-2 space-y-1" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: 'var(--text-body)' }}>{hex.toUpperCase()}</span>
          <CopyButton text={hex.toUpperCase()} label="" className="!px-1.5 !py-0.5" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{rgbStr}</span>
          <CopyButton text={rgbStr} label="" className="!px-1.5 !py-0.5" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [brandName, setBrandName] = useLocalStorage('skynet-brand-kit-name', 'SkynetLabs')
  const [tagline, setTagline] = useLocalStorage('skynet-brand-kit-tagline', 'Building the future, one pixel at a time')
  const [primaryColor, setPrimaryColor] = useLocalStorage('skynet-brand-kit-primary', '#13b973')
  const [secondaryColor, setSecondaryColor] = useLocalStorage('skynet-brand-kit-secondary', '#1e293b')
  const [fontStyle, setFontStyle] = useLocalStorage('skynet-brand-kit-font', 'modern')
  const [voiceTone, setVoiceTone] = useLocalStorage('skynet-brand-kit-voice', 'Professional')

  const palette = useMemo(() => ({
    primary: primaryColor,
    secondary: secondaryColor,
    light: lightenColor(primaryColor, 0.85),
    dark: darkenColor(secondaryColor, 0.3),
    accent: generateAccent(primaryColor, secondaryColor),
  }), [primaryColor, secondaryColor])

  const selectedFont = FONT_STYLES.find(f => f.value === fontStyle) || FONT_STYLES[0]
  const voiceGuide = VOICE_GUIDELINES[voiceTone] || VOICE_GUIDELINES.Professional

  const initials = brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')

  return (
    <ToolLayout
      title="Brand Kit Generator"
      description="Generate a complete brand kit with colors, typography, logo placeholder, and brand voice guidelines."
      category="Generator"
    >
      <div id="brand-kit-export">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <ResultCard title="Brand Inputs" icon="&#127912;">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="Your brand name..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Your brand tagline..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                      style={{ background: 'var(--bg-input)' }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Secondary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                      style={{ background: 'var(--bg-input)' }}
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Font Preference</label>
                <select
                  value={fontStyle}
                  onChange={e => setFontStyle(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                >
                  {FONT_STYLES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Brand Voice Tone</label>
                <select
                  value={voiceTone}
                  onChange={e => setVoiceTone(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                >
                  {Object.keys(VOICE_GUIDELINES).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </ResultCard>

          {/* Logo + Avatar Previews */}
          <ResultCard title="Logo & Avatar Preview" icon="&#128396;">
            <div className="space-y-6">
              {/* Logo Placeholder */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${palette.accent})` }}
                >
                  <span
                    className="text-4xl font-bold"
                    style={{ color: getContrastColor(primaryColor), fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.heading }}
                  >
                    {initials || 'AB'}
                  </span>
                </div>
                <div className="text-center">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: 'var(--text-heading)', fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.heading }}
                  >
                    {brandName || 'Brand Name'}
                  </h3>
                  {tagline && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.body }}>
                      {tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Media Avatar */}
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-heading)' }}>Social Media Avatar</h4>
                <div className="flex items-center gap-4">
                  {/* Circle avatar */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${palette.accent})` }}
                  >
                    <span
                      className="text-xl font-bold"
                      style={{ color: getContrastColor(primaryColor), fontFamily: selectedFont.fontFamily }}
                    >
                      {initials || 'AB'}
                    </span>
                  </div>
                  {/* Square avatar */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: secondaryColor }}
                  >
                    <span
                      className="text-xl font-bold"
                      style={{ color: primaryColor, fontFamily: selectedFont.fontFamily }}
                    >
                      {initials || 'AB'}
                    </span>
                  </div>
                  {/* Dark variant */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: palette.dark }}
                  >
                    <span
                      className="text-xl font-bold"
                      style={{ color: primaryColor, fontFamily: selectedFont.fontFamily }}
                    >
                      {initials || 'AB'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Three avatar variants for social media profiles. Use the circle for platforms like Twitter/LinkedIn,
                      squares for Instagram/YouTube.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ResultCard>
        </div>

        {/* Color Palette */}
        <div className="mt-6">
          <ResultCard title="Color Palette" icon="&#127912;">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <ColorSwatch name="Primary" hex={palette.primary} />
              <ColorSwatch name="Secondary" hex={palette.secondary} />
              <ColorSwatch name="Light" hex={palette.light} />
              <ColorSwatch name="Dark" hex={palette.dark} />
              <ColorSwatch name="Accent" hex={palette.accent} />
            </div>
          </ResultCard>
        </div>

        {/* Typography Preview */}
        <div className="mt-6">
          <ResultCard title="Typography" icon="&#128394;">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Font Family: {selectedFont.fontFamily}</p>
                <div
                  className="rounded-lg p-6 space-y-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <h1 style={{ fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.heading, fontSize: '2rem', color: 'var(--text-heading)' }}>
                    Heading 1 - {brandName}
                  </h1>
                  <h2 style={{ fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.heading, fontSize: '1.5rem', color: 'var(--text-heading)' }}>
                    Heading 2 - Your Services
                  </h2>
                  <h3 style={{ fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.heading, fontSize: '1.25rem', color: 'var(--text-heading)' }}>
                    Heading 3 - Section Title
                  </h3>
                  <p style={{ fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.body, fontSize: '1rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                    Body text looks like this. {brandName} delivers exceptional results through innovative solutions and dedicated craftsmanship.
                    Every project is an opportunity to exceed expectations.
                  </p>
                  <p style={{ fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.body, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Small text / caption - Used for disclaimers, footnotes, and supplementary information.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Button Style (Primary)</p>
                  <button
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: primaryColor, color: getContrastColor(primaryColor), fontFamily: selectedFont.fontFamily }}
                  >
                    Get Started
                  </button>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Button Style (Secondary)</p>
                  <button
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: 'transparent', color: primaryColor, border: `2px solid ${primaryColor}`, fontFamily: selectedFont.fontFamily }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </ResultCard>
        </div>

        {/* Brand Voice */}
        <div className="mt-6">
          <ResultCard title={`Brand Voice: ${voiceTone}`} icon="&#128483;">
            <div className="space-y-4">
              <div
                className="rounded-lg p-4"
                style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Tone</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>{voiceGuide.tone}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--success)' }}>
                    <span>&#10003;</span> Do
                  </h4>
                  <ul className="space-y-1.5">
                    {voiceGuide.doList.map((item, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-body)' }}>
                        <span style={{ color: 'var(--success)' }}>&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--danger)' }}>
                    <span>&#10007;</span> Don't
                  </h4>
                  <ul className="space-y-1.5">
                    {voiceGuide.dontList.map((item, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-body)' }}>
                        <span style={{ color: 'var(--danger)' }}>&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Example Copy</h4>
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: 'var(--text-body)', fontFamily: selectedFont.fontFamily, fontWeight: selectedFont.weights.body }}
                >
                  "{voiceGuide.example}"
                </p>
              </div>
            </div>
          </ResultCard>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="brand-kit-export" filename={`${brandName || 'brand'}-kit.pdf`} label="Export Brand Kit PDF" />
      </div>
    </ToolLayout>
  )
}
