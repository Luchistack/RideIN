import { useState } from 'react'
import SectionHead from '../ui/SectionHead.jsx'
import PassengerPhone from '../preview/PassengerPhone.jsx'
import RiderPhone from '../preview/RiderPhone.jsx'

const TABS = [
  { key: 'passenger', label: 'Passenger view' },
  { key: 'rider', label: 'Rider view' },
]

export default function AppPreview() {
  const [tab, setTab] = useState('passenger')

  return (
    <section
      id="app"
      className="border-y border-line bg-brand-tint px-7 py-16 dark:border-line-dark dark:bg-brand-tint-dark sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="Try it"
          title="The same app, two sides of the road"
          lede="Switch between the passenger view and the rider view below. Everything on these screens is interactive — go on, tap a rider."
        />

        <div className="mb-10 flex justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-5 py-2.5 text-sm font-bold ${
                tab === t.key
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-surface text-ink-soft dark:border-line-dark dark:bg-surface-dark dark:text-ink-soft-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={tab === 'passenger' ? 'grid gap-11 lg:grid-cols-[340px_1fr]' : 'hidden'}>
          <PassengerPhone />
          <PassengerCopy />
        </div>
        <div className={tab === 'rider' ? 'grid gap-11 lg:grid-cols-[340px_1fr]' : 'hidden'}>
          <RiderPhone />
          <RiderCopy />
        </div>
      </div>
    </section>
  )
}

function FeatureList({ items }) {
  return (
    <ul className="mt-7 flex flex-col gap-5">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3.5">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-brand-tint text-lg text-brand dark:bg-brand-tint-dark">
            {item.icon}
          </div>
          <div>
            <h4 className="mb-1 text-[15px] font-bold normal-case">{item.title}</h4>
            <p className="text-sm text-ink-soft dark:text-ink-soft-dark">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function PassengerCopy() {
  return (
    <div className="pt-1.5">
      <h3 className="text-[22px] font-extrabold normal-case">Choose who picks you up — always.</h3>
      <p className="mt-2.5 max-w-[44ch] text-ink-soft dark:text-ink-soft-dark">
        Tap any rider on the map to see their rating and how far out they are. If they can't take the ride, close
        the sheet and pick someone else — RideIN never auto-assigns a rider you didn't choose.
      </p>
      <FeatureList
        items={[
          { icon: '📍', title: 'Exact waiting spot', body: "Your pin is set to where you're standing, so the rider drives straight to you — not a guess." },
          { icon: '💳', title: 'Wallet, not cash', body: 'Fund once by transfer. Rides deduct instantly, so no change ever has to happen at the roadside.' },
          { icon: '⭐', title: 'Rate every ride', body: 'Your rating helps other passengers choose well — and tipping in cash is always optional, never expected.' },
        ]}
      />
    </div>
  )
}

function RiderCopy() {
  return (
    <div className="pt-1.5">
      <h3 className="text-[22px] font-extrabold normal-case">Every passenger waiting, before you move.</h3>
      <p className="mt-2.5 max-w-[44ch] text-ink-soft dark:text-ink-soft-dark">
        Riders see exactly who's waiting nearby, whether it's a shared pickup or a chatter booking, before
        accepting. Tap a passenger pin to view the request and accept it.
      </p>
      <FeatureList
        items={[
          { icon: '🛡️', title: "Verified before they're online", body: 'Every rider is estate-checked and ID-verified before their account can go live.' },
          { icon: '🧾', title: 'Your fare, remitted in full', body: "RideIN's service fee is never taken from your fare — you keep ₦300 of every pickup and ₦1,200 of every chatter." },
          { icon: '🪙', title: 'Tips stay cash, stay yours', body: "The only cash in RideIN is a passenger's tip — it's never split with the platform." },
        ]}
      />
    </div>
  )
}
