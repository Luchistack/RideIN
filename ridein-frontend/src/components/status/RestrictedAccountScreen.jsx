import { useAuth } from '../../context/AuthContext.jsx'

// Shown instead of any dashboard when an account is suspended or blocked.
// A restricted account's API requests already get rejected server-side
// (see the backend's ActiveAccountJWTAuthentication), which logs the user
// out on their next action anyway — this screen just avoids a confusing
// flash of stale dashboard data in the meantime, on the current page load.
export default function RestrictedAccountScreen({ status }) {
  const { logout } = useAuth()
  const blocked = status === 'blocked'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-7 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.29 3.86l-8.18 14.14A1 1 0 0 0 3 19.5h18a1 1 0 0 0 .89-1.5L13.71 3.86a1 1 0 0 0-1.72 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold normal-case sm:text-3xl">
        {blocked ? 'Your account has been blocked' : 'Your account has been suspended'}
      </h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
        Your access to RideIN has been restricted. Please contact an admin directly for details — in-app messaging
        isn't available while your account is restricted.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
