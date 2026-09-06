// RideIN launches with a single estate. Everything about "where" — the map
// center, the gate marker, how tight the zoom is — comes from here.
//
// IMPORTANT: these coordinates are a placeholder (a generic point in Lagos),
// not Millennium Estate's real location. Replace `center` and `gate` with the
// estate's actual surveyed coordinates before this goes live — you can read
// them off Google Maps by right-clicking the real gate location and copying
// the lat/lng that appears.
export const MILLENNIUM_ESTATE = {
  name: 'Millennium Estate',
  center: { lat: 6.5495, lng: 3.3841 },
  gate: { lat: 6.5498, lng: 3.3838 },
  zoom: 16,
}
