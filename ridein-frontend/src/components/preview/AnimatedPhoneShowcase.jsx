import RoadGridSVG from './RoadGridSVG.jsx'
import MapPin from './MapPin.jsx'

// A purely decorative, non-interactive phone mockup for signed-out visitors.
// It continuously turntable-spins on the vertical axis, showing the
// passenger side and the rider side as its two faces — nothing on it can be
// clicked, tapped, or "accepted". That's deliberate: the real, functional
// request/accept flows only ever render for a signed-in passenger or rider
// (see AppPreview.jsx), never for an anonymous visitor. This is just the
// homepage's eye candy explaining the idea.
function PhoneFace({ variant, caption, pins }) {
  return (
    <div className="absolute inset-0 rounded-[34px] border border-line bg-surface p-3.5 shadow-soft dark:border-line-dark dark:bg-surface-dark">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-paper dark:bg-paper-dark">
        <div className="absolute left-1/2 top-2 z-10 h-[16px] w-16 -translate-x-1/2 rounded-b-xl bg-ink/90 dark:bg-ink-dark/80" />

        <div className="flex items-center justify-between px-4 pb-2.5 pt-6">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint dark:text-ink-faint-dark">
            {variant === 'passenger' ? 'Passenger view' : 'Rider view'}
          </div>
          <span className="h-2 w-2 rounded-full bg-good shadow-[0_0_0_3px_rgba(47,125,94,0.2)] dark:bg-good-dark" />
        </div>

        <div className="relative mx-3 mb-2.5 overflow-hidden rounded-2xl border border-line dark:border-line-dark">
          <RoadGridSVG variant={variant} />
          {pins.map((p) => (
            <MapPin key={p.top + p.left} top={p.top} left={p.left} tone={p.tone} icon={p.icon} />
          ))}
        </div>

        <div className="mx-3 mb-3 mt-auto rounded-2xl border border-line bg-surface p-3.5 text-center shadow-soft dark:border-line-dark dark:bg-surface-dark">
          <p className="text-[12.5px] font-bold">{caption}</p>
        </div>
      </div>
    </div>
  )
}

export default function AnimatedPhoneShowcase() {
  return (
    <div className="flex justify-center py-4" aria-hidden="true">
      <div className="relative h-[420px] w-[240px] animate-floatY" style={{ perspective: '1400px' }}>
        <div
          className="relative h-full w-full animate-spinY"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            style={{
              transform: 'rotateY(0deg)',
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <PhoneFace
              variant="passenger"
              caption="3 riders online near you"
              pins={[
                { top: 32, left: 30, tone: 'brand', icon: '🛺' },
                { top: 55, left: 70, tone: 'brand', icon: '🛺' },
                { top: 74, left: 40, tone: 'brand', icon: '🛺' },
              ]}
            />
          </div>
          <div
            style={{
              transform: 'rotateY(180deg)',
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <PhoneFace
              variant="rider"
              caption="2 passengers waiting nearby"
              pins={[
                { top: 40, left: 35, tone: 'accent', icon: '👤' },
                { top: 62, left: 65, tone: 'accent', icon: '👤' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
