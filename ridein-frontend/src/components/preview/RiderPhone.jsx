import { useEffect, useState } from 'react'
import { WAITING_PASSENGERS } from '../../data/passengers.js'
import { FARES, formatNaira } from '../../data/fares.js'
import { MILLENNIUM_ESTATE } from '../../data/estate.js'
import { useSimulatedPosition } from '../../hooks/useSimulatedMotion.js'
import { haversineMeters, formatDistance, formatEta } from '../../lib/distance.js'
import { readMostRecentSharedLocation, subscribeToSharedLocations } from '../../lib/sharedLocation.js'
import FareLine from '../ui/FareLine.jsx'
import GoogleEstateMap from './GoogleEstateMap.jsx'

const START_SUMMARY = { rides: 6, earned: 6900, tips: 700 }

export default function RiderPhone() {
  // "My" position drifts a little every few seconds to stand in for the
  // rider's real GPS position while driving around the estate — swap this
  // for the device's actual location once the rider app reports one.
  const myPosition = useSimulatedPosition(MILLENNIUM_ESTATE.gate, MILLENNIUM_ESTATE.center)

  const [viewingId, setViewingId] = useState(null)
  const [accepted, setAccepted] = useState(false)
  const [summary, setSummary] = useState(START_SUMMARY)

  // A real passenger's shared GPS location (from PassengerPhone's "Share my
  // location" control), if any exists on this browser — falls back to null
  // so the rest of the demo (simulated WAITING_PASSENGERS) works unchanged
  // when nobody has shared a real location yet (e.g. in an automated test
  // browser with no location permission granted).
  const [sharedLocation, setSharedLocation] = useState(() => readMostRecentSharedLocation())

  useEffect(() => {
    return subscribeToSharedLocations(() => setSharedLocation(readMostRecentSharedLocation()))
  }, [])

  // When a passenger has shared a real location, show it as one more
  // "waiting passenger" a rider can view and accept — same flow as the
  // simulated ones, just driven by a real lat/lng instead of a fake one.
  const passengers = sharedLocation
    ? [
        ...WAITING_PASSENGERS,
        {
          id: 'shared-live-passenger',
          name: 'Live passenger (shared GPS)',
          position: { lat: sharedLocation.lat, lng: sharedLocation.lng },
          fareType: 'pickup',
          isReal: true,
        },
      ]
    : WAITING_PASSENGERS

  function viewPassenger(passengerId) {
    setViewingId(passengerId)
    setAccepted(false)
  }

  const viewing = passengers.find((p) => p.id === viewingId) || null
  const fare = viewing ? FARES[viewing.fareType] : null
  const viewingMeters = viewing ? haversineMeters(myPosition, viewing.position) : 0

  function backToSummary() {
    setSummary((s) => ({ rides: s.rides + 1, earned: s.earned + fare.riderFare, tips: s.tips }))
    setViewingId(null)
    setAccepted(false)
  }

  // Used by "Cancel ride" once accepted — back to available, nothing left
  // selected or accepted.
  function cancelRide() {
    setViewingId(null)
    setAccepted(false)
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[340px] rounded-[34px] border border-line bg-surface p-3.5 shadow-soft dark:border-line-dark dark:bg-surface-dark">
      <div className="relative flex min-h-[600px] min-w-0 flex-col overflow-hidden rounded-[22px] bg-paper dark:bg-paper-dark">
        <div className="absolute left-1/2 top-2 z-10 h-[18px] w-20 -translate-x-1/2 rounded-b-xl bg-ink/90 dark:bg-ink-dark/80" />

        <div className="flex items-center justify-between px-[18px] pb-3 pt-[26px]">
          <div>
            <div className="text-xs text-ink-faint dark:text-ink-faint-dark">You're online</div>
            <div className="text-[15px] font-bold">Emeka O. · Keke #14</div>
          </div>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent-tint text-[13px] font-bold text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light">
            E
          </div>
        </div>

        <div className="relative mx-[14px] mb-2.5 overflow-hidden rounded-2xl border border-line dark:border-line-dark">
          <GoogleEstateMap
            variant="rider"
            center={MILLENNIUM_ESTATE.center}
            zoom={MILLENNIUM_ESTATE.zoom}
            you={{ position: myPosition, label: 'You', icon: '🛺' }}
            markers={passengers.map((passenger) => {
              const meters = haversineMeters(myPosition, passenger.position)
              return {
                id: passenger.id,
                position: passenger.position,
                tone: 'accent',
                icon: passenger.isReal ? '📍' : '👤',
                label: `${passenger.name} · ${FARES[passenger.fareType].label} · ${formatDistance(meters)}`,
                selected: viewingId === passenger.id,
                onClick: () => viewPassenger(passenger.id),
              }
            })}
          />
        </div>

        <div className="mx-[14px] mb-3 flex gap-2 overflow-x-auto pb-0.5">
          {passengers.map((passenger) => {
            const meters = haversineMeters(myPosition, passenger.position)
            const isSelected = viewingId === passenger.id
            return (
              <button
                key={passenger.id}
                type="button"
                onClick={() => viewPassenger(passenger.id)}
                className={`flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold whitespace-nowrap ${
                  isSelected
                    ? 'border-accent bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
                    : 'border-line bg-surface text-ink-soft dark:border-line-dark dark:bg-surface-dark dark:text-ink-soft-dark'
                }`}
              >
                {passenger.isReal ? '📍' : '👤'} {passenger.name}{' '}
                <span className="font-mono">{formatDistance(meters)}</span>
              </button>
            )
          })}
        </div>

        <div className="mx-3.5 mb-3.5 mt-auto rounded-2xl border border-line bg-surface p-4 shadow-soft dark:border-line-dark dark:bg-surface-dark">
          {!viewing && (
            <>
              <div className="mb-2.5 flex items-center justify-between text-sm font-bold">
                <span>Today so far</span>
                <span className="font-mono text-[12.5px] font-medium text-ink-faint dark:text-ink-faint-dark">
                  {summary.rides} rides
                </span>
              </div>
              <FareLine label="Fares earned (yours)" value={formatNaira(summary.earned)} />
              <FareLine label="Remitted to you tonight" value={formatNaira(summary.earned)} good />
              <FareLine label="Cash tips received" value={formatNaira(summary.tips)} />
            </>
          )}

          {viewing && !accepted && fare && (
            <>
              <div className="mb-2.5 flex items-center justify-between text-sm font-bold">
                <span>{viewing.name}</span>
                <span className="font-mono text-[12.5px] font-medium text-ink-faint dark:text-ink-faint-dark">
                  {formatDistance(viewingMeters)} · {formatEta(viewingMeters)}
                </span>
              </div>
              <FareLine label="Ride type" value={fare.label} />
              <FareLine label="You will earn" value={formatNaira(fare.riderFare)} good />
              <FareLine label="Passenger pays (incl. fee)" value={formatNaira(fare.total)} />
              <button
                type="button"
                onClick={() => setAccepted(true)}
                className="mt-2 w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
              >
                Accept ride
              </button>
              <p className="mt-2 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                Already paid by bank transfer to RideIN — collect nothing from the passenger.
              </p>
            </>
          )}

          {viewing && accepted && (
            <>
              <div className="mb-1.5 text-center text-sm font-bold text-good dark:text-good-dark">✓ Accepted</div>
              <p className="mb-1.5 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                Heading to {viewing.name} now.
              </p>
              <p className="mb-3.5 text-center font-mono text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                {viewing.isReal ? 'Live GPS' : 'Simulated'} · {formatDistance(viewingMeters)} · {formatEta(viewingMeters)}
              </p>
              <button
                type="button"
                onClick={backToSummary}
                className="mb-2.5 w-full rounded-full border border-line py-3 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
              >
                Back to today's summary
              </button>
              <button
                type="button"
                onClick={cancelRide}
                className="w-full rounded-full border border-danger py-2.5 text-sm font-bold text-danger hover:bg-danger/5 dark:border-danger-dark dark:text-danger-dark dark:hover:bg-danger-dark/10"
              >
                Cancel ride
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
