import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import RiderDashboardPage from './RiderDashboardPage.jsx'
import PassengerDashboardPage from './PassengerDashboardPage.jsx'
import AdminDashboardPage from './AdminDashboardPage.jsx'
import RestrictedAccountScreen from '../components/status/RestrictedAccountScreen.jsx'
import RiderUnderReviewScreen from '../components/status/RiderUnderReviewScreen.jsx'

// Single "/dashboard" route, routed by role. This is the one place that
// decides which dashboard a logged-in user sees — a rider only ever gets
// RiderDashboardPage, a passenger only ever gets PassengerDashboardPage,
// and an admin only ever gets AdminDashboardPage. Each of those pages also
// re-checks the role itself before rendering anything (defense in depth),
// so none of them can end up showing another role's data even if this
// file changes later. There is no separate "admin login" anywhere — an
// admin account signs in through the exact same /login page as everyone
// else, and only ends up here because of their role.
//
// This is also where account-level gating happens, before any role-specific
// dashboard ever renders:
//   - a suspended/blocked passenger or rider sees a restricted-access screen
//     instead of their dashboard (their session is also cut off at the API
//     level the moment they make a request, but this avoids a confusing
//     flash of stale dashboard data first)
//   - a rider whose application is still pending_review, or was declined,
//     never sees the real rider dashboard — they see a status screen
//     instead, with an Appeal button in the declined case
export default function DashboardPage() {
  const { user, ready } = useAuth()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />

  if (user.accountStatus && user.accountStatus !== 'active') {
    return <RestrictedAccountScreen status={user.accountStatus} />
  }

  if (user.role === 'rider') {
    if (user.status === 'pending_review') return <RiderUnderReviewScreen status="pending_review" />
    if (user.status === 'declined') return <RiderUnderReviewScreen status="declined" />
    return <RiderDashboardPage />
  }
  if (user.role === 'passenger') return <PassengerDashboardPage />
  if (user.role === 'admin') return <AdminDashboardPage />
  return <Navigate to="/" replace />
}
