// Sample ride + payment history for the passenger dashboard demo. There's no
// backend yet, so every passenger account sees the same illustrative
// history — wire this up to a real rides/payments API (scoped to the
// logged-in passenger's own id) once one exists. Deliberately read-only:
// the dashboard that renders this data has no edit or delete controls, by
// design — a passenger's history is a permanent record, not something they
// can clear.
export const RIDE_HISTORY = [
  { id: 'pr1', date: '2026-09-05 17:42', rider: 'Emeka O.', type: 'Pickup', fare: 400, ratingGiven: 5 },
  { id: 'pr2', date: '2026-09-04 09:12', rider: 'Ngozi K.', type: 'Chatter', fare: 1500, ratingGiven: 5 },
  { id: 'pr3', date: '2026-09-02 19:30', rider: 'Bashir T.', type: 'Pickup', fare: 400, ratingGiven: 4 },
  { id: 'pr4', date: '2026-08-30 08:05', rider: 'Emeka O.', type: 'Pickup', fare: 400, ratingGiven: 5 },
]

// Every ride is paid for individually by bank transfer straight to RideIN's
// account — there is no pre-funded balance behind these entries.
export const PAYMENT_HISTORY = [
  { id: 'pw1', date: '2026-09-05', description: 'Ride — Emeka O. (Pickup)', amount: -400, method: 'Bank transfer' },
  { id: 'pw2', date: '2026-09-05', description: 'Cash tip — Emeka O.', amount: -200, method: 'Cash' },
  { id: 'pw3', date: '2026-09-04', description: 'Ride — Ngozi K. (Chatter)', amount: -1500, method: 'Bank transfer' },
  { id: 'pw4', date: '2026-09-02', description: 'Ride — Bashir T. (Pickup)', amount: -400, method: 'Bank transfer' },
]
