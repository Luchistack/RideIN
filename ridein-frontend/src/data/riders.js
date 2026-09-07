import keke1 from '../assets/riders/keke-1.jpg'
import keke2 from '../assets/riders/keke-2.jpg'
import keke3 from '../assets/riders/keke-3.jpg'

// Sample nearby riders shown on the passenger's map, positioned by real
// lat/lng around Millennium Estate (see data/estate.js) rather than a
// percentage placement — so they plot correctly on the real Google Map.
// `photo` is a placeholder image (their keke) shown when a passenger is
// choosing who to request — replace with each rider's real verified photo
// (captured during signup, see FaceVerificationStep.jsx) once there's a
// backend to store it.
// Replace with a live feed (rider location + status) from your backend once
// it exists.
export const NEARBY_RIDERS = [
  { id: 'r1', name: 'Emeka O.', rating: 4.9, photo: keke1, position: { lat: 6.5502, lng: 3.3833 } },
  { id: 'r2', name: 'Bashir T.', rating: 4.7, photo: keke2, position: { lat: 6.5493, lng: 3.3849 } },
  { id: 'r3', name: 'Ngozi K.', rating: 5.0, photo: keke3, position: { lat: 6.5505, lng: 3.3843 } },
]
