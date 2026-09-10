import { useEffect, useState } from 'react'
import { loadScript } from '../lib/loadScript.js'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Loads the Google Maps JavaScript API once and reports back whether it's
// ready. Returns { isLoaded, loadError, hasKey } — components should render
// their own fallback (e.g. the illustrated placeholder map) when hasKey is
// false or loadError is set, so the app still works before you've added a
// real key to .env.
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(Boolean(window.google?.maps))
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!API_KEY) return
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    let cancelled = false
    const src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&loading=async`
    loadScript(src)
      .then(() => {
        if (!cancelled) setIsLoaded(true)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { isLoaded, loadError, hasKey: Boolean(API_KEY) }
}
