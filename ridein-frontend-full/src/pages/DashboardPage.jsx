import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import RiderDashboardPage from './RiderDashboardPage.jsx'
import PassengerDashboardPage from './PassengerDashboardPage.jsx'
import AdminDashboardPage from './AdminDashboardPage.jsx'

// Single "/dashboard" route, routed by role. This is the one place that
// decides which dashboard a logged-in user sees — a rider only ever gets
// RiderDashboardPage, a passenger only ever gets PassengerDashboardPage,
// and an admin only ever gets AdminDashboardPage. Each of those pages also
// re-checks the role itself before rendering anything (defense in depth),
// so none of them can end up showing another role's data even if this
// file changes later. There is no separate "admin login" anywhere — an
// admin account signs in through the exact same /login page as everyone
// else, and only ends up here because of their role.
export default function DashboardPage() {
  const { user, ready } = useAuth()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'rider') return <RiderDashboardPage />
  if (user.role === 'passenger') return <PassengerDashboardPage />
  if (user.role === 'admin') return <AdminDashboardPage />
  return <Navigate to="/" replace />
}
