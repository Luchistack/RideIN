import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'

const OPTIONS = [
  {
    to: '/signup/passenger',
    icon: '🧍',
    title: 'I need rides',
    body: 'Book keke rides around Millennium Estate, pay by bank transfer per ride, rate your riders.',
  },
  {
    to: '/signup/rider',
    icon: '🛺',
    title: 'I want to ride and earn',
    body: 'Apply as a verified keke rider, plate, estate, guarantor and payout details required.',
  },
]

export default function SignupChoicePage() {
  return (
    <AuthLayout title="Join RideIN" subtitle="How would you like to sign up?" wide>
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.to}
            to={opt.to}
            className="flex flex-col items-start gap-2.5 rounded-2xl border border-line p-5 text-left transition hover:border-brand dark:border-line-dark dark:hover:border-brand-light"
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-base font-bold normal-case">{opt.title}</span>
            <span className="text-[13px] text-ink-soft dark:text-ink-soft-dark">{opt.body}</span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-[13px] text-ink-soft dark:text-ink-soft-dark">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand dark:text-brand-light">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
