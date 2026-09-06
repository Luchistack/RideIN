// Sample order + payment history for the rider dashboard demo. There's no
// backend yet, so every rider account sees the same illustrative history —
// wire this up to a real orders/payments API (scoped to the logged-in
// rider's own id) once one exists. Deliberately read-only: the dashboard
// that renders this data has no edit or delete controls, by design — a
// rider's history is a permanent record, not something they can clear.
export const ORDER_HISTORY = [
  { id: 'o1', date: '2026-09-05 17:42', passenger: 'Ada O.', type: 'Pickup', fare: 300, rating: 5 },
  { id: 'o2', date: '2026-09-05 16:10', passenger: 'The Balogun family', type: 'Chatter', fare: 1200, rating: 5 },
  { id: 'o3', date: '2026-09-05 14:55', passenger: 'Chidi A.', type: 'Pickup', fare: 300, rating: 4 },
  { id: 'o4', date: '2026-09-05 12:20', passenger: 'Ngozi K.', type: 'Pickup', fare: 300, rating: 5 },
  { id: 'o5', date: '2026-09-04 19:05', passenger: 'Tunde B.', type: 'Chatter', fare: 1200, rating: 5 },
  { id: 'o6', date: '2026-09-04 09:30', passenger: 'Fatima S.', type: 'Pickup', fare: 300, rating: 4 },
]

export const PAYMENT_HISTORY = [
  { id: 'p1', date: '2026-09-05', description: 'Daily fare remittance', amount: 3300, method: 'Bank transfer' },
  { id: 'p2', date: '2026-09-04', description: 'Daily fare remittance', amount: 1500, method: 'Bank transfer' },
  { id: 'p3', date: '2026-09-04', description: 'Cash tip (Ada O.)', amount: 200, method: 'Cash' },
  { id: 'p4', date: '2026-09-03', description: 'Daily fare remittance', amount: 2700, method: 'Bank transfer' },
]
