import { useEffect, useRef } from 'react'
import { useGoogleMaps } from '../../hooks/useGoogleMaps.js'
import { projectToPercent } from '../../lib/geo.js'
import { RIDEIN_MAP_STYLE } from '../../data/mapStyle.js'
import MapPin from './MapPin.jsx'
import RoadGridSVG from './RoadGridSVG.jsx'

// Renders the real Google Map for Millennium Estate once VITE_GOOGLE_MAPS_API_KEY
// is set (see .env.example / README), positioning `you` and every marker by
// real lat/lng. Until a key is configured — or if the key/network fails —
// this falls back to the illustrated placeholder map so the app still runs
// out of the box.
//
// `markers`: [{ id, position:{lat,lng}, icon, label, tone, selected, onClick }]
// `you`: { position:{lat,lng}, icon, label }
export default function GoogleEstateMap({ center, zoom = 16, you, markers, variant = 'passenger' }) {
  const { isLoaded, hasKey, loadError } = useGoogleMaps()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRefs = useRef({})

  // Create the map once.
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center,
      zoom,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      styles: RIDEIN_MAP_STYLE,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // Keep markers in sync with live data (positions update on every simulated tick).
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return
    const google = window.google
    const map = mapRef.current

    function upsert(id, position, { color, icon, title, selected, onClick, zIndex }) {
      let marker = markerRefs.current[id]
      if (!marker) {
        marker = new google.maps.Marker({ map, position })
        markerRefs.current[id] = marker
      } else {
        marker.setPosition(position)
      }
      if (onClick) {
        google.maps.event.clearListeners(marker, 'click')
        marker.addListener('click', onClick)
      }
      marker.setTitle(title || '')
      marker.setZIndex(zIndex || 1)
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: selected ? 12 : 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      })
      marker.setLabel({ text: icon, fontSize: '13px' })
    }

    if (you) {
      upsert('__you__', you.position, { color: '#1B211D', icon: you.icon || '●', title: you.label, zIndex: 5 })
    }
    markers.forEach((m) => {
      upsert(m.id, m.position, {
        color: m.selected ? '#C7862E' : m.tone === 'accent' ? '#C7862E' : '#1F4E43',
        icon: m.icon,
        title: m.label,
        selected: m.selected,
        onClick: m.onClick,
        zIndex: m.selected ? 4 : 2,
      })
    })
  }, [isLoaded, center, you, markers])

  const showRealMap = hasKey && !loadError
  const showFallback = !showRealMap || !isLoaded

  return (
    <div className="relative h-[210px] w-full">
      {showRealMap && <div ref={containerRef} className="h-full w-full" />}

      {showFallback && (
        <div className="absolute inset-0">
          <RoadGridSVG variant={variant} />
          {you && (
            <MapPin
              top={projectToPercent(you.position, center).top}
              left={projectToPercent(you.position, center).left}
              tone="ink"
              icon={you.icon || '●'}
              label={you.label}
            />
          )}
          {markers.map((m) => {
            const pos = projectToPercent(m.position, center)
            return (
              <MapPin
                key={m.id}
                top={pos.top}
                left={pos.left}
                icon={m.icon}
                label={m.label}
                selected={m.selected}
                onClick={m.onClick}
                tone={m.tone}
              />
            )
          })}
        </div>
      )}

      {!hasKey && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-surface/95 px-2.5 py-1.5 text-[10.5px] font-medium text-ink-faint shadow-soft dark:bg-surface-dark/95 dark:text-ink-faint-dark">
          Preview map, add <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to show the live map.
        </div>
      )}
      {hasKey && loadError && (
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-surface/95 px-2.5 py-1.5 text-[10.5px] font-medium text-danger shadow-soft dark:bg-surface-dark/95 dark:text-danger-dark">
          Couldn't load Google Maps, check that your API key is valid and Maps JavaScript API is enabled.
        </div>
      )}
    </div>
  )
}
