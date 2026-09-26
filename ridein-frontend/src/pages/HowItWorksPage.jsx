import HowItWorks from '../components/sections/HowItWorks.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'
import { HOW_IT_WORKS_FAQ } from '../data/faq.js'

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <FAQ kicker="Questions" title="Before you request your first ride" items={HOW_IT_WORKS_FAQ} />
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
