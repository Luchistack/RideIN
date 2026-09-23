import EstateSignup from '../components/sections/EstateSignup.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

export default function ForEstatesPage() {
  return (
    <>
      <EstateSignup />
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
