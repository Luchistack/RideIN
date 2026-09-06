import Button from '../ui/Button.jsx'
import { FARES, formatNaira } from '../../data/fares.js'

const SIGN_ROWS = [
  { from: 'GATE', to: 'BLOCK 14', tag: 'Next rider · 3 min', now: true },
  { from: 'GATE', to: 'ESTATE HALL', tag: '2 riders waiting' },
  { from: 'CHATTER', to: 'MAIN ROAD', tag: `${formatNaira(FARES.chatter.total)} flat` },
]

export default function Hero() {
  return (
    <header className="px-7 pb-16 pt-[76px]">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-tint py-[7px] pl-2.5 pr-3.5 text-[12.5px] font-semibold uppercase tracking-wider text-brand dark:bg-brand-tint-dark dark:text-brand-light">
            <span className="h-[7px] w-[7px] rounded-full bg-good shadow-[0_0_0_3px_rgba(47,125,94,0.22)] dark:bg-good-dark" />
            Live in Millennium Estate
          </span>
          <h1 className="text-[40px] font-extrabold leading-[0.98] sm:text-[54px] lg:text-[68px]">
            Your routes,
            <br />
            <span className="text-brand dark:text-brand-light">made easy.</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            RideIN is the ride ordering and management system built for estates — starting with keke. See who's
            available, choose your rider, pay from your RideIN wallet, and rate the ride. No cash, no guessing, no
            waiting at the gate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button as="a" href="#app" variant="primary">
              Request a ride →
            </Button>
            <Button as="a" href="#estates" variant="ghost">
              Bring RideIN to my estate
            </Button>
          </div>
          <div className="mt-11 flex flex-wrap gap-8">
            <Stat value={formatNaira(FARES.pickup.total)} label="Pickup, app fee incl." />
            <Stat value={formatNaira(FARES.chatter.total)} label="Chatter, app fee incl." />
            <Stat value="100%" label="Transfer, zero cash rides" />
          </div>
        </div>

        <div className="rounded-[18px] bg-brand-deep p-6 pb-[22px] text-[#F4F2E8] shadow-soft">
          {SIGN_ROWS.map((row, i) => (
            <div
              key={row.from + row.to}
              className={`flex items-center justify-between ${
                i < SIGN_ROWS.length - 1 ? 'mb-3.5 border-b border-dashed border-white/25 pb-3.5' : ''
              }`}
            >
              <div className="flex items-center gap-2 font-display text-lg font-bold tracking-wide">
                <span>{row.from}</span>
                <span className="text-accent">➜</span>
                <span>{row.to}</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-wider ${
                  row.now ? 'bg-accent text-ink' : 'bg-white/15'
                }`}
              >
                {row.tag}
              </span>
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4 text-[12.5px] text-white/70">
            <span>Millennium Estate Terminal</span>
            <span className="font-mono">05:42 PM</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <b className="block font-mono text-[28px] font-semibold tabular-nums">{value}</b>
      <span className="text-[12.5px] uppercase tracking-wider text-ink-faint dark:text-ink-faint-dark">{label}</span>
    </div>
  )
}
