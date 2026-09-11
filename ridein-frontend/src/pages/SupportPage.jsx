import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// One customer-care chat, open to both riders and passengers alike — same
// page, same behavior, no role-specific version of it. Backed by the real
// support API now (apps/support on the backend) instead of a
// localStorage-only mock, so a conversation is shared with the admin inbox
// and no longer stuck on one device/browser.
export default function SupportPage() {
  const { user, ready, getMySupportThread, postMySupportMessage } = useAuth()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const thread = await getMySupportThread()
        if (!cancelled) setMessages(thread?.messages || [])
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load your messages.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Wait for the session-restore check (see AuthContext) before deciding
  // whether to redirect — otherwise a signed-in user gets bounced to
  // /login for a split second on every page load, before their session
  // has had a chance to load back in.
  if (!ready) return null
  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function send(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return

    setSending(true)
    setError('')
    try {
      const message = await postMySupportMessage(text)
      setMessages((prev) => [...prev, message])
      setDraft('')
    } catch (err) {
      setError(err.message || 'Could not send that message — please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-7 py-12">
      <div className="mb-6">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-brand dark:text-brand-light">
          Customer care
        </p>
        <h1 className="mt-1 text-2xl font-extrabold normal-case sm:text-3xl">Chat with RideIN</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
          Wrong detail on your profile, a payment question, a safety concern — message us here, whether you're a
          rider or a passenger. An admin will reply here personally.
        </p>
      </div>

      <div className="flex h-[440px] flex-col rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && <p className="mt-8 text-center text-[13px] text-ink-faint dark:text-ink-faint-dark">Loading…</p>}
          {!loading && messages.length === 0 && (
            <p className="mt-8 text-center text-[13px] text-ink-faint dark:text-ink-faint-dark">
              No messages yet — say hello below and RideIN's team will reply here.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender?.role !== 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${
                  m.sender?.role !== 'admin'
                    ? 'bg-brand text-white'
                    : 'border border-line bg-surface-2 text-ink dark:border-line-dark dark:bg-surface-2-dark dark:text-ink-dark'
                }`}
              >
                {m.body}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        {error && <p className="px-4 pb-1 text-[12px] font-semibold text-danger dark:text-danger-dark">{error}</p>}
        <form onSubmit={send} className="flex gap-2.5 border-t border-line p-3.5 dark:border-line-dark">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
