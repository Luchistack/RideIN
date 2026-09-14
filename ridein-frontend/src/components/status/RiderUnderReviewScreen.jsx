import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// Shown instead of the real rider dashboard while an application is still
// pending_review, or after it's been declined. Riders never see their real
// dashboard until an admin approves them — this is the gate.
export default function RiderUnderReviewScreen({ status }) {
  const { user, appealDecline } = useAuth()
  const [appealing, setAppealing] = useState(false)
  const [appealError, setAppealError] = useState('')
  const [justAppealed, setJustAppealed] = useState(false)

  const declined = status === 'declined'
  const alreadyAppealed = user?.appealRequested || justAppealed

  async function handleAppeal() {
    setAppealing(true)
    setAppealError('')
    try {
      await appealDecline()
      setJustAppealed(true)
    } catch (err) {
      setAppealError(err.message || 'Could not submit your appeal, please try again.')
    } finally {
      setAppealing(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-7 py-16 text-center">
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
          declined
            ? 'bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark'
            : 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
        }`}
      >
        {declined ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {!declined && (
        <>
          <h1 className="text-2xl font-extrabold normal-case sm:text-3xl">Your application is under review</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            Admin is looking over your details. This usually takes about an hour, check back here
            shortly, and you'll also see a notification in the bell above the moment there's an update.
          </p>
        </>
      )}

      {declined && (
        <>
          <h1 className="text-2xl font-extrabold normal-case sm:text-3xl">Your application was declined</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            Your details are still on record, nothing was deleted. If you think this was a mistake, or something's
            changed, you can appeal below and an admin will reach out to you personally.
          </p>

          {appealError && (
            <p className="mt-4 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{appealError}</p>
          )}

          {alreadyAppealed ? (
            <p className="mt-6 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[13px] font-semibold text-ink-soft dark:border-line-dark dark:bg-surface-2-dark dark:text-ink-soft-dark">
              Appeal received, an admin will reach out to you directly. No need to submit it again.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleAppeal}
              disabled={appealing}
              className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {appealing ? 'Submitting…' : 'Appeal this decision'}
            </button>
          )}
        </>
      )}

      <p className="mt-8 text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
        Questions in the meantime?{' '}
        <Link to="/support" className="font-semibold text-brand underline dark:text-brand-light">
          Message customer care
        </Link>
        .
      </p>
    </div>
  )
}
