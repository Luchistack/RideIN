// Shared local storage for the customer-care chat — one thread per account,
// keyed by user id. There's no backend yet, so this is what stands in for a
// real support inbox (Zendesk, Intercom, a WhatsApp Business number,
// whatever you pick later). Read by both SupportPage (the rider/passenger
// side of the conversation) and AdminDashboardPage (the "inbox" side), so
// the two definitions of a thread can never drift apart.
const THREADS_KEY = 'ridein-support-threads'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(THREADS_KEY)) || {}
  } catch {
    return {}
  }
}

function writeAll(threads) {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads))
}

function makeId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function getThread(userId) {
  return readAll()[userId] || null
}

// Every thread, newest activity first — for the admin inbox list.
export function getAllThreads() {
  const threads = readAll()
  return Object.entries(threads)
    .map(([userId, thread]) => ({ userId, ...thread }))
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.at || ''
      const bLast = b.messages[b.messages.length - 1]?.at || ''
      return bLast.localeCompare(aLast)
    })
}

// `from` is 'user' (the rider/passenger) or 'agent' (RideIN customer care —
// used by the admin dashboard's reply box).
export function appendMessage(userId, meta, from, text) {
  const threads = readAll()
  const existing = threads[userId] || {
    userName: meta.userName,
    userEmail: meta.userEmail,
    userRole: meta.userRole,
    messages: [],
  }
  const message = { id: makeId(), from, text, at: new Date().toISOString() }
  const updated = { ...existing, messages: [...existing.messages, message] }
  threads[userId] = updated
  writeAll(threads)
  return updated
}
