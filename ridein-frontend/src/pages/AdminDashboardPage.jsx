import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllThreads, appendMessage } from '../lib/supportStore.js'
import Avatar from '../components/ui/Avatar.jsx'

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

// The admin dashboard — reachable only through the same "/login" page
// everyone else uses. DashboardPage only ever renders it for a user whose
// role is actually 'admin' (checked server-side too, via IsAdmin on every
// admin endpoint this page calls).
//
// KNOWN GAP: listAllUsers() (see AuthContext.jsx) currently only returns
// PENDING riders — the live backend has no "list every rider and
// passenger" admin endpoint yet, only GET /auth/riders/pending/. So "All
// riders" below will only show riders still awaiting review, and "All
// passengers" will always be empty, until that endpoint is added.
export default function AdminDashboardPage() {
  const { user, logout, listAllUsers, approveRider } = useAuth()
  const [users, setUsers] = useState([])
  const [threads, setThreads] = useState([])
  const [openThreadId, setOpenThreadId] = useState(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  async function refresh() {
    setLoading(true)
    const [allUsers] = await Promise.all([listAllUsers()])
    setUsers(allUsers)
    setThreads(getAllThreads())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const riders = users.filter((u) => u.role === 'rider')
  const passengers = users.filter((u) => u.role === 'passenger')
  const pendingRiders = riders.filter((r) => r.status === 'pending_review')
  const openThread = threads.find((t) => t.userId === openThreadId) || null

  async function handleApprove(riderId) {
    await approveRider(riderId)
    refresh()
  }

  function sendReply(e) {
    e.preventDefault()
    const text = reply.trim()
    if (!text || !openThread) return
    appendMessage(
      openThread.userId,
      { userName: openThread.userName, userEmail: openThread.userEmail, userRole: openThread.userRole },
      'agent',
      text,
    )
    setReply('')
    setThreads(getAllThreads())
  }

  return (
    <div className="mx-auto max-w-5xl px-7 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-faint-dark">
            Estate operations
          </p>
          <h1 className="mt-1 text-2xl font-extrabold normal-case sm:text-3xl">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
        >
          Log out
        </button>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-4">
        <StatCard label="Riders" value={riders.length} />
        <StatCard label="Pending review" value={pendingRiders.length} />
        <StatCard label="Passengers" value={passengers.length} />
        <StatCard label="Support threads" value={threads.length} />
      </div>

      {loading && (
        <p className="mb-6 text-[13px] text-ink-faint dark:text-ink-faint-dark">Loading…</p>
      )}

      {pendingRiders.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold normal-case">Riders awaiting approval</h2>
          <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
            <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                  <Th>Rider</Th>
                  <Th>Plate</Th>
                  <Th>Estate</Th>
                  <Th>Guarantor</Th>
                  <Th align="right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {pendingRiders.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 dark:border-line-dark">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} photo={r.photo} size={28} />
                        <span>{r.name}</span>
                      </div>
                    </Td>
                    <Td className="font-mono">{r.plateNumber}</Td>
                    <Td>{r.estate}</Td>
                    <Td>{r.guarantorName}</Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() => handleApprove(r.id)}
                        className="rounded-full bg-brand px-3.5 py-1.5 text-[12.5px] font-bold text-white hover:bg-brand-deep"
                      >
                        Approve
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold normal-case">All riders</h2>
        <p className="mb-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
          Currently shows pending riders only — the backend doesn't have a "list every rider" endpoint yet.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Rider</Th>
                <Th>Plate</Th>
                <Th>Estate</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name} photo={r.photo} size={28} />
                      <span>{r.name}</span>
                    </div>
                  </Td>
                  <Td className="font-mono">{r.plateNumber}</Td>
                  <Td>{r.estate}</Td>
                  <Td align="right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        r.status === 'approved'
                          ? 'bg-good/15 text-good dark:text-good-dark'
                          : 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
                      }`}
                    >
                      {r.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </Td>
                </tr>
              ))}
              {riders.length === 0 && (
                <tr>
                  <Td colSpan={4} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No riders yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold normal-case">All passengers</h2>
        <p className="mb-3 text-[12px] text-ink-faint dark:text-ink-faint-dark">
          Not available yet — the backend has no endpoint to list passengers.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[420px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Passenger</Th>
                <Th>Email</Th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 dark:border-line-dark">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.name} photo={p.photo} size={28} />
                      <span>{p.name}</span>
                    </div>
                  </Td>
                  <Td>{p.email}</Td>
                </tr>
              ))}
              {passengers.length === 0 && (
                <tr>
                  <Td colSpan={2} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No passengers yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold normal-case">Customer care inbox</h2>
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-line dark:border-line-dark">
            {threads.length === 0 && (
              <p className="p-4 text-[13px] text-ink-faint dark:text-ink-faint-dark">No support messages yet.</p>
            )}
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1]
              return (
                <button
                  key={t.userId}
                  type="button"
                  onClick={() => setOpenThreadId(t.userId)}
                  className={`block w-full border-b border-line px-4 py-3 text-left last:border-0 dark:border-line-dark ${
                    openThreadId === t.userId ? 'bg-brand-tint dark:bg-brand-tint-dark' : 'hover:bg-surface-2 dark:hover:bg-surface-2-dark'
                  }`}
                >
                  <div className="flex items-center justify-between text-[13px] font-bold">
                    <span className="truncate">{t.userName}</span>
                    <span className="ml-2 flex-none rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint dark:bg-surface-2-dark dark:text-ink-faint-dark">
                      {t.userRole}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-ink-faint dark:text-ink-faint-dark">{last?.text}</p>
                </button>
              )
            })}
          </div>

          <div className="flex min-h-[300px] flex-col rounded-2xl border border-line dark:border-line-dark">
            {!openThread && (
              <p className="m-auto text-[13px] text-ink-faint dark:text-ink-faint-dark">Select a conversation to view it.</p>
            )}
            {openThread && (
              <>
                <div className="border-b border-line px-4 py-3 dark:border-line-dark">
                  <div className="text-[13.5px] font-bold">{openThread.userName}</div>
                  <div className="text-[12px] text-ink-faint dark:text-ink-faint-dark">{openThread.userEmail}</div>
                </div>
                <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
                  {openThread.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                          m.from === 'agent'
                            ? 'bg-brand text-white'
                            : 'border border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendReply} className="flex gap-2 border-t border-line p-3 dark:border-line-dark">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply as RideIN support…"
                    className="flex-1 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
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
