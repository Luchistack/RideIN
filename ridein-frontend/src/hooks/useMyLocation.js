import { useCallback, useEffect, useRef, useState } from 'react'
import { savePassengerLocation, clearPassengerLocation, readPassengerLocation } from '../lib/sharedLocation.js'

// Wraps the browser Geolocation API for a passenger who wants to share (and
// keep monitoring) their real position, with a manual-entry fallback for
// when permission is denied, the API is unavailable, or there's simply no
// real GPS available (e.g. a headless test browser). Every successful fix
// is written to the shared-location mailbox (see lib/sharedLocation.js) so
// the rider side can read it back.
export function useMyLocation(userId) {
  const [location, setLocation] = useState(() => readPassengerLocation(userId))
  const [status, setStatus] = useState('idle') // idle | requesting | live | error
  const [error, setError] = useState('')
  const watchIdRef = useRef(null)

  useEffect(() => {
    setLocation(readPassengerLocation(userId))
  }, [userId])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    watchIdRef.current = null
  }, [])

  useEffect(() => stopWatching, [stopWatching])

  function handlePosition(pos) {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    setLocation({ ...coords, updatedAt: Date.now() })
    setError('')
    savePassengerLocation(userId, coords)
  }

  function handleError() {
    // Permission denied, position unavailable, or timed out — all common
    // and expected (private browsing, no GPS hardware, a test browser with
    // no location permission granted). Never let this reach the console as
    // an unhandled rejection; just surface a friendly message and let the
    // manual fallback take over.
    setStatus('error')
    setError('Could not get your location (permission denied or unavailable). Set it manually below instead.')
  }

  function shareOnce() {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('This browser has no location support. Set your location manually below.')
      return
    }
    setStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePosition(pos)
        setStatus('live')
      },
      handleError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  function startLiveTracking() {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('This browser has no location support. Set your location manually below.')
      return
    }
    setStatus('requesting')
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handlePosition(pos)
        setStatus('live')
      },
      handleError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  function stopSharing() {
    stopWatching()
    setStatus('idle')
    setLocation(null)
    clearPassengerLocation(userId)
  }

  function setManualLocation(coords) {
    stopWatching()
    setError('')
    setStatus('live')
    setLocation({ ...coords, updatedAt: Date.now() })
    savePassengerLocation(userId, coords)
  }

  return { location, status, error, shareOnce, startLiveTracking, stopSharing, setManualLocation }
}
