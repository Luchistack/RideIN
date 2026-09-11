import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatNaira } from '../data/fares.js'
import Avatar from '../components/ui/Avatar.jsx'

const AVAILABLE_POLL_MS = 8000
const ACTIVE_POLL_MS = 6000
const OPEN_STATUSES = ['requested', 'accepted', 'enroute']

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-faint-dark">
        {label}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums text-brand dark:text-brand-light">{value}</div>
    </div>
  )
}

// A bold, tactile "order" card for one pending ride request — this is the
// rider's "check order" view: the passenger's pickup spot (or live
// location), the fare if one was set, and a one-tap Accept. Once accepted
// here, the backend guarantees no other rider can also accept it.
function AvailableRideCard({ ride, onAccept, busy }) {
  return (
    <div className="flex-none w-[260px] rounded-2xl border border-line bg-surface p-4 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-0.5 dark:border-line-dark dark:bg-surface-dark dark:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)]">
      <div className="mb-2.5 flex items-center gap-2.5">
        <Avatar name={ride.passenger?.name} photo={ride.passenger?.photo} size={38} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold">{ride.passenger?.name || 'Passenger'}</div>
          {ride.requestedRider && (
            <span className="text-[11px] font-bold uppercase tracking-wide text-accent-deep dark:text-accent-light">
              Requested you directly
            </span>
          )}
        </div>
      </div>
      <div className="mb-3 rounded-xl bg-surface-2 px-3 py-2.5 text-[12.5px] text-ink-soft dark:bg-surface-2-dark dark:text-ink-soft-dark">
        {ride.pickupAddress || 'Pickup shared as a live location — open the map to see it.'}
      </div>
      {ride.fare != null && (
        <div className="mb-3 font-mono text-[13px] font-bold text-brand dark:text-brand-light">
          {formatNaira(ride.fare)}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => onAccept(ride.id)}
        className="w-full rounded-full bg-brand py-2.5 text-[12.5px] font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Accepting…' : 'Accept ride'}
      </button>
    </div>
  )
}

function PaymentStatusNote({ payment }) {
  if (!payment) {
    return (
      <p className="mb-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
        No payment submitted yet — check with the passenger before you drive off.
      </p>
    )
  }
  const amountText =
    payment.amount != null
      ? ` — ${formatNaira(payment.amount)}${payment.tipAmount ? ` + ${formatNaira(payment.tipAmount)} tip` : ''}`
      : ''
  const map = {
    pending: [`Payment submitted${amountText} — waiting on an admin to confirm it.`, 'text-accent-deep dark:text-accent-light'],
    confirmed: [`✓ Payment confirmed by an admin${amountText}.`, 'text-good dark:text-good-dark'],
    failed: ['Payment marked as not paid — check with the passenger.', 'text-danger dark:text-danger-dark'],
  }
  const [text, cls] = map[payment.status] || [payment.status, '']
  return <p className={`mb-3 text-[12.5px] font-semibold ${cls}`}>{text}</p>
}

// Inline "rate the passenger" form for one completed ride the rider hasn't
// rated yet -- mirrors the passenger's star+comment rating of the rider,
// just the other direction. Collapsed to a single button until opened.
function RatePassengerCell({ ride, onRated }) {
  const { ratePassenger } = useAuth()
  const [open, setOpen] = useState(false)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (ride.riderRating != null) {
    return <span className="text-[12.5px] font-semibold text-good dark:text-good-dark">★ {ride.riderRating} rated</span>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-line px-3 py-1 text-[11.5px] font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
      >
        Rate passenger
      </button>
    )
  }

  async function submit() {
    if (!stars || busy) return
    setBusy(true)
    setErr('')
    try {
      const updated = await ratePassenger(ride.id, { rating: stars, comment: comment.trim() || undefined })
      onRated(updated)
      setOpen(false)
    } catch (e) {
      setErr(e.message || 'Could not submit that rating.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-[220px] rounded-xl border border-line bg-surface p-2.5 dark:border-line-dark dark:bg-surface-dark">
      <div className="mb-1.5 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            className={`text-lg leading-none ${n <= stars ? 'text-accent' : 'text-line dark:text-line-dark'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comment (optional)"
        rows={2}
        className="mb-1.5 w-full resize-none rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px] text-ink outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
      />
      {err && <p className="mb-1.5 text-[11px] font-semibold text-danger dark:text-danger-dark">{err}</p>}
      <button
        type="button"
        disabled={!stars || busy}
        onClick={submit}
        className="w-full rounded-full bg-brand py-1.5 text-[11.5px] font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Submitting…' : 'Submit rating'}
      </button>
    </div>
  )
}

function ActiveRideBanner({ ride, onCancel, cancelling, payment }) {
  return (
    <div className="mb-10 rounded-[26px] border-2 border-line bg-gradient-to-b from-surface to-surface-2 p-4 shadow-[0_24px_55px_-22px_rgba(0,0,0,0.4)] dark:border-line-dark dark:from-surface-dark dark:to-surface-2-dark dark:shadow-[0_24px_55px_-22px_rgba(0,0,0,0.7)]">
      <div className="rounded-[18px] bg-paper p-4 dark:bg-paper-dark">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-accent-tint px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light">
            Active ride
          </span>
          {ride.fare != null && (
            <span className="font-mono text-[13px] font-bold text-brand dark:text-brand-light">
              {formatNaira(ride.fare)}
            </span>
          )}
        </div>
        <div className="mb-3 flex items-center gap-3">
          <Avatar name={ride.passenger?.name} photo={ride.passenger?.photo} size={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{ride.passenger?.name}</div>
            <div className="truncate text-[12px] text-ink-faint dark:text-ink-faint-dark">
              {ride.pickupAddress || 'Live location shared'}
            </div>
          </div>
          {ride.passenger?.phone && (
            <a
              href={`tel:${ride.passenger.phone}`}
              className="flex-none rounded-full bg-brand px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-brand-deep"
            >
              Call {ride.passenger.phone}
            </a>
          )}
        </div>
        <PaymentStatusNote payment={payment} />
        <p className="mb-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
          If the passenger isn't at the pickup spot, you're not required to wait — lateness fees are settled
          directly between you and the passenger. The passenger marks the ride complete once you're done.
        </p>
        <button
          type="button"
          disabled={cancelling}
          onClick={onCancel}
          className="w-full rounded-full border border-danger py-2.5 text-sm font-bold text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-danger-dark dark:text-danger-dark dark:hover:bg-danger-dark/10"
        >
          Cancel ride
        </button>
      </div>
    </div>
  )
}

export default function RiderDashboardPage() {
  const { user, logout, listAvailableRides, listMyRides, acceptRide, cancelRide, listMyPayments } = useAuth()

  const [available, setAvailable] = useState([])
  const [activeRide, setActiveRide] = useState(null)
  const [activePayment, setActivePayment] = useState(null)
  const [acceptingId, setAcceptingId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  // Real ride/payment history — replaces the old hardcoded demo records so
  // every account starts with a clean, honest "no rides yet" instead of
  // fake sample data.
  const [history, setHistory] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const availablePollRef = useRef(null)
  const activePollRef = useRef(null)

  useEffect(() => {
    if (!user || user.role !== 'rider') return

    async function pollActive() {
      try {
        const mine = await listMyRides()
        const open = mine.find((r) => OPEN_STATUSES.includes(r.status) && r.status !== 'requested')
        setActiveRide(open || null)
      } catch {
        // Quietly retry next tick.
      }
    }
    pollActive()
    activePollRef.current = setInterval(pollActive, ACTIVE_POLL_MS)
    return () => clearInterval(activePollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Real order/payment history, loaded once — completed and cancelled
  // rides don't change on their own, so this doesn't need to poll.
  useEffect(() => {
    if (!user || user.role !== 'rider') return
    let cancelled = false
    ;(async () => {
      try {
        const [rides, payments] = await Promise.all([listMyRides(), listMyPayments()])
        if (cancelled) return
        setHistory(rides.filter((r) => r.status === 'completed'))
        setPaymentHistory(payments)
      } catch {
        // Leave history empty rather than blocking the rest of the page.
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeRide?.status])

  // Keep the active ride's payment status current while it's open.
  useEffect(() => {
    if (!activeRide) {
      setActivePayment(null)
      return
    }
    let stopped = false
    async function refresh() {
      try {
        const mine = await listMyPayments()
        if (stopped) return
        setActivePayment(mine.find((p) => p.ride?.id === activeRide.id) || null)
      } catch {
        // Quietly retry next tick.
      }
    }
    refresh()
    const id = setInterval(refresh, ACTIVE_POLL_MS)
    return () => {
      stopped = true
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide?.id])

  useEffect(() => {
    if (!user || user.role !== 'rider' || activeRide) {
      setAvailable([])
      return
    }

    async function pollAvailable() {
      try {
        const list = await listAvailableRides()
        setAvailable(list)
        setOrdersError('')
      } catch (err) {
        setOrdersError(err.message || 'Could not load available rides.')
      }
    }
    pollAvailable()
    availablePollRef.current = setInterval(pollAvailable, AVAILABLE_POLL_MS)
    return () => clearInterval(availablePollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, !!activeRide])

  if (!user || user.role !== 'rider') {
    return <Navigate to="/login" replace />
  }

  async function handleAccept(rideId) {
    setAcceptingId(rideId)
    try {
      const ride = await acceptRide(rideId)
      setActiveRide(ride)
      setAvailable((prev) => prev.filter((r) => r.id !== rideId))
    } catch (err) {
      // Most likely someone else accepted it first — refresh the list so
      // it disappears instead of leaving a stale "Accept" button up.
      setOrdersError(err.message || 'That ride is no longer available.')
      setAvailable((prev) => prev.filter((r) => r.id !== rideId))
    } finally {
      setAcceptingId(null)
    }
  }

  async function handleCancelActive() {
    if (!activeRide) return
    setCancelling(true)
    try {
      await cancelRide(activeRide.id)
      setActiveRide(null)
    } catch {
      // Leave it showing; the rider can retry.
    } finally {
      setCancelling(false)
    }
  }

  const totalEarned = history.reduce((sum, r) => sum + (r.fare || 0), 0)
  const totalTips = history.reduce((sum, r) => sum + (r.tipAmount || 0), 0)

  return (
    <div className="mx-auto max-w-5xl px-7 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-accent-deep dark:text-accent-light">
            Rider dashboard
          </p>
          <h1 className="mt-1 text-2xl font-extrabold normal-case sm:text-3xl">{user.name}</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
            {user.plateNumber} · {user.estate}
            {user.status === 'pending_review' && (
              <span className="ml-2 rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light">
                Pending review
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
        >
          Log out
        </button>
      </div>

      {activeRide && (
        <ActiveRideBanner ride={activeRide} onCancel={handleCancelActive} cancelling={cancelling} payment={activePayment} />
      )}

      {!activeRide && (
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold normal-case">Available ride requests</h2>
            <span className="text-[12px] text-ink-faint dark:text-ink-faint-dark">{available.length} waiting</span>
          </div>
          {ordersError && (
            <p className="mb-2 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{ordersError}</p>
          )}
          {available.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-ink-faint dark:border-line-dark dark:text-ink-faint-dark">
              No pending ride requests right now — this refreshes automatically.
            </p>
          ) : (
            <div className="flex gap-3.5 overflow-x-auto pb-1">
              {available.map((ride) => (
                <AvailableRideCard
                  key={ride.id}
                  ride={ride}
                  onAccept={handleAccept}
                  busy={acceptingId === ride.id}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Rides completed" value={history.length} />
        <StatCard label="Fares earned" value={formatNaira(totalEarned)} />
        <StatCard label="Tips earned" value={formatNaira(totalTips)} />
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold normal-case">Order history</h2>
          <span className="text-[12px] text-ink-faint dark:text-ink-faint-dark">Read-only · cannot be edited or deleted</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[540px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Date</Th>
                <Th>Passenger</Th>
                <Th>Pickup</Th>
                <Th align="right">Fare</Th>
                <Th align="right">Their rating of you</Th>
                <Th>Your rating of them</Th>
              </tr>
            </thead>
            <tbody>
              {historyLoading && (
                <tr>
                  <Td colSpan={6} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    Loading…
                  </Td>
                </tr>
              )}
              {!historyLoading && history.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No completed rides yet.
                  </Td>
                </tr>
              )}
              {history.map((ride) => (
                <tr key={ride.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
                    {ride.completedAt ? new Date(ride.completedAt).toLocaleDateString() : '—'}
                  </Td>
                  <Td>{ride.passenger?.name || '—'}</Td>
                  <Td className="max-w-[200px] truncate">{ride.pickupAddress || 'Live location'}</Td>
                  <Td align="right" className="font-mono">
                    {ride.fare != null ? formatNaira(ride.fare) : '—'}
                  </Td>
                  <Td align="right">{ride.rating ? `★ ${ride.rating}` : '—'}</Td>
                  <Td>
                    <RatePassengerCell
                      ride={ride}
                      onRated={(updated) =>
                        setHistory((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                      }
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold normal-case">Payment history</h2>
          <span className="text-[12px] text-ink-faint dark:text-ink-faint-dark">Read-only · cannot be edited or deleted</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[480px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Date</Th>
                <Th>Passenger</Th>
                <Th>Payment status</Th>
                <Th align="right">Fare</Th>
                <Th align="right">Tip</Th>
              </tr>
            </thead>
            <tbody>
              {historyLoading && (
                <tr>
                  <Td colSpan={5} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    Loading…
                  </Td>
                </tr>
              )}
              {!historyLoading && paymentHistory.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No payments yet.
                  </Td>
                </tr>
              )}
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
                    {payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString() : '—'}
                  </Td>
                  <Td>{payment.ride?.passenger?.name || '—'}</Td>
                  <Td>
                    <PaymentStatusPill status={payment.status} />
                  </Td>
                  <Td align="right" className="font-mono">
                    {payment.amount != null ? formatNaira(payment.amount) : '—'}
                  </Td>
                  <Td align="right" className="font-mono">
                    {payment.tipAmount ? formatNaira(payment.tipAmount) : '—'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
          Notice something wrong with a record? Contact estate management or RideIN support — riders can't edit or
          clear their own history, by design.
        </p>
      </section>
    </div>
  )
}

function PaymentStatusPill({ status }) {
  const map = {
    pending: ['Pending', 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'],
    confirmed: ['Confirmed', 'bg-good/15 text-good dark:text-good-dark'],
    failed: ['Not paid', 'bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark'],
  }
  const [label, cls] = map[status] || [status, 'bg-surface-2 text-ink-faint dark:bg-surface-2-dark dark:text-ink-faint-dark']
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>{label}</span>
}

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function Td({ children, align = 'left', className = '', colSpan }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  )
}
