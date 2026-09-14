import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatNaira } from '../data/fares.js'

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

function PaymentStatusPill({ status }) {
  const map = {
    pending: ['Pending', 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'],
    confirmed: ['Confirmed', 'bg-good/15 text-good dark:text-good-dark'],
    failed: ['Not paid', 'bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark'],
  }
  const [label, cls] = map[status] || [status, 'bg-surface-2 text-ink-faint dark:bg-surface-2-dark dark:text-ink-faint-dark']
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>{label}</span>
}

export default function PassengerDashboardPage() {
  const { user, logout, listMyRides, listMyPayments } = useAuth()

  // Real ride/payment history — every account starts clean, no sample
  // "demo" rides or payments to clear out later.
  const [rideHistory, setRideHistory] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'passenger') return
    let cancelled = false
    ;(async () => {
      try {
        const [rides, payments] = await Promise.all([listMyRides(), listMyPayments()])
        if (cancelled) return
        setRideHistory(rides.filter((r) => r.status === 'completed'))
        setPaymentHistory(payments)
      } catch {
        // Leave history empty rather than blocking the rest of the page.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Only a logged-in passenger can see this page — a rider (or anyone else)
  // hitting this route gets sent back to login, never shown passenger data.
  if (!user || user.role !== 'passenger') {
    return <Navigate to="/login" replace />
  }

  const totalSpent = paymentHistory
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="mx-auto max-w-5xl px-7 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-brand dark:text-brand-light">
            Passenger dashboard
          </p>
          <h1 className="mt-1 text-2xl font-extrabold normal-case sm:text-3xl">{user.name}</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
        >
          Log out
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
        <p className="text-[13.5px] text-ink-soft dark:text-ink-soft-dark">Need to get somewhere?</p>
        <Link
          to="/book-ride"
          className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-white hover:bg-brand-deep"
        >
          Book a ride
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <StatCard label="Rides taken" value={rideHistory.length} />
        <StatCard label="Total spent" value={formatNaira(totalSpent)} />
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold normal-case">Ride history</h2>
          <span className="text-[12px] text-ink-faint dark:text-ink-faint-dark">Read-only · cannot be edited or deleted</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[540px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Date</Th>
                <Th>Rider</Th>
                <Th>Pickup</Th>
                <Th align="right">Fare</Th>
                <Th align="right">Your rating</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <Td colSpan={5} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    Loading…
                  </Td>
                </tr>
              )}
              {!loading && rideHistory.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No completed rides yet —{' '}
                    <Link to="/book-ride" className="font-semibold underline">
                      book your first ride
                    </Link>
                    .
                  </Td>
                </tr>
              )}
              {rideHistory.map((ride) => (
                <tr key={ride.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
                    {ride.completedAt ? new Date(ride.completedAt).toLocaleDateString() : '—'}
                  </Td>
                  <Td>{ride.rider?.name || '—'}</Td>
                  <Td className="max-w-[200px] truncate">{ride.pickupAddress || 'Live location'}</Td>
                  <Td align="right" className="font-mono">
                    {ride.fare != null ? formatNaira(ride.fare) : '—'}
                  </Td>
                  <Td align="right">{ride.rating ? `★ ${ride.rating}` : '—'}</Td>
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
                <Th>Rider</Th>
                <Th>Payment status</Th>
                <Th align="right">Fare</Th>
                <Th align="right">Tip</Th>
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <Td colSpan={6} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    Loading…
                  </Td>
                </tr>
              )}
              {!loading && paymentHistory.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No payments yet.
                  </Td>
                </tr>
              )}
              {paymentHistory.map((entry) => {
                const fare = entry.amount || 0
                const tip = entry.tipAmount || 0
                return (
                  <tr key={entry.id} className="border-b border-line last:border-0 dark:border-line-dark">
                    <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
                      {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : '—'}
                    </Td>
                    <Td>{entry.ride?.rider?.name || '—'}</Td>
                    <Td>
                      <PaymentStatusPill status={entry.status} />
                    </Td>
                    <Td align="right" className="font-mono">
                      {entry.amount != null ? formatNaira(fare) : '—'}
                    </Td>
                    <Td align="right" className="font-mono">
                      {tip ? (
                        <>
                          {formatNaira(tip)}
                          <div className="text-[10.5px] font-sans font-normal text-ink-faint dark:text-ink-faint-dark">
                            {entry.tipRecipient === 'app' ? 'to RideIN' : 'to rider'}
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td align="right" className="font-mono font-bold">
                      {entry.amount != null ? formatNaira(fare + tip) : '—'}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
          Notice something wrong with a record? Contact RideIN support, passengers can't edit or clear their own
          history, by design.
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

function Td({ children, align = 'left', className = '', colSpan }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  )
}
