import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx'
import FaceVerificationStep from '../components/auth/FaceVerificationStep.jsx'
import FormField from '../components/ui/FormField.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import { ESTATES } from '../data/estates.js'
import { useAuth } from '../context/AuthContext.jsx'

const STEPS = ['Account', 'Vehicle', 'Guarantor', 'Payout', 'Verify']
const BANKS = ['Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Opay', 'Moniepoint', 'Kuda']

const emptyForm = {
  name: '',
  email: '',
  authMethod: 'email',
  plateNumber: '',
  estate: ESTATES[0]?.name || 'Millennium Estate',
  address: '',
  phone: '',
  guarantorName: '',
  guarantorPhone: '',
  guarantorAddress: '',
  bankName: BANKS[0],
  accountNumber: '',
  faceVerified: false,
}

export default function SignupRiderPage() {
  const { signupRider } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function next(e) {
    e?.preventDefault()
    setStep((s) => Math.min(STEPS.length, s + 1))
  }
  function back() {
    setStep((s) => Math.max(1, s - 1))
  }

  function handleGoogle(profile) {
    setForm((f) => ({ ...f, name: profile.name, email: profile.email, authMethod: 'google' }))
    setStep(2)
  }

  function handleVerified(value) {
    setForm((f) => ({ ...f, faceVerified: value }))
  }

  function finish() {
    signupRider(form)
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Apply to ride with RideIN" subtitle="A few more details, since you'll be carrying passengers." wide>
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <>
          <form onSubmit={next}>
            <FormField
              id="r-name"
              label="Full name"
              required
              placeholder="e.g. Emeka Obi"
              value={form.name}
              onChange={set('name')}
            />
            <FormField
              id="r-email"
              label="Email address"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
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
        <form onSubmit={next}>
          <FormField id="r-plate" label="Keke plate number" required placeholder="e.g. LND-234-KJ" value={form.plateNumber} onChange={set('plateNumber')} />
          <FormField id="r-estate" label="Estate" as="select" value={form.estate} onChange={set('estate')}>
            {ESTATES.map((e) => (
              <option key={e.id} value={e.name}>
                {e.name}
              </option>
            ))}
          </FormField>
          <FormField id="r-address" label="Home address" required placeholder="Street, area, city" value={form.address} onChange={set('address')} />
          <FormField id="r-phone" label="Phone number" required type="tel" placeholder="e.g. 0803 000 0000" value={form.phone} onChange={set('phone')} />
          <div className="flex gap-2.5">
            <button type="button" onClick={back} className="flex-1 rounded-full border border-line py-3 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark">
              Back
            </button>
            <button type="submit" className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep">
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={next}>
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-soft-dark">
            A guarantor vouches for you — someone the estate can reach if needed.
          </p>
          <FormField id="r-g-name" label="Guarantor's full name" required placeholder="e.g. Grace Obi" value={form.guarantorName} onChange={set('guarantorName')} />
          <FormField id="r-g-phone" label="Guarantor's phone number" required type="tel" placeholder="e.g. 0803 000 0000" value={form.guarantorPhone} onChange={set('guarantorPhone')} />
          <FormField id="r-g-address" label="Guarantor's address" required placeholder="Street, area, city" value={form.guarantorAddress} onChange={set('guarantorAddress')} />
          <div className="flex gap-2.5">
            <button type="button" onClick={back} className="flex-1 rounded-full border border-line py-3 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark">
              Back
            </button>
            <button type="submit" className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep">
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={next}>
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-soft-dark">
            Where RideIN sends your daily fare remittance.
          </p>
          <FormField id="r-bank" label="Bank" as="select" value={form.bankName} onChange={set('bankName')}>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </FormField>
          <FormField id="r-acct" label="Account number" required placeholder="10-digit NUBAN" value={form.accountNumber} onChange={set('accountNumber')} />
          <div className="flex gap-2.5">
            <button type="button" onClick={back} className="flex-1 rounded-full border border-line py-3 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark">
              Back
            </button>
            <button type="submit" className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep">
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 5 && (
        <div>
          <FaceVerificationStep onVerified={handleVerified} />
          <div className="mt-5 flex gap-2.5">
            <button type="button" onClick={back} className="flex-1 rounded-full border border-line py-3 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark">
              Back
            </button>
            <button
              type="button"
              disabled={!form.faceVerified}
              onClick={finish}
              className="flex-1 rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit application
            </button>
          </div>
          <p className="mt-4 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
            Your account starts as "pending review" until estate management confirms your details.
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
