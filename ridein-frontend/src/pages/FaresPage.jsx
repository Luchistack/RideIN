import Fares from '../components/sections/Fares.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

const FAQ_ITEMS = [
  { q: 'Do fares change with traffic or weather?', a: 'No. Pickup, Chatter, and Urgent pickup are all fixed fares, shown before you ever request a ride.' },
  { q: 'How is a delivery priced?', a: "Pickup and delivery doesn't have a fixed fare since routes vary. An admin reviews your from/to addresses and sends you the price before a rider is dispatched." },
  { q: 'Is tipping expected?', a: "No. Tipping is always optional and in cash if you choose to, it's never a substitute for the fare itself." },
  { q: 'Does RideIN mark up the fare?', a: "No. The rider's fare and RideIN's service fee are shown separately, so you always see exactly what you're paying for." },
]

export default function FaresPage() {
  return (
    <>
      <Fares />
      <FAQ kicker="Questions" title="How fares actually work" items={FAQ_ITEMS} />
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
