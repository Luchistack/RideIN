import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupChoicePage from './pages/SignupChoicePage.jsx'
import SignupPassengerPage from './pages/SignupPassengerPage.jsx'
import SignupRiderPage from './pages/SignupRiderPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import BookRidePage from './pages/BookRidePage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-paper font-body text-ink antialiased dark:bg-paper-dark dark:text-ink-dark">
        <Navbar />
        {/* flex-1 is what pins the footer to the bottom of the viewport on
            short pages (e.g. a fresh dashboard with little history yet) —
            without it, the footer just sits directly under whatever content
            happens to be there, which on a short page looks like it's
            floating in the middle instead of anchored to the bottom. */}
        <main className="flex flex-1 flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupChoicePage />} />
            <Route path="/signup/passenger" element={<SignupPassengerPage />} />
            <Route path="/signup/rider" element={<SignupRiderPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/book-ride" element={<BookRidePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
