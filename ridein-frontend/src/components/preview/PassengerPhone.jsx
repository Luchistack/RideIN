import { useEffect, useState } from 'react'
import { NEARBY_RIDERS } from '../../data/riders.js'
import { FARES, formatNaira } from '../../data/fares.js'
import { MILLENNIUM_ESTATE } from '../../data/estate.js'
import { useSimulatedPositions } from '../../hooks/useSimulatedMotion.js'
import { haversineMeters, formatDistance, formatEta } from '../../lib/distance.js'
import FareLine from '../ui/FareLine.jsx'
import GoogleEstateMap from './GoogleEstateMap.jsx'

const YOU = { position: MILLENNIUM_ESTATE.gate, label: 'You — Block 14 gate', icon: '●' }

// Ride flow, one stage at a time:
// idle -> request (choose ride type) -> requesting -> enroute -> rating -> done
export default function PassengerPhone() {
  // Riders "drive around" the estate a little every few seconds, so distance
  // and ETA below are live, not a fixed number — swap this for real GPS
  // updates from your backend once riders report their own position.
  const riders = useSimulatedPositions(NEARBY_RIDERS, MILLENNIUM_ESTATE.center)

  const [selectedId, setSelectedId] = useState(null)
  const [rideType, setRideType] = useState('pickup')
  const [stage, setStage] = useState('idle')
  const [stars, setStars] = useState(0)
  const [tip, setTip] = useState(0)

  useEffect(() => {
    if (stage !== 'requesting') return
    const timer = setTimeout(() => setStage('enroute'), 900)
    return () => clearTimeout(timer)
  }, [stage])

  function selectRider(riderId) {
    setSelectedId(riderId)
    setRideType('pickup')
    setStage('request')
    setStars(0)
    setTip(0)
  }

  const selected = riders.find((r) => r.id === selectedId) || null
  const selectedMeters = selected ? haversineMeters(YOU.position, selected.position) : 0
  const fare = FARES[rideType]

  return (
    <div className="rounded-[34px] border border-line bg-surface p-3.5 shadow-soft dark:border-line-dark dark:bg-surface-dark">
      <div className="relative flex min-h-[600px] flex-col overflow-hidden rounded-[22px] bg-paper dark:bg-paper-dark">
        <div className="absolute left-1/2 top-2 z-10 h-[18px] w-20 -translate-x-1/2 rounded-b-xl bg-ink/90 dark:bg-ink-dark/80" />

        <div className="flex items-center justify-between px-[18px] pb-3 pt-[26px]">
          <div>
            <div className="text-xs text-ink-faint dark:text-ink-faint-dark">Good evening</div>
            <div className="text-[15px] font-bold">Ada, Block 14</div>
          </div>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-tint text-[13px] font-bold text-brand dark:bg-brand-tint-dark dark:text-brand-light">
            A
          </div>
        </div>

        <div className="relative mx-[14px] mb-2.5 overflow-hidden rounded-2xl border border-line dark:border-line-dark">
          <GoogleEstateMap
            variant="passenger"
            center={MILLENNIUM_ESTATE.center}
            zoom={MILLENNIUM_ESTATE.zoom}
            you={YOU}
            markers={riders.map((rider) => {
              const meters = haversineMeters(YOU.position, rider.position)
              return {
                id: rider.id,
                position: rider.position,
                icon: '🛺',
                label: `${rider.name} · ★${rider.rating} · ${formatDistance(meters)} · ${formatEta(meters)}`,
                selected: selectedId === rider.id,
                onClick: () => selectRider(rider.id),
              }
            })}
          />
        </div>

        <div className="mx-[14px] mb-3 flex gap-2 overflow-x-auto pb-0.5">
          {riders.map((rider) => {
            const meters = haversineMeters(YOU.position, rider.position)
            const isSelected = selectedId === rider.id
            return (
              <button
                key={rider.id}
                type="button"
                onClick={() => selectRider(rider.id)}
                className={`flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold whitespace-nowrap ${
                  isSelected
                    ? 'border-accent bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
                    : 'border-line bg-surface text-ink-soft dark:border-line-dark dark:bg-surface-dark dark:text-ink-soft-dark'
                }`}
              >
                🛺 {rider.name} <span className="font-mono">{formatDistance(meters)}</span>
              </button>
            )
          })}
        </div>

        <div className="mx-3.5 mb-3.5 mt-auto rounded-2xl border border-line bg-surface p-4 shadow-soft dark:border-line-dark dark:bg-surface-dark">
          {stage === 'idle' && (
            <p className="text-center text-[13px] text-ink-faint dark:text-ink-faint-dark">
              Tap a rider on the map (or above) to begin →
            </p>
          )}

          {stage === 'request' && selected && (
            <>
              <div className="mb-2.5 flex items-center justify-between text-sm font-bold">
                <span>{selected.name}</span>
                <span className="text-[12.5px] font-semibold text-accent dark:text-accent-light">
                  ★ {selected.rating} · {formatDistance(selectedMeters)} · {formatEta(selectedMeters)}
                </span>
              </div>
              <div className="mb-3 flex gap-1.5 rounded-[10px] bg-surface-2 p-1 dark:bg-surface-2-dark">
                {Object.values(FARES).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setRideType(f.key)}
                    className={`flex-1 rounded-lg py-2 text-[12.5px] font-bold ${
                      rideType === f.key
                        ? 'bg-surface text-ink shadow-sm dark:bg-surface-dark dark:text-ink-dark'
                        : 'text-ink-soft dark:text-ink-soft-dark'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <FareLine label="Rider's fare" value={formatNaira(fare.riderFare)} />
              <FareLine label="Service fee" value={formatNaira(fare.serviceFee)} />
              <div className="mt-1 flex items-center justify-between border-t border-dashed border-line pt-2 dark:border-line-dark">
                <span className="text-[13px]">From your wallet</span>
                <b className="font-mono text-[15px] text-brand dark:text-brand-light">{formatNaira(fare.total)}</b>
              </div>
              <button
                type="button"
                onClick={() => setStage('requesting')}
                className="mt-2.5 w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
              >
                Request {selected.name}
              </button>
              <p className="mt-2 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                Not free? Close this and tap another rider.
              </p>
            </>
          )}

          {stage === 'requesting' && selected && (
            <>
              <div className="mb-1.5 text-sm font-bold">Confirming your ride…</div>
              <p className="text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                {selected.name} is on the way to your pin.
              </p>
            </>
          )}

          {stage === 'enroute' && selected && (
            <>
              <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
                <span>On the way</span>
                <span className="text-[12.5px] font-semibold text-accent dark:text-accent-light">
                  🛺 {selected.name}
                </span>
              </div>
              <p className="mb-3 text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                Fare already settled from your wallet. Nothing to pay on arrival.
              </p>
              <button
                type="button"
                onClick={() => setStage('rating')}
                className="w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
              >
                Simulate arrival
              </button>
            </>
          )}

          {stage === 'rating' && selected && (
            <>
              <div className="mb-3 text-center text-sm font-bold">Rate {selected.name}</div>
              <div className="mb-2 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    className={`text-2xl leading-none ${n <= stars ? 'text-accent' : 'text-line dark:text-line-dark'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="mb-1 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                Add a cash tip? Fully optional.
              </p>
              <div className="mb-3 flex gap-2">
                {[0, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTip(v)}
                    className={`flex-1 rounded-lg border py-2 font-mono text-[12.5px] font-semibold ${
                      tip === v
                        ? 'border-accent bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
                        : 'border-line bg-surface dark:border-line-dark dark:bg-surface-dark'
                    }`}
                  >
                    {v === 0 ? 'No tip' : formatNaira(v)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStage('done')}
                className="w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
              >
                Submit
              </button>
            </>
          )}

          {stage === 'done' && selected && (
            <>
              <div className="mb-1.5 text-center text-sm font-bold text-good dark:text-good-dark">
                ✓ Ride closed out
              </div>
              <p className="text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                You rated {selected.name} {stars || 5}★{tip ? ` and tipped ${formatNaira(tip)} in cash` : ''}. Tap
                another rider anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
