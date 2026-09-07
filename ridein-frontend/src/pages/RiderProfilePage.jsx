import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from '../components/ui/Avatar.jsx'

const MAX_PHOTO_BYTES = 3 * 1024 * 1024 // 3MB — generous for a demo, keeps localStorage usable

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-faint-dark">
        {label}
      </div>
      <div className="rounded-[9px] border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink-soft dark:border-line-dark dark:bg-surface-2-dark dark:text-ink-soft-dark">
        {value || '—'}
      </div>
    </div>
  )
}

export default function RiderProfilePage() {
  const { user, updatePhoto } = useAuth()
  const fileRef = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Same guard pattern as the dashboards — a passenger (or anyone signed
  // out) hitting this route never sees a rider's profile.
  if (!user || user.role !== 'rider') {
    return <Navigate to="/login" replace />
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be picked again later if needed
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, etc).')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('That image is a bit large — please choose one under 3MB.')
      return
    }

    setBusy(true)
    const reader = new FileReader()
    reader.onload = () => {
      updatePhoto(reader.result)
      setBusy(false)
    }
    reader.onerror = () => {
      setError('Could not read that file — please try another image.')
      setBusy(false)
    }
    reader.readAsDataURL(file)
  }

  const maskedAccount = user.accountNumber
    ? `••••••${user.accountNumber.slice(-4)}`
    : '—'

  return (
    <div className="mx-auto max-w-3xl px-7 py-12">
      <div className="mb-8">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-accent-deep dark:text-accent-light">
          Rider profile
        </p>
        <h1 className="mt-1 text-2xl font-extrabold normal-case sm:text-3xl">Your details</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
          Everything below is what you gave RideIN when you applied. Your photo is the only thing you can change
          yourself — for everything else, contact{' '}
          <Link to="/support" className="font-semibold text-brand underline dark:text-brand-light">
            customer care
          </Link>{' '}
          if something needs correcting.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
        <Avatar name={user.name} photo={user.photo} size={72} tone="accent" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold normal-case">{user.name}</span>
            {user.status === 'pending_review' && (
              <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light">
                Pending review
              </span>
            )}
            {user.status === 'approved' && (
              <span className="rounded-full bg-good/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-good dark:text-good-dark">
                Approved
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-ink-faint dark:text-ink-faint-dark">
            {user.plateNumber} · {user.estate}
          </p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-bold hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark dark:hover:border-ink-faint-dark"
            >
              {busy ? 'Uploading…' : user.photo ? 'Change photo' : 'Add a photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
          {error && <p className="mt-2 text-[12px] text-danger dark:text-danger-dark">{error}</p>}
        </div>
      </div>

      <div className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-faint-dark">
        Locked — can't be edited here
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField label="Full name" value={user.name} />
        <ReadOnlyField label="Email address" value={user.email} />
        <ReadOnlyField label="Phone number" value={user.phone} />
        <ReadOnlyField label="Home address" value={user.address} />
        <ReadOnlyField label="Estate" value={user.estate} />
        <ReadOnlyField label="Keke plate number" value={user.plateNumber} />
        <ReadOnlyField label="Guarantor's name" value={user.guarantorName} />
        <ReadOnlyField label="Guarantor's phone" value={user.guarantorPhone} />
        <ReadOnlyField label="Guarantor's address" value={user.guarantorAddress} />
        <ReadOnlyField label="Payout bank" value={user.bankName} />
        <ReadOnlyField label="Account number" value={maskedAccount} />
      </div>
      <p className="mt-5 text-[12px] text-ink-faint dark:text-ink-faint-dark">
        Spotted a mistake in any of the details above? Riders can't edit these themselves, by design — message{' '}
        <Link to="/support" className="font-semibold underline">
          customer care
        </Link>{' '}
        and RideIN's team will update it.
      </p>
    </div>
  )
}
