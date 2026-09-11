// Shared "you're done" interstitial shown right after signupPassenger()/
// signupRider() succeeds, before continuing on to the dashboard. Exact
// wording is per product decision — kept identical for both roles.
export default function SignupSuccessScreen({ onContinue, continuing }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-good/15 text-good dark:text-good-dark">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold normal-case sm:text-2xl">You're all set</h2>
      <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
        Your details have been received, we will get back to you soon.
      </p>
      <button
        type="button"
        onClick={onContinue}
        disabled={continuing}
        className="mt-6 w-full max-w-xs rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {continuing ? 'Taking you there…' : 'Continue'}
      </button>
    </div>
  )
}
