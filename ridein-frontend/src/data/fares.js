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
    description: 'The whole keke to yourself or your group, no stops for other passengers.',
    riderFare: 1200,
    serviceFee: 300,
    total: 1500,
  },
  urgent: {
    key: 'urgent',
    label: 'Urgent pickup',
    badge: 'Priority',
    description: 'Same as Pickup, but flagged so a rider grabs it fast.',
    riderFare: 1700,
    serviceFee: 300,
    total: 2000,
  },
  delivery: {
    key: 'delivery',
    label: 'Pickup and delivery',
    badge: 'Price set by Admin',
    description: 'Keke picks up an item and drops it off elsewhere in the estate. Admin reviews your addresses and sends you the price before a rider is dispatched.',
    riderFare: null,
    serviceFee: null,
    total: null,
  },
}

// The thin space after ₦ is intentional: it's visually negligible but stops the
// Naira glyph from ever crowding the first digit if a browser has to substitute
// a fallback font for that one character (not every typeface ships it).
export const formatNaira = (amount) => `₦ ${amount.toLocaleString('en-NG')}`

// Where to pay for a ride, for now -- swap this for a per-rider or
// per-estate account once RideIN has more than one. Single source of truth
// so BookRidePage and the "Support RideIN" navbar panel never drift apart.
export const PAYMENT_ACCOUNT = { bank: 'PalmPay', name: 'Dike Faith', number: '7073881814' }
