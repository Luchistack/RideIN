import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx'
import FormField from '../components/ui/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, loginWithGoogleProfile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(email)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(result.user.role === 'rider' ? '/dashboard' : '/#app')
  }

  function handleGoogle(profile) {
    const result = loginWithGoogleProfile(profile)
    if (result.ok) {
      navigate(result.user.role === 'rider' ? '/dashboard' : '/#app')
      return
    }
    setError("We don't have an account for that Google email yet — sign up first.")
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
        {error && <p className="mb-4 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
        >
          Continue
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line dark:bg-line-dark" />
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-faint-dark">
          or
        </span>
        <div className="h-px flex-1 bg-line dark:bg-line-dark" />
      </div>

      <GoogleSignInButton onCredential={handleGoogle} text="signin_with" />

      <p className="mt-6 text-center text-[13px] text-ink-soft dark:text-ink-soft-dark">
        New to RideIN?{' '}
        <Link to="/signup" className="font-semibold text-brand dark:text-brand-light">
          Sign up
        </Link>
      </p>
      <p className="mt-3 text-center text-[11px] text-ink-faint dark:text-ink-faint-dark">
        Demo note: there's no password, and no real backend — this looks up accounts you've created on this
        browser via Sign up.
      </p>
    </AuthLayout>
  )
}
