import Safety from '../components/sections/Safety.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

const FAQ_ITEMS = [
  { q: 'How are riders vetted before they go live?', a: 'Every rider submits identification and is checked against estate records, an estate confirms them before their account can accept rides.' },
  { q: 'Who can see my location during a ride?', a: 'Only your assigned rider (or passenger) can see your live position, and only for the length of that trip.' },
  { q: 'What if a rider breaks the rules?', a: "Estate management can review and remove any rider's access to the platform at any time." },
  { q: 'Do I need to carry cash for safety reasons?', a: 'No. Every fare is settled in-app by bank transfer beforehand, so no cash changes hands during the ride.' },
]

export default function SafetyPage() {
  return (
    <>
      <Safety />
      <FAQ kicker="Questions" title="How RideIN keeps every ride accountable" items={FAQ_ITEMS} />
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
