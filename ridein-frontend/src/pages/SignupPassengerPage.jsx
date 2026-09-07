import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx'
import FormField from '../components/ui/FormField.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const STEPS = ['Account', 'How you pay']

export default function SignupPassengerPage() {
  const { signupPassenger, isEmailTaken } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [account, setAccount] = useState({ name: '', email: '', authMethod: 'email' })
  const [error, setError] = useState('')

  function handleAccountSubmit(e) {
    e.preventDefault()
    if (isEmailTaken(account.email)) {
      setError('An account with this email already exists. Try logging in instead.')
      return
    }
    setError('')
    setStep(2)
  }

  function handleGoogle(profile) {
    if (isEmailTaken(profile.email)) {
      setError('An account with this email already exists. Try logging in instead.')
      return
    }
    setAccount({ name: profile.name, email: profile.email, authMethod: 'google' })
    setError('')
    setStep(2)
  }

  function finish() {
    const result = signupPassenger(account)
    if (!result.ok) {
      setError(result.error)
      setStep(1)
      return
    }
    navigate('/#app')
  }

  return (
    <AuthLayout title="Sign up as a passenger" subtitle="Book rides around Millennium Estate.">
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <>
          <form onSubmit={handleAccountSubmit}>
            <FormField
              id="p-name"
              label="Full name"
              required
              placeholder="e.g. Ada Okonkwo"
              value={account.name}
              onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value, authMethod: 'email' }))}
            />
            <FormField
              id="p-email"
              label="Email address"
              type="email"
              required
              placeholder="you@example.com"
              value={account.email}
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value, authMethod: 'email' }))}
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
          <GoogleSignInButton onCredential={handleGoogle} />
        </>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
            RideIN has no pre-funded wallet — you pay by direct bank transfer, once per completed ride, straight to
            RideIN's account. There's nothing to fund now.
          </p>
          <div className="mb-5 rounded-xl border border-line bg-paper p-4 text-[12.5px] dark:border-line-dark dark:bg-paper-dark">
            <p className="mb-1 font-semibold">RideIN's transfer details (shown again after every ride):</p>
            <p className="font-mono text-ink-soft dark:text-ink-soft-dark">RideIN Ltd · 0123456789 · Demo Bank</p>
            <p className="mt-1.5 text-ink-faint dark:text-ink-faint-dark">
              Demo only — no real transfer is needed to continue.
            </p>
          </div>
          {error && <p className="mb-4 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{error}</p>}
          <button
            type="button"
            onClick={finish}
            className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Got it — finish
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
