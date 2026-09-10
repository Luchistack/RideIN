// Straight-line ("as the crow flies") distance between two lat/lng points,
// via the haversine formula. This runs entirely client-side and needs no API
// call — good enough to show "how close" someone is on a small estate.
//
// Note: this is not driving/walking distance along actual roads. Real turn-
// by-turn distance would need the Google Distance Matrix or Directions API,
// which (a) costs per call and (b) generally has to be called from a server,
// not the browser, to keep your API key safe — out of scope for this
// frontend-only build. Haversine is the right tradeoff for an estate-sized
// map where the difference between straight-line and road distance is small.
const EARTH_RADIUS_M = 6371000

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function haversineMeters(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return EARTH_RADIUS_M * c
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`
  return `${(meters / 1000).toFixed(1)}km`
}

// Rough ETA assuming an average estate-road keke speed of ~15 km/h.
// Purely illustrative — replace with a real routing ETA once you have one.
export function estimateEtaMinutes(meters) {
  const KEKE_SPEED_KMH = 15
  const minutes = (meters / 1000 / KEKE_SPEED_KMH) * 60
  return Math.max(1, Math.round(minutes))
}

export function formatEta(meters) {
  const mins = estimateEtaMinutes(meters)
  return `${mins} min`
}
