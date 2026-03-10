import React, { useState, useEffect, useRef } from 'react'

export default function AnimatedNumber({ value, duration = 1500, prefix = '', suffix = '', className = '' }) {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()
    const startVal = 0

    function tick(now) {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(startVal + (value - startVal) * eased))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick)
      }
    }

    animationRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [value, duration])

  const formatted = displayValue.toLocaleString()

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
