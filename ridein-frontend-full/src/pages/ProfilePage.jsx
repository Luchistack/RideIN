import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import RiderProfilePage from './RiderProfilePage.jsx'
import PassengerProfilePage from './PassengerProfilePage.jsx'

// Single "/profile" route, routed by role — same pattern as DashboardPage.
// A rider only ever gets RiderProfilePage, a passenger only ever gets
// PassengerProfilePage. Admin has no profile page (nothing to show/verify
// about a demo operator account), so an admin hitting this route is sent
// back to their dashboard instead.
export default function ProfilePage() {
  const { user, ready } = useAuth()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'rider') return <RiderProfilePage />
  if (user.role === 'passenger') return <PassengerProfilePage />
  return <Navigate to="/dashboard" replace />
}
