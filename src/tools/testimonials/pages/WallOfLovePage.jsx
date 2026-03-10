import { useState, useMemo } from 'react'
import { Heart, Filter, LayoutGrid, List, Columns, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTestimonials } from '../contexts/TestimonialContext'
import TestimonialCard from '../components/TestimonialCard'

const layouts = [
  { id: 'masonry', label: 'Masonry Grid', icon: LayoutGrid },
  { id: 'carousel', label: 'Carousel', icon: Columns },
  { id: 'list', label: 'Simple List', icon: List },
]

export default function WallOfLovePage() {
  const { approvedTestimonials, settings } = useTestimonials()
  const [layout, setLayout] = useState('masonry')
  const [filterService, setFilterService] = useState('')
  const [filterRating, setFilterRating] = useState(0)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const uniqueServices = [...new Set(approvedTestimonials.map(t => t.service).filter(Boolean))]

  const filtered = useMemo(() => {
    let result = [...approvedTestimonials]
    if (filterService) result = result.filter(t => t.service === filterService)
    if (filterRating > 0) result = result.filter(t => t.rating >= filterRating)
    return result
  }, [approvedTestimonials, filterService, filterRating])

  const carouselPrev = () => setCarouselIndex(i => Math.max(0, i - 1))
  const carouselNext = () => setCarouselIndex(i => Math.min(filtered.length - 1, i + 1))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-primary-400" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-dark-50 mb-3 glow-text">
          {settings.wallTitle || 'Wall of Love'}
        </h1>
        <p className="text-dark-300 text-lg max-w-2xl mx-auto">
          {settings.wallSubtitle || 'See what our clients are saying about working with us'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dark-400" />
          {uniqueServices.length > 0 && (
            <select
              className="input-field py-2 text-sm w-auto"
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
            >
              <option value="">All Services</option>
              {uniqueServices.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <select
            className="input-field py-2 text-sm w-auto"
            value={filterRating}
            onChange={e => setFilterRating(Number(e.target.value))}
          >
            <option value="0">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1 border border-dark-400/20">
          {layouts.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setLayout(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                layout === id
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Heart className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-200 mb-2">No testimonials to show</h3>
          <p className="text-dark-400">
            {approvedTestimonials.length === 0
              ? 'Approve some testimonials from the Dashboard to see them here.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <>
          {/* Masonry Grid */}
          {layout === 'masonry' && (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filtered.map((t, i) => (
                <div key={t.id} className="masonry-item break-inside-avoid">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          )}

          {/* Carousel */}
          {layout === 'carousel' && (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                >
                  {filtered.map(t => (
                    <div key={t.id} className="w-full flex-shrink-0 px-4">
                      <div className="max-w-2xl mx-auto">
                        <TestimonialCard testimonial={t} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {filtered.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={carouselPrev}
                    disabled={carouselIndex === 0}
                    className="p-2 rounded-full bg-dark-700 hover:bg-dark-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-dark-400">
                    {carouselIndex + 1} / {filtered.length}
                  </span>
                  <button
                    onClick={carouselNext}
                    disabled={carouselIndex >= filtered.length - 1}
                    className="p-2 rounded-full bg-dark-700 hover:bg-dark-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Simple List */}
          {layout === 'list' && (
            <div className="max-w-2xl mx-auto space-y-4">
              {filtered.map(t => (
                <div key={t.id} className="masonry-item">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-dark-400/10">
        <p className="text-dark-400 text-sm">
          Powered by{' '}
          <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Skynet Labs
          </a>
        </p>
      </div>
    </div>
  )
}
