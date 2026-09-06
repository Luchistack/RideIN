import SectionHead from '../ui/SectionHead.jsx'

const ITEMS = [
  { icon: '🪪', title: 'ID-verified riders', body: 'Every rider submits identification and is checked against estate records before approval.' },
  { icon: '🏘️', title: 'Estate-vetted', body: 'Estate management confirms each rider is known and permitted to operate on estate roads.' },
  { icon: '📡', title: 'Live location on both sides', body: "Passenger and rider see each other's real-time position for the length of the trip." },
  { icon: '🔒', title: 'No cash on the ride', body: 'Every fare is settled in-app beforehand. The rider never has to collect or make change.' },
]

export default function Safety() {
  return (
    <section id="safety" className="px-7 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="Safety & trust"
          title="Built for a gated community, not a random street corner"
          lede="Every safeguard below applies before a single naira moves."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-surface p-6 dark:border-line-dark dark:bg-surface-dark"
            >
              <div className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-brand-tint text-xl dark:bg-brand-tint-dark">
                {item.icon}
              </div>
              <h3 className="mb-2 text-[15.5px] font-bold normal-case">{item.title}</h3>
              <p className="text-[13.5px] text-ink-soft dark:text-ink-soft-dark">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
