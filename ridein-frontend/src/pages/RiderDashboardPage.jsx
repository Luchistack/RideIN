import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ORDER_HISTORY, PAYMENT_HISTORY } from '../data/riderRecords.js'
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

function ActiveRideBanner({ ride, onCancel, cancelling }) {
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
  const { user, logout, listAvailableRides, listMyRides, acceptRide, cancelRide } = useAuth()

  const [available, setAvailable] = useState([])
  const [activeRide, setActiveRide] = useState(null)
  const [acceptingId, setAcceptingId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [ordersError, setOrdersError] = useState('')

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

  const totalEarned = ORDER_HISTORY.reduce((sum, o) => sum + o.fare, 0)
  const totalTips = PAYMENT_HISTORY.filter((p) => p.method === 'Cash').reduce((sum, p) => sum + p.amount, 0)

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
        <ActiveRideBanner ride={activeRide} onCancel={handleCancelActive} cancelling={cancelling} />
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
        <StatCard label="Rides completed" value={ORDER_HISTORY.length} />
        <StatCard label="Fares earned" value={formatNaira(totalEarned)} />
        <StatCard label="Cash tips" value={formatNaira(totalTips)} />
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
                <Th>Type</Th>
                <Th align="right">Fare</Th>
                <Th align="right">Rating</Th>
              </tr>
            </thead>
            <tbody>
              {ORDER_HISTORY.map((order) => (
                <tr key={order.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">{order.date}</Td>
                  <Td>{order.passenger}</Td>
                  <Td>{order.type}</Td>
                  <Td align="right" className="font-mono">
                    {formatNaira(order.fare)}
                  </Td>
                  <Td align="right">★ {order.rating}</Td>
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
                <Th>Description</Th>
                <Th>Method</Th>
                <Th align="right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_HISTORY.map((payment) => (
                <tr key={payment.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">{payment.date}</Td>
                  <Td>{payment.description}</Td>
                  <Td>{payment.method}</Td>
                  <Td align="right" className="font-mono text-good dark:text-good-dark">
                    {formatNaira(payment.amount)}
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

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function Td({ children, align = 'left', className = '' }) {
  return <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>{children}</td>
}
