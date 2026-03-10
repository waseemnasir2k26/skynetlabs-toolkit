import { useState, useEffect } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'

/* ================================================================
   STATIC AD SPECS DATA
   ================================================================ */
const PLATFORMS = {
  'Meta / Facebook': {
    icon: 'fb',
    formats: {
      'Feed Image': {
        dimensions: '1080 x 1080 px',
        aspect: '1:1',
        fileTypes: 'JPG, PNG',
        maxFileSize: '30 MB',
        charLimits: { headline: 40, primaryText: 125, description: 30 },
        bestPractices: [
          'Use less than 20% text on the image for best delivery',
          'Use high-contrast visuals that stand out in the feed',
          'Include a clear CTA in the image or overlay',
          'Test square (1:1) vs vertical (4:5) for engagement',
          'Use lifestyle images over stock photos when possible',
        ],
        quickTips: 'Square images work best. Keep text minimal on the image itself.',
      },
      'Feed Video': {
        dimensions: '1080 x 1080 px (or 1080 x 1350 px)',
        aspect: '1:1 or 4:5',
        fileTypes: 'MP4, MOV, GIF',
        maxFileSize: '4 GB',
        duration: '1 sec \u2013 241 min (15\u201360 sec recommended)',
        charLimits: { headline: 40, primaryText: 125, description: 30 },
        bestPractices: [
          'Hook viewers in the first 3 seconds',
          'Design for sound-off with captions/text overlays',
          'Keep videos under 60 seconds for best engagement',
          'Use vertical (4:5) to maximize mobile screen real estate',
          'End with a strong call-to-action',
        ],
        quickTips: 'First 3 seconds are critical. Always add captions.',
      },
      'Story': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'JPG, PNG, MP4, MOV',
        maxFileSize: '4 GB (video), 30 MB (image)',
        duration: 'Up to 120 sec (video)',
        charLimits: { primaryText: 125 },
        bestPractices: [
          'Use the full 9:16 vertical canvas',
          'Keep key content in the center safe zone (1080x1420)',
          'Add motion or animation to grab attention',
          'Use native-feeling creative that blends with organic stories',
          'Include swipe-up or tap CTA prompts',
        ],
        quickTips: 'Full-screen vertical. Keep text away from top/bottom edges.',
      },
      'Carousel': {
        dimensions: '1080 x 1080 px per card',
        aspect: '1:1',
        fileTypes: 'JPG, PNG, MP4, MOV',
        maxFileSize: '30 MB (image), 4 GB (video)',
        charLimits: { headline: 40, primaryText: 125, description: 20 },
        bestPractices: [
          'Use 3\u20135 cards for optimal engagement',
          'Tell a sequential story across cards',
          'Make each card valuable on its own',
          'Use the first card as a strong hook',
          'Consistent design language across all cards',
        ],
        quickTips: '3-5 cards ideal. Each card should be a standalone story.',
      },
      'Reels': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'MP4, MOV',
        maxFileSize: '4 GB',
        duration: '0\u201390 sec (15\u201330 sec recommended)',
        charLimits: { primaryText: 72 },
        bestPractices: [
          'Create native-looking content (not overly polished)',
          'Use trending audio when possible',
          'Front-load the hook in first 1\u20132 seconds',
          'Use text overlays for key messages',
          'Vertical 9:16 format is mandatory',
        ],
        quickTips: 'Short, punchy, native-feeling content performs best.',
      },
      'Collection': {
        dimensions: '1080 x 1080 px (cover) + product images',
        aspect: '1:1 (cover)',
        fileTypes: 'JPG, PNG, MP4',
        maxFileSize: '30 MB',
        charLimits: { headline: 40, primaryText: 125 },
        bestPractices: [
          'Use a compelling cover image or video',
          'Curate 4+ products that tell a cohesive story',
          'Ensure product images are high quality and consistent',
          'Link to an Instant Experience for best results',
          'Test different product groupings',
        ],
        quickTips: 'Best for e-commerce. Pair with Instant Experience.',
      },
    },
  },
  'Instagram': {
    icon: 'ig',
    formats: {
      'Feed Post': {
        dimensions: '1080 x 1080 px',
        aspect: '1:1',
        fileTypes: 'JPG, PNG',
        maxFileSize: '30 MB',
        charLimits: { caption: 2200, hashtags: 30 },
        bestPractices: [
          'High-quality, visually striking images',
          'Use carousel posts for higher engagement',
          'Write engaging first line (shows before "more")',
          'Use 5-10 relevant hashtags',
          'Include a CTA in the caption',
        ],
        quickTips: 'Square or 4:5 vertical. Quality visuals are everything.',
      },
      'Story': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'JPG, PNG, MP4, MOV',
        maxFileSize: '30 MB (image), 4 GB (video)',
        duration: 'Up to 60 sec per story',
        charLimits: { sticker: 10 },
        bestPractices: [
          'Use interactive stickers (polls, quizzes, questions)',
          'Keep the safe zone in mind (avoid top/bottom 250px)',
          'Use motion and animation',
          'Create urgency with limited-time offers',
          'Add link stickers for traffic',
        ],
        quickTips: 'Interactive elements boost engagement significantly.',
      },
      'Reels': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'MP4, MOV',
        maxFileSize: '4 GB',
        duration: 'Up to 90 sec',
        charLimits: { caption: 2200 },
        bestPractices: [
          'Use trending audio and effects',
          'Hook viewers in first 1-2 seconds',
          'Keep it authentic and less polished',
          'Add text overlays for sound-off viewers',
          'Post consistently for algorithm favor',
        ],
        quickTips: 'Trending audio + fast hook = maximum reach.',
      },
      'Carousel': {
        dimensions: '1080 x 1080 px (or 1080 x 1350 px)',
        aspect: '1:1 or 4:5',
        fileTypes: 'JPG, PNG',
        maxFileSize: '30 MB per image',
        charLimits: { caption: 2200 },
        bestPractices: [
          'Up to 10 slides per carousel',
          'Educational or storytelling content works best',
          'Make slide 1 a scroll-stopping hook',
          'Include a CTA on the last slide',
          'Use consistent fonts and colors',
        ],
        quickTips: 'Educational carousels get saved and shared most.',
      },
    },
  },
  'Google Ads': {
    icon: 'gg',
    formats: {
      'Search Ad': {
        dimensions: 'Text only',
        aspect: 'N/A',
        fileTypes: 'N/A',
        maxFileSize: 'N/A',
        charLimits: { headline: '30 chars x 15 headlines', description: '90 chars x 4 descriptions', displayURL: 15 },
        bestPractices: [
          'Include target keywords in headlines',
          'Use all available headline and description slots',
          'Add relevant ad extensions (sitelinks, callouts, etc.)',
          'Include a clear CTA in descriptions',
          'Test multiple responsive search ad variations',
        ],
        quickTips: 'Use all 15 headline slots. Keywords in first 3 headlines.',
      },
      'Display Ad': {
        dimensions: '300x250, 336x280, 728x90, 160x600, 300x600, 320x50',
        aspect: 'Various',
        fileTypes: 'JPG, PNG, GIF, HTML5',
        maxFileSize: '150 KB',
        charLimits: { headline: 30, longHeadline: 90, description: 90 },
        bestPractices: [
          'Create ads in all standard sizes for maximum reach',
          'Use clear, readable text at small sizes',
          'Include your logo and brand colors',
          'Strong CTA button with contrasting color',
          'Keep animations under 30 seconds',
        ],
        quickTips: '300x250 and 728x90 are the most common placements.',
      },
      'YouTube Video Ad': {
        dimensions: '1920 x 1080 px (16:9)',
        aspect: '16:9',
        fileTypes: 'MP4, AVI, MOV, WMV',
        maxFileSize: '256 GB',
        duration: 'Skippable: 12 sec\u2013 6 min, Non-skip: 15\u201320 sec, Bumper: 6 sec',
        charLimits: { headline: 15, description: '2 lines' },
        bestPractices: [
          'Grab attention in first 5 seconds (before skip)',
          'Include branding within first 5 seconds',
          'Use clear audio and professional quality',
          'End with a strong CTA and end screen',
          'Test different video lengths',
        ],
        quickTips: 'First 5 seconds decide everything. Brand early.',
      },
      'Performance Max': {
        dimensions: 'Multiple: 1200x628 (landscape), 1200x1200 (square), 960x1200 (portrait)',
        aspect: '1.91:1, 1:1, 4:5',
        fileTypes: 'JPG, PNG, MP4',
        maxFileSize: '5 MB (image), 100 MB (video)',
        charLimits: { headline: '30 chars x 5', longHeadline: '90 chars x 5', description: '90 chars x 5' },
        bestPractices: [
          'Provide as many asset variations as possible',
          'Include all image ratios (landscape, square, portrait)',
          'Use at least one video asset',
          'Write diverse headlines and descriptions',
          'Let the algorithm optimize \u2014 give it variety',
        ],
        quickTips: 'More assets = better performance. Provide everything.',
      },
    },
  },
  'LinkedIn': {
    icon: 'li',
    formats: {
      'Single Image Ad': {
        dimensions: '1200 x 627 px',
        aspect: '1.91:1',
        fileTypes: 'JPG, PNG',
        maxFileSize: '5 MB',
        charLimits: { headline: 70, description: 100, introText: 600 },
        bestPractices: [
          'Use professional, business-relevant imagery',
          'Include a clear value proposition',
          'Keep text on image minimal',
          'Use company branding consistently',
          'A/B test different headlines',
        ],
        quickTips: 'Professional imagery. B2B-focused messaging works best.',
      },
      'Video Ad': {
        dimensions: '1920 x 1080 px (or 1080 x 1080 px)',
        aspect: '16:9 or 1:1',
        fileTypes: 'MP4',
        maxFileSize: '200 MB',
        duration: '3 sec \u2013 30 min (30\u201390 sec recommended)',
        charLimits: { headline: 70, introText: 600 },
        bestPractices: [
          'Lead with insights or data points',
          'Include captions (85% watch without sound)',
          'Keep under 90 seconds for best completion rates',
          'Feature thought leaders or subject matter experts',
          'End with a clear next step',
        ],
        quickTips: 'Data-driven hooks work well on LinkedIn.',
      },
      'Carousel Ad': {
        dimensions: '1080 x 1080 px per card',
        aspect: '1:1',
        fileTypes: 'JPG, PNG',
        maxFileSize: '10 MB per card',
        charLimits: { headline: 45, introText: 255 },
        bestPractices: [
          'Use 3\u20135 cards for optimal engagement',
          'Each card should have a clear headline',
          'Tell a progressive story or list benefits',
          'Include a CTA on the final card',
          'Consistent visual branding across cards',
        ],
        quickTips: 'Great for case studies and step-by-step content.',
      },
      'Document Ad': {
        dimensions: '1080 x 1080 px or PDF pages',
        aspect: '1:1 or letter/A4',
        fileTypes: 'PDF, DOC, PPT',
        maxFileSize: '100 MB',
        charLimits: { headline: 70, introText: 600 },
        bestPractices: [
          'Gate the document behind a lead form',
          'Make the first 2\u20133 pages compelling (preview)',
          'Use clean, professional design',
          'Include actionable insights and data',
          'Brand every page',
        ],
        quickTips: 'Lead gen goldmine. Gate valuable content behind forms.',
      },
    },
  },
  'TikTok': {
    icon: 'tt',
    formats: {
      'In-Feed Video': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'MP4, MOV, AVI',
        maxFileSize: '500 MB',
        duration: '5\u201360 sec (21\u201334 sec recommended)',
        charLimits: { adText: 100, caption: 150 },
        bestPractices: [
          'Create authentic, native-looking content',
          'Use trending sounds and effects',
          'Hook viewers in first 1\u20132 seconds',
          'Show your product/service in action',
          'Use text overlays for key messages',
        ],
        quickTips: 'Make TikToks, not ads. Authentic wins every time.',
      },
      'TopView': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'MP4, MOV',
        maxFileSize: '500 MB',
        duration: '5\u201360 sec',
        charLimits: { adText: 100 },
        bestPractices: [
          'Use your strongest creative \u2014 this is premium placement',
          'Full-screen with sound-on by default',
          'Make first 3 seconds unmissable',
          'High production value pays off here',
          'Include a clear, compelling CTA',
        ],
        quickTips: 'Premium placement. Use your absolute best creative.',
      },
      'Spark Ads': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'MP4, MOV',
        maxFileSize: '500 MB',
        duration: '5\u201360 sec',
        charLimits: { caption: 2200 },
        bestPractices: [
          'Boost existing organic posts that performed well',
          'Maintain the authentic feel of the original post',
          'Works with creator content (UGC)',
          'Social proof (likes, comments) carries over',
          'Great for building brand awareness',
        ],
        quickTips: 'Boost your best organic content. UGC works great.',
      },
    },
  },
  'YouTube': {
    icon: 'yt',
    formats: {
      'Skippable In-Stream': {
        dimensions: '1920 x 1080 px',
        aspect: '16:9',
        fileTypes: 'MP4, MOV, AVI',
        maxFileSize: '256 GB',
        duration: '12 sec min, no max (15\u201360 sec recommended)',
        charLimits: { companionBanner: '300x60 px' },
        bestPractices: [
          'Deliver your message before the 5-second skip point',
          'Use pattern interrupts to keep attention',
          'Include branding in the first 5 seconds',
          'Add end screens and cards for CTAs',
          'Optimize for both sound-on and sound-off',
        ],
        quickTips: 'Say something compelling before the skip button appears.',
      },
      'Non-Skippable In-Stream': {
        dimensions: '1920 x 1080 px',
        aspect: '16:9',
        fileTypes: 'MP4, MOV',
        maxFileSize: '256 GB',
        duration: '15\u201320 sec',
        charLimits: { companionBanner: '300x60 px' },
        bestPractices: [
          'Make every second count \u2014 no filler',
          'Strong narrative arc in 15\u201320 seconds',
          'Include CTA and branding throughout',
          'Use high production quality',
          'Test different storytelling approaches',
        ],
        quickTips: '15-20 seconds. Every frame must earn its place.',
      },
      'Bumper Ad': {
        dimensions: '1920 x 1080 px',
        aspect: '16:9',
        fileTypes: 'MP4, MOV',
        maxFileSize: '256 GB',
        duration: '6 sec max',
        charLimits: {},
        bestPractices: [
          'One message only \u2014 keep it focused',
          'Use bold visuals and minimal text',
          'Great for brand awareness and remarketing',
          'Complement longer video campaigns',
          'Test as part of a bumper ad sequence',
        ],
        quickTips: 'One message. Six seconds. Make it count.',
      },
      'Shorts Ad': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'MP4, MOV',
        maxFileSize: '256 GB',
        duration: '10\u201360 sec',
        charLimits: {},
        bestPractices: [
          'Create vertical, mobile-first content',
          'Make it feel like a Short, not an ad',
          'Use fast cuts and dynamic visuals',
          'Include text overlays for sound-off',
          'Hook in first 1\u20132 seconds',
        ],
        quickTips: 'Vertical format. Make it feel organic, not produced.',
      },
    },
  },
  'X / Twitter': {
    icon: 'tw',
    formats: {
      'Image Ad': {
        dimensions: '1200 x 675 px (or 1200 x 1200 px)',
        aspect: '16:9 or 1:1',
        fileTypes: 'JPG, PNG, GIF',
        maxFileSize: '5 MB (image), 15 MB (GIF)',
        charLimits: { tweetCopy: 280, headline: 70 },
        bestPractices: [
          'Use eye-catching visuals that stop the scroll',
          'Keep tweet copy concise and punchy',
          'Include a link for traffic campaigns',
          'Use 1-2 hashtags maximum',
          'Test different image styles (graphic vs photo)',
        ],
        quickTips: 'Concise copy + bold visuals. Less is more on X.',
      },
      'Video Ad': {
        dimensions: '1280 x 720 px min',
        aspect: '16:9 or 1:1',
        fileTypes: 'MP4, MOV',
        maxFileSize: '1 GB',
        duration: 'Up to 2:20 (15\u201330 sec recommended)',
        charLimits: { tweetCopy: 280 },
        bestPractices: [
          'Keep under 30 seconds for best completion',
          'Add captions for sound-off viewing',
          'Strong hook in first 2 seconds',
          'Use clear branding throughout',
          'End with a clear CTA',
        ],
        quickTips: 'Short and punchy. Captions are essential.',
      },
      'Carousel Ad': {
        dimensions: '800 x 418 px (or 800 x 800 px)',
        aspect: '1.91:1 or 1:1',
        fileTypes: 'JPG, PNG, MP4',
        maxFileSize: '5 MB per image',
        charLimits: { tweetCopy: 280, headline: 70 },
        bestPractices: [
          'Use 2\u20136 cards per carousel',
          'Tell a story or showcase products',
          'Consistent design across cards',
          'Each card should have a headline',
          'Use for product showcases or step-by-step guides',
        ],
        quickTips: '2-6 cards. Great for product showcases.',
      },
    },
  },
  'Pinterest': {
    icon: 'pi',
    formats: {
      'Standard Pin': {
        dimensions: '1000 x 1500 px',
        aspect: '2:3',
        fileTypes: 'JPG, PNG',
        maxFileSize: '20 MB',
        charLimits: { title: 100, description: 500 },
        bestPractices: [
          'Use vertical images (2:3 ratio is optimal)',
          'Include text overlay with clear value proposition',
          'Use branded, consistent visual style',
          'Include your logo subtly',
          'Create for search \u2014 use keywords in description',
        ],
        quickTips: 'Vertical 2:3 ratio. Design for search discovery.',
      },
      'Video Pin': {
        dimensions: '1000 x 1500 px (or 1080 x 1920 px)',
        aspect: '2:3 or 9:16',
        fileTypes: 'MP4, MOV',
        maxFileSize: '2 GB',
        duration: '4\u201315 sec recommended',
        charLimits: { title: 100, description: 500 },
        bestPractices: [
          'Start with movement to catch attention',
          'Design for sound-off with text overlays',
          'Keep under 15 seconds for best engagement',
          'Use vertical format for maximum visibility',
          'Include a strong cover image',
        ],
        quickTips: 'Short and vertical. Pinterest users browse quickly.',
      },
      'Idea Pin': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'JPG, PNG, MP4',
        maxFileSize: '20 MB per page',
        charLimits: { title: 100, notes: 500 },
        bestPractices: [
          'Use 5\u201320 pages to tell a complete story',
          'Tutorial and how-to formats perform best',
          'Include step-by-step instructions',
          'Use branded templates for consistency',
          'Add detail pages with descriptions',
        ],
        quickTips: 'Multi-page storytelling. Tutorials perform best.',
      },
    },
  },
  'Snapchat': {
    icon: 'sc',
    formats: {
      'Single Image / Video': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'JPG, PNG, MP4, MOV',
        maxFileSize: '5 MB (image), 1 GB (video)',
        duration: '3\u2013180 sec (3\u20135 sec recommended)',
        charLimits: { headline: 34, brandName: 25 },
        bestPractices: [
          'Full-screen vertical is mandatory',
          'Create for Gen Z and Millennial audiences',
          'Use bold colors and motion',
          'Include swipe-up CTA',
          'Keep it fun, authentic, and fast-paced',
        ],
        quickTips: 'Full vertical. Fun and authentic beats polished.',
      },
      'Collection Ad': {
        dimensions: '1080 x 1920 px (top) + product tiles',
        aspect: '9:16 (hero)',
        fileTypes: 'JPG, PNG, MP4',
        maxFileSize: '5 MB per image',
        charLimits: { headline: 34 },
        bestPractices: [
          'Feature 4+ products in the tile section',
          'Use a compelling hero image/video',
          'Product images should be clean and clear',
          'Great for e-commerce and catalog sales',
          'Link tiles to product detail pages',
        ],
        quickTips: 'E-commerce focused. 4+ products in tiles.',
      },
      'Story Ad': {
        dimensions: '1080 x 1920 px',
        aspect: '9:16',
        fileTypes: 'JPG, PNG, MP4',
        maxFileSize: '5 MB (image), 1 GB (video)',
        duration: '3\u201310 sec per tile',
        charLimits: { headline: 34 },
        bestPractices: [
          'Appears in the Discover feed',
          'Use 3\u201320 image or video ads in a series',
          'Each tile should have an attachment',
          'Create a narrative arc across tiles',
          'Use branded, eye-catching cover tiles',
        ],
        quickTips: '3-20 tiles. Create a mini story experience.',
      },
    },
  },
}

const PLATFORM_COLORS = {
  'Meta / Facebook': '#1877F2',
  'Instagram': '#E4405F',
  'Google Ads': '#4285F4',
  'LinkedIn': '#0A66C2',
  'TikTok': '#00f2ea',
  'YouTube': '#FF0000',
  'X / Twitter': '#a0a0a0',
  'Pinterest': '#E60023',
  'Snapchat': '#FFFC00',
}

function PlatformGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Object.keys(PLATFORMS).map(name => {
        const isActive = selected === name
        const color = PLATFORM_COLORS[name]
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`p-4 rounded-xl border-2 transition-all text-center font-medium text-sm ${
              isActive
                ? 'border-primary bg-primary/10 text-white'
                : 'border-white/10 bg-dark-200/30 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <div
              className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold text-black"
              style={{ backgroundColor: color }}
            >
              {PLATFORMS[name].icon.toUpperCase().slice(0, 2)}
            </div>
            {name}
          </button>
        )
      })}
    </div>
  )
}

function FormatGrid({ platform, selected, onSelect }) {
  if (!platform) return null
  const formats = Object.keys(PLATFORMS[platform].formats)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {formats.map(fmt => {
        const isActive = selected === fmt
        return (
          <button
            key={fmt}
            onClick={() => onSelect(fmt)}
            className={`p-3 rounded-lg border transition-all text-sm font-medium ${
              isActive
                ? 'border-primary bg-primary/10 text-white'
                : 'border-white/10 bg-dark-200/30 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {fmt}
          </button>
        )
      })}
    </div>
  )
}

function SpecsCard({ platform, format }) {
  if (!platform || !format) return null
  const spec = PLATFORMS[platform]?.formats[format]
  if (!spec) return null

  const specText = `${platform} - ${format}\n\nDimensions: ${spec.dimensions}\nAspect Ratio: ${spec.aspect}\nFile Types: ${spec.fileTypes}\nMax File Size: ${spec.maxFileSize}${spec.duration ? `\nDuration: ${spec.duration}` : ''}\n\nCharacter Limits:\n${Object.entries(spec.charLimits).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\nBest Practices:\n${spec.bestPractices.map(b => `  - ${b}`).join('\n')}\n\nQuick Tips: ${spec.quickTips}`

  return (
    <ResultCard title={`${platform} \u2014 ${format}`}>
      <div className="absolute top-4 right-4">
        <CopyButton text={specText} label="Copy Specs" />
      </div>
      <div className="relative space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-dark-200/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">Dimensions</p>
            <p className="text-white font-semibold text-sm">{spec.dimensions}</p>
          </div>
          <div className="bg-dark-200/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">Aspect Ratio</p>
            <p className="text-white font-semibold text-sm">{spec.aspect}</p>
          </div>
          <div className="bg-dark-200/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">File Types</p>
            <p className="text-white font-semibold text-sm">{spec.fileTypes}</p>
          </div>
          <div className="bg-dark-200/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-0.5">Max File Size</p>
            <p className="text-white font-semibold text-sm">{spec.maxFileSize}</p>
          </div>
          {spec.duration && (
            <div className="bg-dark-200/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-0.5">Duration</p>
              <p className="text-white font-semibold text-sm">{spec.duration}</p>
            </div>
          )}
        </div>

        {spec.charLimits && Object.keys(spec.charLimits).length > 0 && (
          <div>
            <h4 className="text-white font-medium text-sm mb-2">Character Limits</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(spec.charLimits).map(([key, val]) => (
                <div key={key} className="bg-dark-200/30 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-primary font-semibold text-sm">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-white font-medium text-sm mb-2">Best Practices</h4>
          <ul className="space-y-1.5">
            {spec.bestPractices.map((bp, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-primary mt-0.5">&#10003;</span>
                {bp}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-primary font-medium mb-0.5">Quick Tips</p>
          <p className="text-gray-300 text-sm">{spec.quickTips}</p>
        </div>
      </div>
    </ResultCard>
  )
}

export default function App() {
  const [platform, setPlatform] = useState(null)
  const [format, setFormat] = useState(null)
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ad-specs-bookmarks') || '[]')
    } catch { return [] }
  })
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('ad-specs-bookmarks', JSON.stringify(bookmarks))
    } catch { /* ignore */ }
  }, [bookmarks])

  const handlePlatformSelect = (p) => {
    setPlatform(p)
    setFormat(null)
  }

  const bookmarkKey = platform && format ? `${platform}::${format}` : null
  const isBookmarked = bookmarkKey && bookmarks.includes(bookmarkKey)

  const toggleBookmark = () => {
    if (!bookmarkKey) return
    setBookmarks(prev =>
      prev.includes(bookmarkKey)
        ? prev.filter(b => b !== bookmarkKey)
        : [...prev, bookmarkKey]
    )
  }

  const toggleCompare = (p, f) => {
    const key = `${p}::${f}`
    setCompareList(prev => {
      if (prev.includes(key)) return prev.filter(c => c !== key)
      if (prev.length >= 3) return prev
      return [...prev, key]
    })
  }

  const isInCompare = bookmarkKey ? compareList.includes(bookmarkKey) : false

  return (
    <ToolLayout
      title="Multi-Platform Ad Specs & Size Guide"
      description="Quickly find dimensions, file specs, character limits, and best practices for every major ad platform."
    >
      <div className="space-y-8">
        {/* Step 1: Platform */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Step 1: Select Platform</h2>
          <PlatformGrid selected={platform} onSelect={handlePlatformSelect} />
        </div>

        {/* Step 2: Format */}
        {platform && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Step 2: Select Format</h2>
            <FormatGrid platform={platform} selected={format} onSelect={setFormat} />
          </div>
        )}

        {/* Step 3: Specs */}
        {platform && format && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Step 3: Specs & Guidelines</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={toggleBookmark}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isBookmarked
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-dark-200/50 text-gray-400 border border-white/10 hover:text-white'
                }`}
              >
                {isBookmarked ? '\u2605 Bookmarked' : '\u2606 Bookmark'}
              </button>
              <button
                onClick={() => toggleCompare(platform, format)}
                disabled={!isInCompare && compareList.length >= 3}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isInCompare
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-dark-200/50 text-gray-400 border border-white/10 hover:text-white'
                } ${!isInCompare && compareList.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isInCompare ? 'Remove from Compare' : `Add to Compare (${compareList.length}/3)`}
              </button>
              {compareList.length >= 2 && (
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  {showCompare ? 'Hide Comparison' : 'Compare Formats'}
                </button>
              )}
            </div>
            <SpecsCard platform={platform} format={format} />
          </div>
        )}

        {/* Compare View */}
        {showCompare && compareList.length >= 2 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Format Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Spec</th>
                    {compareList.map(key => {
                      const [p, f] = key.split('::')
                      return (
                        <th key={key} className="text-left py-3 px-4 text-white font-medium">
                          {p} &mdash; {f}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {['dimensions', 'aspect', 'fileTypes', 'maxFileSize', 'duration', 'quickTips'].map(field => (
                    <tr key={field} className="border-b border-white/5">
                      <td className="py-3 px-4 text-gray-400 capitalize">{field.replace(/([A-Z])/g, ' $1')}</td>
                      {compareList.map(key => {
                        const [p, f] = key.split('::')
                        const spec = PLATFORMS[p]?.formats[f]
                        return (
                          <td key={key} className="py-3 px-4 text-gray-300">
                            {spec?.[field] || 'N/A'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Bookmarked Formats</h2>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map(key => {
                const [p, f] = key.split('::')
                return (
                  <button
                    key={key}
                    onClick={() => { setPlatform(p); setFormat(f) }}
                    className="px-3 py-1.5 bg-dark-200/50 border border-yellow-500/20 text-yellow-400/80 rounded-lg text-sm hover:bg-dark-200 transition-all"
                  >
                    {p} &mdash; {f}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
