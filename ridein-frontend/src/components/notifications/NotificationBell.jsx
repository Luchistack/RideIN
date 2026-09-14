import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const POLL_MS = 25000

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

// Notification bell shown in the navbar for any signed-in user (passenger,
// rider, or admin). Polls the unread count in the background so the badge
// stays current without the user having to open the dropdown; the dropdown
// itself only fetches the actual list when opened.
export default function NotificationBell() {
  const { user, listNotifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } =
    useAuth()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const rootRef = useRef(null)
  const audioRef = useRef(null)
  const prevCountRef = useRef(null) // null until the first poll completes

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function poll() {
      const c = await unreadNotificationCount()
      if (cancelled) return
      // Only ring the alert sound when the unread count actually goes up --
      // never on the very first poll (that's just establishing a baseline,
      // not a new notification) and never on a poll that finds nothing new.
      if (prevCountRef.current !== null && c > prevCountRef.current) {
        audioRef.current?.play().catch(() => {
          // Autoplay can be blocked before the user has interacted with the
          // page at all in this session; harmless to skip in that case.
        })
      }
      prevCountRef.current = c
      setCount(c)
    }
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      try {
        const list = await listNotifications()
        setItems(list)
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleItemClick(n) {
    if (!n.is_read) {
      await markNotificationRead(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
      setCount((c) => Math.max(0, c - 1))
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead()
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })))
    setCount(0)
  }

  if (!user) return null

  return (
    <>
      <audio ref={audioRef} src="/sounds/ride-notification.mp3" preload="auto" />
      <NotificationBellInner
        open={open}
        setOpen={setOpen}
        count={count}
        items={items}
        loading={loading}
        rootRef={rootRef}
        toggleOpen={toggleOpen}
        handleItemClick={handleItemClick}
        handleMarkAllRead={handleMarkAllRead}
      />
    </>
  )
}

function NotificationBellInner({ open, setOpen, count, items, loading, rootRef, toggleOpen, handleItemClick, handleMarkAllRead }) {

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white dark:bg-danger-dark">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        // On a narrow screen this is `fixed` and pinned to the viewport's own
        // edges (inset-x-3) instead of being anchored to the bell button —
        // the bell usually isn't the rightmost thing in the navbar (the
        // hamburger button is further right), so an `absolute right-0`
        // dropdown anchored to the bell was overshooting the actual screen
        // edge and getting invisibly clipped. From sm up there's reliably
        // enough room, so it reverts to the normal anchored dropdown.
        <div className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl dark:border-line-dark dark:bg-surface-dark sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-w-[90vw]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-line-dark">
            <span className="text-[13px] font-bold normal-case">Notifications</span>
            {items.some((n) => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11.5px] font-semibold text-brand hover:underline dark:text-brand-light"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {loading && <p className="p-4 text-[13px] text-ink-faint dark:text-ink-faint-dark">Loading…</p>}
            {!loading && items.length === 0 && (
              <p className="p-4 text-[13px] text-ink-faint dark:text-ink-faint-dark">You're all caught up.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleItemClick(n)}
                className={`block w-full border-b border-line px-4 py-3 text-left last:border-0 dark:border-line-dark ${
                  n.is_read ? '' : 'bg-brand-tint dark:bg-brand-tint-dark'
                } hover:bg-surface-2 dark:hover:bg-surface-2-dark`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-bold normal-case">{n.title}</span>
                  {!n.is_read && <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-brand dark:bg-brand-light" />}
                </div>
                {n.body && (
                  <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft dark:text-ink-soft-dark">{n.body}</p>
                )}
                <p className="mt-1 text-[11px] text-ink-faint dark:text-ink-faint-dark">{timeAgo(n.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
