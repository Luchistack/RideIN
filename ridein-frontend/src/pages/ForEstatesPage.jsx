import EstateSignup from '../components/sections/EstateSignup.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'
import { ESTATES_FAQ } from '../data/faq.js'

export default function ForEstatesPage() {
  return (
    <>
      <EstateSignup />
      <FAQ kicker="Questions" title="Bringing RideIN to your estate" items={ESTATES_FAQ} />
      <PageCTA
        title="Curious how riders are vetted?"
        body="Every rider on RideIN is ID-verified and estate-checked before they go live."
        primaryLabel="See safety standards"
        primaryTo="/safety"
        secondaryLabel="How it works"
        secondaryTo="/how-it-works"
      />
    </>
  )
}
