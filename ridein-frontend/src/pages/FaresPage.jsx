import Fares from '../components/sections/Fares.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'
import { FARES_FAQ } from '../data/faq.js'

export default function FaresPage() {
  return (
    <>
      <Fares />
      <FAQ kicker="Questions" title="How fares actually work" items={FARES_FAQ} />
      <PageCTA
        title="Ready to book your first ride?"
        body="Sign up as a passenger and request a rider in minutes."
        primaryLabel="Sign up"
        primaryTo="/signup"
        secondaryLabel="Log in"
        secondaryTo="/login"
      />
    </>
  )
}
