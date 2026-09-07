import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getThread, appendMessage } from '../lib/supportStore.js'

const AUTO_REPLY_DELAY_MS = 1100
const AUTO_REPLY_TEXT =
  "Thanks for reaching out — a RideIN support agent will get back to you here soon. (This is a demo chat: messages are stored on this device only. Wire this up to a real support tool — WhatsApp Business, Zendesk, Intercom — before launch.)"

// One customer-care chat, open to both riders and passengers alike — same
// page, same behavior, no role-specific version of it. That's deliberate:
// "customer care" isn't a rider feature or a passenger feature, it's a
// general one both account types get.
export default function SupportPage() {
  const { user, ready } = useAuth()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const thread = getThread(user.id)
    setMessages(thread?.messages || [])
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Wait for the session-restore check (see AuthContext) before deciding
  // whether to redirect — otherwise a signed-in user gets bounced to
  // /login for a split second on every page load, before their session
  // has had a chance to load back in from localStorage.
  if (!ready) return null
  if (!user) {
    return <Navigate to="/login" replace />
  }

  function send(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return

    const meta = { userName: user.name, userEmail: user.email, userRole: user.role }
    const afterUser = appendMessage(user.id, meta, 'user', text)
    setMessages(afterUser.messages)
    setDraft('')
    setSending(true)

    // Stand-in for a real agent reply — see the note above for what this
    // needs to become before launch.
    setTimeout(() => {
      const afterReply = appendMessage(user.id, meta, 'agent', AUTO_REPLY_TEXT)
      setMessages(afterReply.messages)
      setSending(false)
    }, AUTO_REPLY_DELAY_MS)
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
          rider or a passenger.
        </p>
      </div>

      <div className="flex h-[440px] flex-col rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="mt-8 text-center text-[13px] text-ink-faint dark:text-ink-faint-dark">
              No messages yet — say hello below and RideIN's team will reply here.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${
                  m.from === 'user'
                    ? 'bg-brand text-white'
                    : 'border border-line bg-surface-2 text-ink dark:border-line-dark dark:bg-surface-2-dark dark:text-ink-dark'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] italic text-ink-faint dark:border-line-dark dark:bg-surface-2-dark dark:text-ink-faint-dark">
                RideIN support is typing…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="flex gap-2.5 border-t border-line p-3.5 dark:border-line-dark">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
