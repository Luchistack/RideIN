import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default marker icons, which otherwise break under Vite's
// asset bundling (Leaflet expects to find them via script-tag-relative
// paths that don't exist in a bundled build).
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// A small OpenStreetMap location picker: a draggable pin you can also
// reposition by tapping anywhere on the map. Free -- no API key, no
// billing -- via OpenStreetMap's tile servers.
export default function LocationPickerMap({ center, value, onChange, height = 220 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return
    const start = value || center
    const map = L.map(mapRef.current, {
      center: [start.lat, start.lng],
      zoom: 16,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const marker = L.marker([start.lat, start.lng], { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      onChange({ lat, lng })
    })
    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    // Leaflet sometimes measures its container before it has real layout
    // dimensions (e.g. right after a tab switch); nudge it once settled.
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (markerRef.current && value) {
      markerRef.current.setLatLng([value.lat, value.lng])
    }
  }, [value])

  return (
    <div>
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-[11px] border border-line dark:border-line-dark"
      />
      <p className="mt-1.5 text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
        Tap the map or drag the pin to set your exact spot.
      </p>
    </div>
  )
}
