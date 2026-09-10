// Central source of truth for RideIN's fare structure.
// Update these numbers here and every screen that quotes a fare stays in sync.
export const FARES = {
  pickup: {
    key: 'pickup',
    label: 'Pickup',
    badge: 'Shared seats',
    description: 'Standard keke ride, seats shared with other passengers along the route.',
    riderFare: 300,
    serviceFee: 100,
    total: 400,
  },
  chatter: {
    key: 'chatter',
    label: 'Chatter',
    badge: 'Private, full keke',
    description: 'The whole keke to yourself or your group — no stops for other passengers.',
    riderFare: 1200,
    serviceFee: 300,
    total: 1500,
  },
}

// The thin space after ₦ is intentional: it's visually negligible but stops the
// Naira glyph from ever crowding the first digit if a browser has to substitute
// a fallback font for that one character (not every typeface ships it).
export const formatNaira = (amount) => `₦ ${amount.toLocaleString('en-NG')}`
