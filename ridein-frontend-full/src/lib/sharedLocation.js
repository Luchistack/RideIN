// A tiny cross-component "GPS mailbox": lets a passenger's real, browser-
// reported location (see PassengerPhone's "Share my location" control) be
// read back by the rider side (RiderPhone) so a rider can see where an
// actual passenger is, not just the simulated demo positions.
//
// There's no backend yet, so this is just localStorage — every passenger
// who shares their location writes one entry here, keyed by their user id,
// and any rider's tab can read it back. Replace this with a real live-
// location channel (websocket, push, etc.) once there's a backend; nothing
// that reads via `readPassengerLocation`/`readAllSharedLocations` would need
// to change shape.
const PREFIX = 'ridein-shared-location:'
const EVENT_NAME = 'ridein:shared-location'

export function savePassengerLocation(userId, coords) {
  if (!userId || !coords) return
  try {
    const entry = { lat: coords.lat, lng: coords.lng, updatedAt: Date.now() }
    localStorage.setItem(PREFIX + userId, JSON.stringify(entry))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId } }))
  } catch {
    // localStorage can throw in some private-browsing modes — sharing a
    // location is a nice-to-have, never worth crashing the app over.
  }
}

export function clearPassengerLocation(userId) {
  if (!userId) return
  try {
    localStorage.removeItem(PREFIX + userId)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId } }))
  } catch {
    // see savePassengerLocation
  }
}

export function readPassengerLocation(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(PREFIX + userId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Returns the single most-recently-updated shared location across every
// passenger who has ever shared one on this browser — good enough for a
// demo where a rider isn't tied to one specific passenger ahead of time.
export function readMostRecentSharedLocation() {
  try {
    let best = null
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(PREFIX)) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (!best || parsed.updatedAt > best.updatedAt) best = parsed
    }
    return best
  } catch {
    return null
  }
}

// Subscribes to both same-tab updates (our own CustomEvent) and cross-tab
// updates (the native `storage` event), calling `onChange` either way.
// Returns an unsubscribe function.
export function subscribeToSharedLocations(onChange) {
  function handleCustom() {
    onChange()
  }
  function handleStorage(e) {
    if (!e.key || e.key.startsWith(PREFIX)) onChange()
  }
  window.addEventListener(EVENT_NAME, handleCustom)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom)
    window.removeEventListener('storage', handleStorage)
  }
}
