import Safety from '../components/sections/Safety.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

export default function SafetyPage() {
  return (
    <>
      <Safety />
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
