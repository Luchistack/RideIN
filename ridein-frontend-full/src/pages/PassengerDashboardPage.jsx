import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { RIDE_HISTORY, PAYMENT_HISTORY } from '../data/passengerRecords.js'
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

export default function PassengerDashboardPage() {
  const { user, logout } = useAuth()

  // Only a logged-in passenger can see this page — a rider (or anyone else)
  // hitting this route gets sent back to login, never shown passenger data.
  if (!user || user.role !== 'passenger') {
    return <Navigate to="/login" replace />
  }

  const totalSpent = PAYMENT_HISTORY.filter((w) => w.amount < 0).reduce((sum, w) => sum + Math.abs(w.amount), 0)

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

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <StatCard label="Rides taken" value={RIDE_HISTORY.length} />
        <StatCard label="Total spent" value={formatNaira(totalSpent)} />
      </div>
      <p className="-mt-6 mb-10 text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
        Pay each ride by bank transfer to: <span className="font-mono">RideIN Ltd · 0123456789 · Demo Bank</span> —
        there's no pre-funded balance to keep topped up.
      </p>

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
                <Th>Type</Th>
                <Th align="right">Fare</Th>
                <Th align="right">Your rating</Th>
              </tr>
            </thead>
            <tbody>
              {RIDE_HISTORY.map((ride) => (
                <tr key={ride.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">{ride.date}</Td>
                  <Td>{ride.rider}</Td>
                  <Td>{ride.type}</Td>
                  <Td align="right" className="font-mono">
                    {formatNaira(ride.fare)}
                  </Td>
                  <Td align="right">★ {ride.ratingGiven}</Td>
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
              {PAYMENT_HISTORY.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">{entry.date}</Td>
                  <Td>{entry.description}</Td>
                  <Td>{entry.method}</Td>
                  <Td
                    align="right"
                    className={`font-mono ${entry.amount < 0 ? 'text-ink dark:text-ink-dark' : 'text-good dark:text-good-dark'}`}
                  >
                    {entry.amount < 0 ? '-' : '+'}
                    {formatNaira(Math.abs(entry.amount))}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
          Notice something wrong with a record? Contact RideIN support — passengers can't edit or clear their own
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

function Td({ children, align = 'left', className = '' }) {
  return <td className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>{children}</td>
}
