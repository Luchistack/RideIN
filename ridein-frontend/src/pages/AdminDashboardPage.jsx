import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
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

function Th({ children, align = 'left' }) {
  return (
    <th className={`px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide text-ink-soft dark:text-ink-soft-dark ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function Td({ children, align = 'left', className = '', colSpan }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 align-middle ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending_review: ['Pending', 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'],
    approved: ['Approved', 'bg-good/15 text-good dark:text-good-dark'],
    declined: ['Declined', 'bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark'],
    active: ['Active', 'bg-good/15 text-good dark:text-good-dark'],
    suspended: ['Suspended', 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'],
    blocked: ['Blocked', 'bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark'],
  }
  const [label, cls] = map[status] || [status, 'bg-surface-2 text-ink-faint dark:bg-surface-2-dark dark:text-ink-faint-dark']
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>{label}</span>
}

// A destructive action that asks for one extra click before it actually
// fires, so "Delete" can't be triggered by a stray click the way a single
// button could.
function ConfirmButton({ onConfirm, children, className = '', confirmLabel = 'Sure?' }) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={async () => {
            await onConfirm()
            setConfirming(false)
          }}
          className="rounded-full bg-danger px-2.5 py-1 text-[11.5px] font-bold text-white hover:opacity-90 dark:bg-danger-dark"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-line px-2.5 py-1 text-[11.5px] font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
        >
          Cancel
        </button>
      </span>
    )
  }
  return (
    <button type="button" onClick={() => setConfirming(true)} className={className}>
      {children}
    </button>
  )
}

const ACTION_BTN = 'rounded-full px-2.5 py-1 text-[11.5px] font-bold whitespace-nowrap'
const BTN_PRIMARY = `${ACTION_BTN} bg-brand text-white hover:bg-brand-deep`
const BTN_DANGER_OUTLINE = `${ACTION_BTN} border border-danger text-danger hover:bg-danger/10 dark:border-danger-dark dark:text-danger-dark`
const BTN_GHOST = `${ACTION_BTN} border border-line hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark`

function SearchBar({ q, setQ, month, setMonth, onSearch, placeholder }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearch()
      }}
      className="mb-3 flex flex-wrap items-center gap-2"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="min-w-[180px] flex-1 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
      />
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
      />
      <button type="submit" className="rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-deep">
        Search
      </button>
      {(q || month) && (
        <button
          type="button"
          onClick={() => {
            setQ('')
            setMonth('')
            onSearch({ q: '', month: '' })
          }}
          className="rounded-full border border-line px-3.5 py-2 text-[13px] font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
        >
          Clear
        </button>
      )}
    </form>
  )
}

const TABS = [
  { id: 'riders', label: 'Riders' },
  { id: 'passengers', label: 'Passengers' },
  { id: 'support', label: 'Support' },
]

// The admin dashboard — reachable only through the same "/login" page
// everyone else uses. DashboardPage only ever renders it for a user whose
// role is actually 'admin' (checked server-side too, via IsAdmin on every
// admin endpoint this page calls).
export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('riders')
  const [statsRiders, setStatsRiders] = useState(0)
  const [statsPending, setStatsPending] = useState(0)
  const [statsPassengers, setStatsPassengers] = useState(0)
  const [statsThreads, setStatsThreads] = useState(0)

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="mx-auto max-w-6xl px-7 py-12">
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

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="Riders" value={statsRiders} />
        <StatCard label="Pending review" value={statsPending} />
        <StatCard label="Passengers" value={statsPassengers} />
        <StatCard label="Support threads" value={statsThreads} />
      </div>

      <div className="mb-6 flex gap-2 border-b border-line dark:border-line-dark">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold normal-case ${
              tab === t.id
                ? 'border-brand text-brand dark:border-brand-light dark:text-brand-light'
                : 'border-transparent text-ink-faint hover:text-ink dark:text-ink-faint-dark dark:hover:text-ink-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'riders' && (
        <RidersTab
          onStats={(total, pending) => {
            setStatsRiders(total)
            setStatsPending(pending)
          }}
        />
      )}
      {tab === 'passengers' && <PassengersTab onStats={setStatsPassengers} />}
      {tab === 'support' && <SupportTab onStats={setStatsThreads} />}
    </div>
  )
}

function RidersTab({ onStats }) {
  const { listAdminRiders, declineRider, approveRider, setAccountStatus, deleteAccount, downloadUserPdf } = useAuth()
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [month, setMonth] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState('')

  async function load(override) {
    setLoading(true)
    setErr('')
    try {
      const params = { q: override?.q ?? q, month: override?.month ?? month }
      const { users, count } = await listAdminRiders(params)
      setRiders(users)
      const pending = users.filter((r) => r.status === 'pending_review').length
      onStats(count, pending)
    } catch (e) {
      setErr(e.message || 'Could not load riders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runAction(id, fn) {
    setBusyId(id)
    setErr('')
    try {
      await fn()
      await load()
    } catch (e) {
      setErr(e.message || 'That action failed — please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <SearchBar q={q} setQ={setQ} month={month} setMonth={setMonth} onSearch={load} placeholder="Search riders by name, email, phone…" />
      {err && <p className="mb-3 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{err}</p>}
      {loading && <p className="text-[13px] text-ink-faint dark:text-ink-faint-dark">Loading…</p>}
      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[820px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Rider</Th>
                <Th>Plate</Th>
                <Th>Estate</Th>
                <Th>Application</Th>
                <Th>Account</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => {
                const busy = busyId === r.id
                return (
                  <tr key={r.id} className="border-b border-line last:border-0 dark:border-line-dark">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} photo={r.photo} size={28} />
                        <div>
                          <div>{r.name}</div>
                          <div className="text-[11.5px] text-ink-faint dark:text-ink-faint-dark">{r.email}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono">{r.plateNumber}</Td>
                    <Td>{r.estate}</Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={r.status} />
                        {r.appealRequested && (
                          <span className="text-[10.5px] font-bold uppercase tracking-wide text-accent-deep dark:text-accent-light">
                            Appeal requested
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <StatusBadge status={r.accountStatus} />
                    </Td>
                    <Td align="right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {r.status !== 'approved' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(r.id, () => approveRider(r.id))}
                            className={BTN_PRIMARY}
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'declined' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(r.id, () => declineRider(r.id))}
                            className={BTN_DANGER_OUTLINE}
                          >
                            Decline
                          </button>
                        )}
                        {r.accountStatus !== 'suspended' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(r.id, () => setAccountStatus(r.id, 'suspended'))}
                            className={BTN_GHOST}
                          >
                            Suspend
                          </button>
                        )}
                        {r.accountStatus !== 'blocked' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(r.id, () => setAccountStatus(r.id, 'blocked'))}
                            className={BTN_GHOST}
                          >
                            Block
                          </button>
                        )}
                        {r.accountStatus !== 'active' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(r.id, () => setAccountStatus(r.id, 'active'))}
                            className={BTN_GHOST}
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => downloadUserPdf(r.id, `${r.name || 'rider'}-ridein.pdf`)}
                          className={BTN_GHOST}
                        >
                          Download PDF
                        </button>
                        <ConfirmButton
                          confirmLabel="Delete for good?"
                          onConfirm={() => runAction(r.id, () => deleteAccount(r.id))}
                          className={BTN_DANGER_OUTLINE}
                        >
                          Delete
                        </ConfirmButton>
                      </div>
                    </Td>
                  </tr>
                )
              })}
              {riders.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No riders match.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PassengersTab({ onStats }) {
  const { listAdminPassengers, setAccountStatus, deleteAccount, downloadUserPdf } = useAuth()
  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [month, setMonth] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState('')

  async function load(override) {
    setLoading(true)
    setErr('')
    try {
      const params = { q: override?.q ?? q, month: override?.month ?? month }
      const { users, count } = await listAdminPassengers(params)
      setPassengers(users)
      onStats(count)
    } catch (e) {
      setErr(e.message || 'Could not load passengers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runAction(id, fn) {
    setBusyId(id)
    setErr('')
    try {
      await fn()
      await load()
    } catch (e) {
      setErr(e.message || 'That action failed — please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <SearchBar q={q} setQ={setQ} month={month} setMonth={setMonth} onSearch={load} placeholder="Search passengers by name, email, phone…" />
      {err && <p className="mb-3 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{err}</p>}
      {loading && <p className="text-[13px] text-ink-faint dark:text-ink-faint-dark">Loading…</p>}
      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-line dark:border-line-dark">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
                <Th>Passenger</Th>
                <Th>Joined</Th>
                <Th>Account</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((p) => {
                const busy = busyId === p.id
                return (
                  <tr key={p.id} className="border-b border-line last:border-0 dark:border-line-dark">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.name} photo={p.photo} size={28} />
                        <div>
                          <div>{p.name}</div>
                          <div className="text-[11.5px] text-ink-faint dark:text-ink-faint-dark">{p.email}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
                      {p.date_joined ? new Date(p.date_joined).toLocaleDateString() : '—'}
                    </Td>
                    <Td>
                      <StatusBadge status={p.accountStatus} />
                    </Td>
                    <Td align="right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {p.accountStatus !== 'suspended' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(p.id, () => setAccountStatus(p.id, 'suspended'))}
                            className={BTN_GHOST}
                          >
                            Suspend
                          </button>
                        )}
                        {p.accountStatus !== 'blocked' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(p.id, () => setAccountStatus(p.id, 'blocked'))}
                            className={BTN_GHOST}
                          >
                            Block
                          </button>
                        )}
                        {p.accountStatus !== 'active' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runAction(p.id, () => setAccountStatus(p.id, 'active'))}
                            className={BTN_GHOST}
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => downloadUserPdf(p.id, `${p.name || 'passenger'}-ridein.pdf`)}
                          className={BTN_GHOST}
                        >
                          Download PDF
                        </button>
                        <ConfirmButton
                          confirmLabel="Delete for good?"
                          onConfirm={() => runAction(p.id, () => deleteAccount(p.id))}
                          className={BTN_DANGER_OUTLINE}
                        >
                          Delete
                        </ConfirmButton>
                      </div>
                    </Td>
                  </tr>
                )
              })}
              {passengers.length === 0 && (
                <tr>
                  <Td colSpan={4} className="text-center text-ink-faint dark:text-ink-faint-dark">
                    No passengers match.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function SupportTab({ onStats }) {
  const { listAdminThreads, getAdminThread, postAdminReply, markAdminThreadRead, deleteAdminThread } = useAuth()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [month, setMonth] = useState('')
  const [openThread, setOpenThread] = useState(null)
  const [reply, setReply] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function load(override) {
    setLoading(true)
    setErr('')
    try {
      const params = { q: override?.q ?? q, month: override?.month ?? month }
      const { results, count } = await listAdminThreads(params)
      setThreads(results)
      onStats(count)
    } catch (e) {
      setErr(e.message || 'Could not load support threads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openConversation(t) {
    try {
      const full = await getAdminThread(t.id)
      setOpenThread(full)
      if (full.messages.some((m) => !m.read_by_admin)) {
        await markAdminThreadRead(t.id)
      }
    } catch (e) {
      setErr(e.message || 'Could not open that conversation.')
    }
  }

  async function sendReply(e) {
    e.preventDefault()
    const text = reply.trim()
    if (!text || !openThread) return
    setBusy(true)
    try {
      await postAdminReply(openThread.id, text)
      const full = await getAdminThread(openThread.id)
      setOpenThread(full)
      setReply('')
    } catch (e2) {
      setErr(e2.message || 'Could not send that reply.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(threadId) {
    try {
      await deleteAdminThread(threadId)
      if (openThread?.id === threadId) setOpenThread(null)
      await load()
    } catch (e) {
      setErr(e.message || 'Could not delete that thread.')
    }
  }

  return (
    <section>
      <SearchBar q={q} setQ={setQ} month={month} setMonth={setMonth} onSearch={load} placeholder="Search by name, email, or message text…" />
      {err && <p className="mb-3 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{err}</p>}
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <div className="max-h-[480px] overflow-y-auto rounded-2xl border border-line dark:border-line-dark">
          {loading && <p className="p-4 text-[13px] text-ink-faint dark:text-ink-faint-dark">Loading…</p>}
          {!loading && threads.length === 0 && (
            <p className="p-4 text-[13px] text-ink-faint dark:text-ink-faint-dark">No support threads match.</p>
          )}
          {threads.map((t) => {
            const last = t.messages[t.messages.length - 1]
            return (
              <div
                key={t.id}
                className={`flex items-start gap-1 border-b border-line px-3 py-3 last:border-0 dark:border-line-dark ${
                  openThread?.id === t.id ? 'bg-brand-tint dark:bg-brand-tint-dark' : 'hover:bg-surface-2 dark:hover:bg-surface-2-dark'
                }`}
              >
                <button type="button" onClick={() => openConversation(t)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between text-[13px] font-bold">
                    <span className="truncate">{t.user?.name || t.user?.email}</span>
                    <span className="ml-2 flex-none rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint dark:bg-surface-2-dark dark:text-ink-faint-dark">
                      {t.user?.role}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-ink-faint dark:text-ink-faint-dark">{last?.body}</p>
                </button>
                <ConfirmButton
                  confirmLabel="Delete?"
                  onConfirm={() => handleDelete(t.id)}
                  className="mt-0.5 flex-none rounded-full border border-danger px-2 py-0.5 text-[10.5px] font-bold text-danger hover:bg-danger/10 dark:border-danger-dark dark:text-danger-dark"
                >
                  Delete
                </ConfirmButton>
              </div>
            )
          })}
        </div>

        <div className="flex min-h-[320px] flex-col rounded-2xl border border-line dark:border-line-dark">
          {!openThread && (
            <p className="m-auto text-[13px] text-ink-faint dark:text-ink-faint-dark">Select a conversation to view it.</p>
          )}
          {openThread && (
            <>
              <div className="border-b border-line px-4 py-3 dark:border-line-dark">
                <div className="text-[13.5px] font-bold">{openThread.user?.name}</div>
                <div className="text-[12px] text-ink-faint dark:text-ink-faint-dark">{openThread.user?.email}</div>
              </div>
              <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
                {openThread.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender?.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                        m.sender?.role === 'admin'
                          ? 'bg-brand text-white'
                          : 'border border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark'
                      }`}
                    >
                      {m.body}
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
                  disabled={!reply.trim() || busy}
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
  )
}
