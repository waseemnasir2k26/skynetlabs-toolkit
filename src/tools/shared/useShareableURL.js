import { useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Hook to encode/decode tool state in URL search params for sharing.
 *
 * Usage:
 *   const { loadFromURL, generateShareURL } = useShareableURL(fields, setters)
 *
 * @param {Object} fields - { key: currentValue } map of fields to encode
 * @param {Object} setters - { key: setterFn } map of state setters
 * @returns {{ loadFromURL: () => boolean, generateShareURL: () => string }}
 */
export function useShareableURL(fields, setters) {
  const [searchParams] = useSearchParams()

  // Load values from URL on mount
  useEffect(() => {
    let loaded = false
    Object.keys(fields).forEach(key => {
      const val = searchParams.get(key)
      if (val !== null && setters[key]) {
        const parsed = isNaN(val) ? val : Number(val)
        setters[key](parsed)
        loaded = true
      }
    })
    return () => { loaded }
  }, []) // Only run on mount

  const generateShareURL = useCallback(() => {
    const url = new URL(window.location.href)
    url.search = ''
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  }, [fields])

  return { generateShareURL }
}

/**
 * ShareButton component — generates and copies a shareable link.
 */
export { default as ShareButton } from './ShareButton'
