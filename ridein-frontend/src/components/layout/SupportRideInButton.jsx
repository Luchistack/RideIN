import { useEffect, useRef, useState } from 'react'
import { PAYMENT_ACCOUNT } from '../../data/fares.js'

// A small, purely informational "Support RideIN" control shown in the
// navbar once someone is logged in. Clicking it reveals the same bank
// account used for ride payments, with a note that it's entirely optional
// -- there's no in-app "submit"/"confirm" step for this (unlike ride
// payments), it's just a place to see the account if someone wants to send
// something directly to support the app itself.
export default function SupportRideInButton() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px] font-bold text-ink-soft hover:border-ink-faint hover:text-ink dark:border-line-dark dark:text-ink-soft-dark dark:hover:border-ink-faint-dark dark:hover:text-ink-dark"
      >
        💚 Support RideIN
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_45px_-18px_rgba(0,0,0,0.5)] dark:border-line-dark dark:bg-surface-dark">
          <div className="mb-2 text-[13px] font-bold normal-case">Enjoying RideIN?</div>
          <p className="mb-3 text-[12px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            You can support the app directly by sending whatever you like to the account below.{' '}
            <b>Completely optional</b> — this is separate from paying for a ride.
          </p>
          <div className="rounded-lg bg-surface-2 px-3 py-2.5 font-mono text-[13px] dark:bg-surface-2-dark">
            {PAYMENT_ACCOUNT.bank} · {PAYMENT_ACCOUNT.name} · {PAYMENT_ACCOUNT.number}
          </div>
        </div>
      )}
    </div>
  )
}
