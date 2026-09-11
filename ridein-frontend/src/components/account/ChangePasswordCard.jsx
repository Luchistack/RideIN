import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import FormField from '../ui/FormField.jsx'

// Self-service "change my password" card, dropped into both the passenger
// and rider profile pages. Most useful right after an admin has reset a
// user's password to a temporary one via the admin dashboard — the user
// can then come here and set something they'll actually remember.
export default function ChangePasswordCard() {
  const { changePassword } = useAuth()
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  function reset() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.")
      return
    }

    setBusy(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      reset()
      setOpen(false)
    } catch (err) {
      setError(err.message || 'Could not change your password — please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold normal-case">Password</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-soft dark:text-ink-soft-dark">
            {success
              ? 'Your password was changed successfully.'
              : 'Set your own password — useful right after an admin resets it for you.'}
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => {
              setSuccess(false)
              setOpen(true)
            }}
            className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
          >
            Change password
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4">
          <FormField
            id="current-password"
            label="Current password"
            type="password"
            required
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <FormField
            id="new-password"
            label="New password"
            type="password"
            required
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FormField
            id="confirm-new-password"
            label="Confirm new password"
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="mb-4 -mt-1 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{error}</p>}
          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-brand px-4 py-2 text-[12.5px] font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save new password'}
            </button>
            <button
              type="button"
              onClick={() => {
                reset()
                setOpen(false)
              }}
              disabled={busy}
              className="rounded-full px-4 py-2 text-[12.5px] font-bold text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
