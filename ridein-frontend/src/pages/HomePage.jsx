import { useEffect } from 'react'
import Hero from '../components/sections/Hero.jsx'
import AppPreview from '../components/sections/AppPreview.jsx'

// How it works, Fares, Safety, and For estates each moved to their own
// page (see App.jsx) so Home itself stays focused: just the hero banner
// and the live app preview.
export default function HomePage() {
  // Supports a link like "/#app" from another page — react-router doesn't
  // auto-scroll to a hash on route change, so this does it once Home has
  // mounted.
  useEffect(() => {
    if (!window.location.hash) return
    const el = document.querySelector(window.location.hash)
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])

  return (
    <>
      <Hero />
      <AppPreview />
    </>
  )
}
