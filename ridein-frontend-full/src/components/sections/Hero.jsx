import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import { FARES, formatNaira } from '../../data/fares.js'
import { HERO_IMAGES } from '../../data/heroImages.js'

const SIGN_ROWS = [
  { from: 'GATE', to: 'BLOCK 14', tag: 'Next rider · 3 min', now: true },
  { from: 'GATE', to: 'ESTATE HALL', tag: '2 riders waiting' },
  { from: 'CHATTER', to: 'MAIN ROAD', tag: `${formatNaira(FARES.chatter.total)} flat` },
]

const SLIDE_INTERVAL_MS = 3000

export default function Hero() {
  // Cross-fades through the estate/keke photos behind the hero copy. Purely
  // decorative — swap HERO_IMAGES for real photos whenever you have them.
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (HERO_IMAGES.length < 2) return
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % HERO_IMAGES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="relative isolate overflow-hidden px-7 pb-16 pt-[76px]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            // Scaled up a bit so the blur (which softens the edges) never
            // reveals a sliver of empty space around the image.
            className={`absolute inset-0 h-full w-full scale-105 object-cover blur-sm transition-opacity duration-[1400ms] ease-in-out ${
              i === slide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Dim the (now blurred) photos so the copy on top stays easy to read,
            in both themes — moderate dim, not a near-black wash */}
        <div className="absolute inset-0 bg-brand-deep/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 py-[7px] pl-2.5 pr-3.5 text-[12.5px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <span className="h-[7px] w-[7px] rounded-full bg-good shadow-[0_0_0_3px_rgba(47,125,94,0.35)]" />
            Live in Millennium Estate
          </span>
          <h1 className="text-[40px] font-extrabold leading-[0.98] text-white sm:text-[54px] lg:text-[68px]">
            Your routes,
            <br />
            <span className="text-accent">made easy.</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/85">
            RideIN is the ride ordering and management system built for estates — starting with keke. See who's
            available, choose your rider, pay by bank transfer straight to RideIN, and rate the ride. No cash, no
            guessing, no waiting at the gate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button as="a" href="#app" variant="primary">
              Request a ride →
            </Button>
            <Button as="a" href="#estates" variant="ghost" className="!border-white/35 !text-white hover:!border-white/70">
              Bring RideIN to my estate
            </Button>
          </div>
          <div className="mt-11 flex flex-wrap gap-8">
            <Stat value={formatNaira(FARES.pickup.total)} label="Pickup, app fee incl." />
            <Stat value={formatNaira(FARES.chatter.total)} label="Chatter, app fee incl." />
            <Stat value="100%" label="Transfer, zero cash rides" />
          </div>
        </div>

        <div className="rounded-[18px] bg-brand-deep/90 p-6 pb-[22px] text-[#F4F2E8] shadow-soft ring-1 ring-white/10 backdrop-blur-sm">
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
      <b className="block font-mono text-[28px] font-semibold tabular-nums text-white">{value}</b>
      <span className="text-[12.5px] uppercase tracking-wider text-white/65">{label}</span>
    </div>
  )
}
