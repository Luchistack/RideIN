import { useEffect } from 'react'
import Hero from '../components/sections/Hero.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import Fares from '../components/sections/Fares.jsx'
import AppPreview from '../components/sections/AppPreview.jsx'
import Safety from '../components/sections/Safety.jsx'
import EstateSignup from '../components/sections/EstateSignup.jsx'

export default function HomePage() {
  // Supports links like "/#app" from other pages (e.g. the navbar while on
  // /login) — react-router doesn't auto-scroll to a hash on route change,
  // so this does it once the home page itself has mounted.
  useEffect(() => {
    if (!window.location.hash) return
    const el = document.querySelector(window.location.hash)
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  return (
    <>
      <Hero />
      <HowItWorks />
      <Fares />
      <AppPreview />
      <Safety />
      <EstateSignup />
    </>
  )
}
