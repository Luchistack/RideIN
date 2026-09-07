import SectionHead from '../ui/SectionHead.jsx'

const STEPS = [
  { n: 1, title: 'Open the map', body: 'See every verified rider currently online near your estate, with wait time and rating.' },
  { n: 2, title: 'Choose your rider', body: "Pick who you want. If they're not free, choose another — no ride is forced on you." },
  { n: 3, title: 'Pay by bank transfer', body: 'Transfer the fare straight to RideIN\'s account for that ride — no pre-funded balance, no cash changes hands.' },
  { n: 4, title: 'Rate, and tip if you like', body: "Rate the ride and leave an optional cash tip. The rider's fare is remitted to them at day's end." },
]

export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-line bg-surface px-7 py-16 dark:border-line-dark dark:bg-surface-dark sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="How it works"
          title="Four stops from gate to destination"
          lede="The same route, every time — whether you're heading out or a rider is heading your way."
        />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="text-center">
              <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand font-display text-[17px] font-extrabold text-brand dark:border-brand-light dark:text-brand-light">
                {step.n}
              </div>
              <h3 className="mb-2 text-[17px] font-bold normal-case">{step.title}</h3>
              <p className="text-[14.5px] text-ink-soft dark:text-ink-soft-dark">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
