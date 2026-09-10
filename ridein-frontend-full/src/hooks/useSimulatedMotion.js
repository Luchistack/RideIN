import { useEffect, useState } from 'react'

const STEP_DEG = 0.00025 // roughly a 25-30m nudge each tick
const MAX_RADIUS_DEG = 0.0035 // keep wandering within ~350-400m of the estate center

function nudge(position, center) {
  const lat = position.lat + (Math.random() - 0.5) * STEP_DEG * 2
  const lng = position.lng + (Math.random() - 0.5) * STEP_DEG * 2

  // Simple pull-back-toward-center clamp so riders don't wander off the estate map.
  const dLat = lat - center.lat
  const dLng = lng - center.lng
  const dist = Math.sqrt(dLat * dLat + dLng * dLng)
  if (dist <= MAX_RADIUS_DEG) return { lat, lng }

  const scale = MAX_RADIUS_DEG / dist
  return { lat: center.lat + dLat * scale, lng: center.lng + dLng * scale }
}

// Simulates one moving point (e.g. "my" position while online as a rider),
// nudging it a little every `intervalMs`. Replace with real GPS position
// updates from your rider app once you have them.
export function useSimulatedPosition(initialPosition, center, intervalMs = 4000) {
  const [position, setPosition] = useState(initialPosition)

  useEffect(() => {
    const id = setInterval(() => setPosition((p) => nudge(p, center)), intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, intervalMs])

  return position
}

// Same idea, but for a whole list of entities (e.g. every nearby rider),
// preserving every other field and only updating `position`.
export function useSimulatedPositions(initialList, center, intervalMs = 4000) {
  const [list, setList] = useState(initialList)

  useEffect(() => {
    const id = setInterval(() => {
      setList((current) => current.map((item) => ({ ...item, position: nudge(item.position, center) })))
    }, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, intervalMs])

  return list
}
