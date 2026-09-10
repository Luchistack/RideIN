import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ORDER_HISTORY, PAYMENT_HISTORY } from '../data/riderRecords.js'
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

export default function RiderDashboardPage() {
  const { user, logout } = useAuth()

  if (!user || user.role !== 'rider') {
    return <Navigate to="/login" replace />
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
