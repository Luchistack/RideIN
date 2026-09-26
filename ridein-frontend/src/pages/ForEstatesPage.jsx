import EstateSignup from '../components/sections/EstateSignup.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

const FAQ_ITEMS = [
  { q: 'How long does an application take?', a: 'Applications are reviewed weekly, and estate management gets a call or email back with a decision.' },
  { q: 'Can our estate set its own fares?', a: 'Yes. Each estate runs its own riders and its own fares on the same shared RideIN system.' },
  { q: 'What if riders already operate informally in our estate?', a: 'They can still apply individually through the same verification process, no need to disband any existing arrangement first.' },
  { q: 'What do riders need to be approved?', a: 'Riders submit identification, get checked against estate records, and are confirmed by estate management before going live.' },
]

export default function ForEstatesPage() {
  return (
    <>
      <EstateSignup />
      <FAQ kicker="Questions" title="Bringing RideIN to your estate" items={FAQ_ITEMS} />
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
