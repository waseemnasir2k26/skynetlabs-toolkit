import { useState, useEffect, useRef } from 'react'

export function useAnimatedCounter(targetValue, duration = 1500, startOnMount = true) {
  const [value, setValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!startOnMount || hasStarted) return
    setHasStarted(true)

    const startTime = performance.now()
    const startValue = 0

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (targetValue - startValue) * eased)

      setValue(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [targetValue, duration, startOnMount, hasStarted])

  return value
}
