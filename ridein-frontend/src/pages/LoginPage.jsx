import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import FormField from '../components/ui/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, loginWithGoogleProfile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/dashboard')
  }

  function handleGoogle(profile) {
    const result = loginWithGoogleProfile(profile)
    if (result.ok) {
      navigate('/dashboard')
      return
    }
    setError(result.error || "We don't have an account for that Google email yet, sign up first.")
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back to RideIN.">
      <form onSubmit={handleSubmit}>
        <FormField
          id="login-email"
          label="Email address"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          id="login-password"
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowForgot((v) => !v)}
          className="mb-4 -mt-2.5 block text-[12.5px] font-semibold text-brand hover:underline dark:text-brand-light"
        >
          Forgotten password?
        </button>
        {showForgot && (
          <p className="mb-4 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft dark:border-line-dark dark:bg-surface-2-dark dark:text-ink-soft-dark">
            RideIN doesn't send password-reset emails. Contact an admin directly (call, WhatsApp, or in person) and
            they can reset your password for you from their dashboard.
          </p>
        )}
        {error && <p className="mb-4 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Continue'}
        </button>
      </form>


      <p className="mt-6 text-center text-[13px] text-ink-soft dark:text-ink-soft-dark">
        New to RideIN?{' '}
        <Link to="/signup" className="font-semibold text-brand dark:text-brand-light">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
