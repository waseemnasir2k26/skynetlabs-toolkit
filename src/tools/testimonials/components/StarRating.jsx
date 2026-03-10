import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, onChange, size = 'md', readOnly = false }) {
  const [hovered, setHovered] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || rating)
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            className={`transition-all duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-150 ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400 star-glow'
                  : 'text-dark-400 fill-transparent'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
