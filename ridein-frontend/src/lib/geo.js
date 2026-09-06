// Projects a real lat/lng onto a 0-100% position within a fixed-size square
// centered on the estate. Used only by the illustrated fallback map (shown
// before a Google Maps API key is configured) so the same lat/lng data in
// data/riders.js / data/passengers.js works whether or not the real map has
// loaded yet.
const DEFAULT_SPAN_DEG = 0.006 // roughly a 650m-wide window around the estate

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function projectToPercent(position, center, spanDeg = DEFAULT_SPAN_DEG) {
  const latMin = center.lat - spanDeg / 2
  const latMax = center.lat + spanDeg / 2
  const lngMin = center.lng - spanDeg / 2
  const lngMax = center.lng + spanDeg / 2

  const left = ((position.lng - lngMin) / (lngMax - lngMin)) * 100
  const top = (1 - (position.lat - latMin) / (latMax - latMin)) * 100

  return { top: clamp(top, 6, 94), left: clamp(left, 6, 94) }
}
