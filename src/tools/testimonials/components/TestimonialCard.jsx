import { Star, Play, Quote } from 'lucide-react'
import StarRating from './StarRating'

function getVideoEmbedUrl(url) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`
  return null
}

function getVideoThumbnail(url) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  return null
}

export default function TestimonialCard({ testimonial, showStatus = false, compact = false }) {
  const { name, company, photoUrl, rating, testimonial: text, service, videoUrl, status, starred, projectName } = testimonial
  const thumbnail = getVideoThumbnail(videoUrl)
  const embedUrl = getVideoEmbedUrl(videoUrl)

  const initials = (name || 'A')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="glass-card-hover p-5 flex flex-col gap-4 relative overflow-hidden group">
      {starred && (
        <div className="absolute top-3 right-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 star-glow" />
        </div>
      )}

      {showStatus && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 star-glow" />}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            status === 'approved' ? 'bg-primary-500/20 text-primary-400' :
            status === 'rejected' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {status}
          </span>
        </div>
      )}

      <Quote className="absolute -top-2 -left-2 w-16 h-16 text-primary-500/5 rotate-180" />

      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/30 flex-shrink-0"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div
          className={`w-12 h-12 rounded-full bg-primary-500/20 border-2 border-primary-500/30 flex-shrink-0 items-center justify-center text-primary-400 font-bold text-sm ${photoUrl ? 'hidden' : 'flex'}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-dark-50 truncate">{name}</h4>
          {company && <p className="text-sm text-dark-300 truncate">{company}</p>}
        </div>
      </div>

      {rating > 0 && <StarRating rating={rating} readOnly size="sm" />}

      <p className={`text-dark-200 leading-relaxed text-sm ${compact ? 'line-clamp-4' : ''}`}>
        "{text}"
      </p>

      {videoUrl && (
        <div className="relative rounded-xl overflow-hidden bg-dark-700 aspect-video">
          {thumbnail ? (
            <>
              <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </a>
            </>
          ) : (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center hover:bg-dark-600 transition-colors"
            >
              <div className="text-center">
                <Play className="w-10 h-10 text-primary-400 mx-auto mb-2" />
                <span className="text-sm text-dark-300">Watch Video</span>
              </div>
            </a>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-auto">
        {service && (
          <span className="text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 font-medium">
            {service}
          </span>
        )}
        {projectName && (
          <span className="text-xs px-3 py-1 rounded-full bg-dark-600 text-dark-300 border border-dark-400/20">
            {projectName}
          </span>
        )}
      </div>
    </div>
  )
}
