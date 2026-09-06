// A muted Google Maps style so the live map sits quietly alongside the rest
// of the brand instead of default Google-Maps blue/yellow — hides POI clutter
// (shops, icons) since none of that matters for an estate ride map, and
// leans the palette toward the site's sand/teal tones.
export const RIDEIN_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#EFF1EA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7A8479' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#EFF1EA' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#E7E9E0' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#DAD9CE' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#DCE7E1' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#DCE7DE' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#B7D4CB' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
]
