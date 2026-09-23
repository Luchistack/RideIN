import HowItWorks from '../components/sections/HowItWorks.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <PageCTA
        title="See what a ride actually costs"
        body="Pickup, Chatter, Urgent pickup, or a delivery, every fare is upfront before you request."
        primaryLabel="View fares"
        primaryTo="/fares"
        secondaryLabel="Sign up to ride"
        secondaryTo="/signup"
      />
    </>
  )
}
