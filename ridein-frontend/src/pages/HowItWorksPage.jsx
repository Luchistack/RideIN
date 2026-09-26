import HowItWorks from '../components/sections/HowItWorks.jsx'
import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

const FAQ_ITEMS = [
  { q: 'What if no rider is online?', a: "You'll see this before you request, riders only show up on the map once they're actually online and free." },
  { q: 'Can I request a specific rider again?', a: "Yes. If they're online and free, you can choose them directly from the map, no assignment is forced on you." },
  { q: 'How is the wait time calculated?', a: "Each rider's estimated wait time is shown next to their pin before you choose, so you know roughly how long before pickup." },
  { q: 'Do I have to pay in cash?', a: 'No. Every fare is settled by direct bank transfer to RideIN, so no cash or change ever needs to happen at the roadside.' },
]

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <FAQ kicker="Questions" title="Before you request your first ride" items={FAQ_ITEMS} />
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
