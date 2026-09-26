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
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import FaresPage from './pages/FaresPage.jsx'
import SafetyPage from './pages/SafetyPage.jsx'
import ForEstatesPage from './pages/ForEstatesPage.jsx'
import FAQPage from './pages/FAQPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col bg-paper font-body text-ink antialiased dark:bg-paper-dark dark:text-ink-dark">
        <Navbar />
        {/* No flex-1 here on purpose: the footer should follow the
            content, not get stretched to the bottom of the viewport.
            On a short page (e.g. Safety, How it works) that stretch left
            a big empty gap between the content and the footer. Any
            leftover viewport space now just falls after the footer,
            which reads as a normal short page instead of a broken one. */}
        <main>
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
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/fares" element={<FaresPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/for-estates" element={<ForEstatesPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
