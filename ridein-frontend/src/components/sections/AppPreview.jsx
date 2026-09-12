import { Link } from 'react-router-dom'
import SectionHead from '../ui/SectionHead.jsx'
import PassengerPhone from '../preview/PassengerPhone.jsx'
import RiderPhone from '../preview/RiderPhone.jsx'
import AnimatedPhoneShowcase from '../preview/AnimatedPhoneShowcase.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Who this section shows a real, interactive ride flow to — and who it
// doesn't. A signed-out visitor (or an admin, who has no ride flow of their
// own) never sees a working "Accept ride" or "Request a ride" button here:
// they only see AnimatedPhoneShowcase, a purely decorative spinning mockup
// with nothing clickable on it. The real PassengerPhone/RiderPhone — the
// ones that actually let someone pick a rider or accept a request — only
// render for a signed-in passenger or rider, and only their own side.
// That's the fix for what used to be a real problem: anyone, logged in or
// not, could click "Accept ride" in this section as if they were a rider.
export default function AppPreview() {
  const { user } = useAuth()
  const role = user?.role === 'passenger' || user?.role === 'rider' ? user.role : null

  return (
    <section
      id="app"
      className="border-y border-line bg-brand-tint px-7 py-16 dark:border-line-dark dark:bg-brand-tint-dark sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {role === 'passenger' && (
          <>
            <SectionHead
              kicker="Your app"
              title="Choose who picks you up"
              lede="This is your own live request flow — tap a rider to see their rating and how far out they are."
            />
            <div className="grid min-w-0 gap-11 lg:grid-cols-[340px_1fr]">
              <PassengerPhone />
              <PassengerCopy />
            </div>
          </>
        )}

        {role === 'rider' && (
          <>
            <SectionHead
              kicker="Your app"
              title="Every passenger waiting, before you move"
              lede="This is your own live view — only you can see and accept requests sent to your account."
            />
            <div className="grid min-w-0 gap-11 lg:grid-cols-[340px_1fr]">
              <RiderPhone />
              <RiderCopy />
            </div>
          </>
        )}

        {!role && (
          <>
            <SectionHead
              kicker="How it works"
              title="The same app, two sides of the road"
              lede="Log in as a passenger to request a ride, or as a rider to see who's waiting — this preview is just a taste of both, not something you can click through."
            />
            <AnimatedPhoneShowcase />
            <div className="mt-8 grid gap-11 lg:grid-cols-2">
              <PassengerCopy compact />
              <RiderCopy compact />
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3.5">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-[11px] text-sm font-bold text-white transition hover:bg-brand-deep active:scale-[0.97]"
              >
                Sign up to try it for real →
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-transparent px-5 py-[11px] text-sm font-bold text-ink transition hover:border-ink-faint active:scale-[0.97] dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-faint-dark"
              >
                Log in
              </Link>
            </div>
          </>
        )}
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

function PassengerCopy({ compact = false }) {
  return (
    <div className={compact ? '' : 'pt-1.5'}>
      <h3 className="text-[22px] font-extrabold normal-case">Choose who picks you up — always.</h3>
      <p className="mt-2.5 max-w-[44ch] text-ink-soft dark:text-ink-soft-dark">
        Tap any rider on the map to see their rating and how far out they are. If they can't take the ride, close
        the sheet and pick someone else — RideIN never auto-assigns a rider you didn't choose.
      </p>
      <FeatureList
        items={[
          { icon: '📍', title: 'Exact waiting spot', body: "Your pin is set to where you're standing, so the rider drives straight to you — not a guess." },
          { icon: '💳', title: 'Bank transfer, not cash', body: 'Pay each ride by direct bank transfer to RideIN — no pre-funded balance, and no change ever has to happen at the roadside.' },
          { icon: '⭐', title: 'Rate every ride', body: 'Your rating helps other passengers choose well — and tipping in cash is always optional, never expected.' },
        ]}
      />
    </div>
  )
}

function RiderCopy({ compact = false }) {
  return (
    <div className={compact ? '' : 'pt-1.5'}>
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
