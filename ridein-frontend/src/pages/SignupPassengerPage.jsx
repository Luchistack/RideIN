import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx'
import FormField from '../components/ui/FormField.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import { formatNaira } from '../data/fares.js'
import { useAuth } from '../context/AuthContext.jsx'

const STEPS = ['Account', 'Wallet']
const TOP_UP_AMOUNTS = [1000, 2000, 5000]

export default function SignupPassengerPage() {
  const { signupPassenger } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [account, setAccount] = useState({ name: '', email: '', authMethod: 'email' })
  const [topUp, setTopUp] = useState(0)

  function handleAccountSubmit(e) {
    e.preventDefault()
    setStep(2)
  }

  function handleGoogle(profile) {
    setAccount({ name: profile.name, email: profile.email, authMethod: 'google' })
    setStep(2)
  }

  function finish() {
    signupPassenger({ ...account, walletTopUp: topUp })
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
            Optional — fund your RideIN wallet now by transfer, or skip and do it later. Every ride is paid from
            this balance, never cash.
          </p>
          <div className="mb-5 flex gap-2">
            {TOP_UP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTopUp(amount)}
                className={`flex-1 rounded-lg border py-2.5 font-mono text-[13px] font-semibold ${
                  topUp === amount
                    ? 'border-brand bg-brand-tint text-brand dark:bg-brand-tint-dark dark:text-brand-light'
                    : 'border-line bg-surface dark:border-line-dark dark:bg-surface-dark'
                }`}
              >
                {formatNaira(amount)}
              </button>
            ))}
          </div>
          {topUp > 0 && (
            <div className="mb-5 rounded-xl border border-line bg-paper p-4 text-[12.5px] dark:border-line-dark dark:bg-paper-dark">
              <p className="mb-1 font-semibold">Transfer {formatNaira(topUp)} to:</p>
              <p className="font-mono text-ink-soft dark:text-ink-soft-dark">RideIN Wallets Ltd · 0123456789 · Demo Bank</p>
              <p className="mt-1.5 text-ink-faint dark:text-ink-faint-dark">
                Demo only — no real transfer is needed to continue.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={finish}
            className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
          >
            {topUp > 0 ? "I've sent it — finish" : 'Skip for now — finish'}
          </button>
        </div>
      )}
    </AuthLayout>
  )
}
