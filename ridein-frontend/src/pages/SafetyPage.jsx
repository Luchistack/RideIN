import Safety from '../components/sections/Safety.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'
import { SAFETY_FAQ } from '../data/faq.js'

export default function SafetyPage() {
  return (
    <>
      <Safety />
      <FAQ kicker="Questions" title="How RideIN keeps every ride accountable" items={SAFETY_FAQ} />
      <PageCTA
        title="See how a ride actually works"
        body="From opening the map to rating your rider, four simple stops."
        primaryLabel="How it works"
        primaryTo="/how-it-works"
        secondaryLabel="Sign up"
        secondaryTo="/signup"
      />
    </>
  )
}
