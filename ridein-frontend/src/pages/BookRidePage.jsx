import { useEffect, useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MILLENNIUM_ESTATE } from '../data/estate.js'
import { haversineMeters, formatDistance, formatEta } from '../lib/distance.js'
import { formatNaira } from '../data/fares.js'
import Avatar from '../components/ui/Avatar.jsx'

const POLL_MS = 5000
const RIDERS_POLL_MS = 10000
const LATENESS_FEE = 300

// Ride is "live" (worth polling / blocking a new booking) in these statuses.
const OPEN_STATUSES = ['requested', 'accepted', 'enroute']

function LatenessNote() {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent-tint px-3.5 py-3 text-[12.5px] leading-relaxed text-accent-deep dark:border-accent/20 dark:bg-accent-tint-dark dark:text-accent-light">
      <b>Stand at your pickup spot.</b> Lateness attracts an extra fee of {formatNaira(LATENESS_FEE)}, settled
      directly with your rider. There's no waiting for pickup — if you're not there when the rider arrives, they
      may drive off.
    </div>
  )
}

function RiderCard({ rider, distanceMeters, selected, onSelect, busy }) {
  return (
    <div
      className={`flex-none w-[220px] rounded-2xl border p-3.5 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 dark:shadow-[0_10px_25px_-10px_rgba(0,0,0,0.6)] ${
        selected
          ? 'border-brand bg-brand-tint dark:border-brand-light dark:bg-brand-tint-dark'
          : 'border-line bg-surface dark:border-line-dark dark:bg-surface-dark'
      }`}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <Avatar name={rider.name} photo={rider.photo} size={40} tone="accent" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold">{rider.name || 'Rider'}</div>
          <div className="truncate text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
            {rider.plateNumber || '—'}
          </div>
        </div>
      </div>
      {distanceMeters != null && (
        <div className="mb-2.5 text-[12px] font-semibold text-accent-deep dark:text-accent-light">
          {formatDistance(distanceMeters)} away · ~{formatEta(distanceMeters)}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => onSelect(rider.id)}
        className={`w-full rounded-full py-2 text-[12.5px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
          selected
            ? 'bg-brand text-white hover:bg-brand-deep'
            : 'border border-line hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark'
        }`}
      >
        {selected ? 'Selected — request them' : 'Request this rider'}
      </button>
    </div>
  )
}

export default function BookRidePage() {
  const { user, requestRide, getRide, listMyRides, cancelRide, completeRide, upsertMyLocation, listNearbyRiders } =
    useAuth()

  const [loadingInitial, setLoadingInitial] = useState(true)
  const [activeRide, setActiveRide] = useState(null)

  // --- Pickup step state ---
  const [pickupMode, setPickupMode] = useState('live') // 'live' | 'manual'
  const [liveCoords, setLiveCoords] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [street, setStreet] = useState('')
  const [riders, setRiders] = useState([])
  const [selectedRiderId, setSelectedRiderId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // --- Active-ride step state ---
  const [ratingOpen, setRatingOpen] = useState(false)
  const [stars, setStars] = useState(0)
  const [tip, setTip] = useState(0)
  const [completing, setCompleting] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const pollRef = useRef(null)
  const ridersPollRef = useRef(null)

  // On load: if the passenger already has an open ride (e.g. they refreshed
  // the page mid-ride), jump straight to the active view instead of letting
  // them accidentally book a second one.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mine = await listMyRides()
        const open = mine.find((r) => OPEN_STATUSES.includes(r.status))
        if (!cancelled && open) setActiveRide(open)
      } catch {
        // Best-effort — worst case they just see the booking form.
      } finally {
        if (!cancelled) setLoadingInitial(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll nearby riders while still on the pickup step.
  useEffect(() => {
    if (activeRide) return
    async function poll() {
      try {
        const list = await listNearbyRiders()
        setRiders(list)
      } catch {
        // Quietly retry next tick.
      }
    }
    poll()
    ridersPollRef.current = setInterval(poll, RIDERS_POLL_MS)
    return () => clearInterval(ridersPollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide])

  // Poll the active ride's status while it's still open.
  useEffect(() => {
    if (!activeRide || !OPEN_STATUSES.includes(activeRide.status)) {
      clearInterval(pollRef.current)
      return
    }
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await getRide(activeRide.id)
        setActiveRide(fresh)
      } catch {
        // Quietly retry next tick.
      }
    }, POLL_MS)
    return () => clearInterval(pollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide?.id, activeRide?.status])

  if (!user || user.role !== 'passenger') {
    return <Navigate to="/login" replace />
  }

  function shareLiveLocation() {
    if (!navigator.geolocation) {
      setLocateError('This browser has no location support. Enter your address manually instead.')
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
        setLiveCoords(coords)
        setLocating(false)
        upsertMyLocation(coords.lat, coords.lng, coords.accuracy).catch(() => {})
      },
      () => {
        setLocating(false)
        setLocateError('Could not get your location (permission denied or unavailable). Enter it manually instead.')
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  function pickupCoords() {
    if (pickupMode === 'live' && liveCoords) return { lat: liveCoords.lat, lng: liveCoords.lng }
    // Manual address entry has no geocoding available (no Google Maps key
    // configured in this deployment) -- the estate center stands in for the
    // pin, while the typed address is what the rider actually reads.
    return { lat: MILLENNIUM_ESTATE.center.lat, lng: MILLENNIUM_ESTATE.center.lng }
  }

  function pickupAddressText() {
    if (pickupMode === 'manual') {
      const parts = [houseNumber.trim(), street.trim()].filter(Boolean)
      return parts.join(', ')
    }
    return ''
  }

  const canSubmit =
    (pickupMode === 'live' && !!liveCoords) || (pickupMode === 'manual' && houseNumber.trim() && street.trim())

  async function handleRequest(requestedRiderId) {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const { lat, lng } = pickupCoords()
      const ride = await requestRide({
        pickupLat: lat,
        pickupLng: lng,
        pickupAddress: pickupAddressText(),
        requestedRiderId: requestedRiderId || undefined,
      })
      setActiveRide(ride)
    } catch (err) {
      setSubmitError(err.message || 'Could not request a ride — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function selectRider(riderId) {
    setSelectedRiderId((current) => (current === riderId ? null : riderId))
  }

  async function handleCancel() {
    if (!activeRide) return
    setCancelling(true)
    try {
      const ride = await cancelRide(activeRide.id)
      setActiveRide(ride)
    } catch {
      // Leave the ride showing as-is; the passenger can try again.
    } finally {
      setCancelling(false)
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      const ride = await completeRide(activeRide.id, {
        rating: stars || undefined,
        tipAmount: tip || undefined,
      })
      setActiveRide(ride)
      setRatingOpen(false)
    } catch {
      // Leave the form open so they can retry.
    } finally {
      setCompleting(false)
    }
  }

  function bookAnother() {
    setActiveRide(null)
    setSelectedRiderId(null)
    setSubmitError('')
    setRatingOpen(false)
    setStars(0)
    setTip(0)
  }

  const sortedRiders = liveCoords
    ? [...riders].sort(
        (a, b) => haversineMeters(liveCoords, a) - haversineMeters(liveCoords, b),
      )
    : riders

  return (
    <div className="mx-auto max-w-3xl px-7 py-12">
      <div className="mb-8">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-brand dark:text-brand-light">
          Book a ride
        </p>
        <h1 className="mt-1 text-2xl font-extrabold normal-case sm:text-3xl">Where should your rider find you?</h1>
        <p className="mt-1 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
          Share your live location, or type your pickup spot manually — then choose any available rider, or send it
          out to everyone nearby.
        </p>
      </div>

      {loadingInitial ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center text-[13px] text-ink-faint dark:border-line-dark dark:bg-surface-dark dark:text-ink-faint-dark">
          Loading…
        </div>
      ) : activeRide ? (
        <ActiveRideCard
          ride={activeRide}
          onCancel={handleCancel}
          cancelling={cancelling}
          ratingOpen={ratingOpen}
          setRatingOpen={setRatingOpen}
          stars={stars}
          setStars={setStars}
          tip={tip}
          setTip={setTip}
          onComplete={handleComplete}
          completing={completing}
          onBookAnother={bookAnother}
        />
      ) : (
        <div className="rounded-[30px] border-2 border-line bg-gradient-to-b from-surface to-surface-2 p-4 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)] dark:border-line-dark dark:from-surface-dark dark:to-surface-2-dark dark:shadow-[0_30px_70px_-25px_rgba(0,0,0,0.75)]">
          <div className="rounded-[22px] bg-paper p-5 dark:bg-paper-dark">
            <div className="mb-4 flex gap-1.5 rounded-[10px] bg-surface-2 p-1 dark:bg-surface-2-dark">
              <button
                type="button"
                onClick={() => setPickupMode('live')}
                className={`flex-1 rounded-lg py-2.5 text-[12.5px] font-bold ${
                  pickupMode === 'live'
                    ? 'bg-surface text-ink shadow-sm dark:bg-surface-dark dark:text-ink-dark'
                    : 'text-ink-soft dark:text-ink-soft-dark'
                }`}
              >
                📍 Share live location
              </button>
              <button
                type="button"
                onClick={() => setPickupMode('manual')}
                className={`flex-1 rounded-lg py-2.5 text-[12.5px] font-bold ${
                  pickupMode === 'manual'
                    ? 'bg-surface text-ink shadow-sm dark:bg-surface-dark dark:text-ink-dark'
                    : 'text-ink-soft dark:text-ink-soft-dark'
                }`}
              >
                ✍️ Enter address manually
              </button>
            </div>

            {pickupMode === 'live' ? (
              <div className="mb-4">
                {liveCoords ? (
                  <div className="rounded-xl border border-good/30 bg-good/10 px-3.5 py-3 text-[12.5px] font-semibold text-good dark:border-good-dark/30 dark:bg-good-dark/10 dark:text-good-dark">
                    ✓ Location shared — riders will see exactly where you're standing.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={shareLiveLocation}
                    disabled={locating}
                    className="w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locating ? 'Getting your location…' : 'Share my current location'}
                  </button>
                )}
                {locateError && (
                  <p className="mt-2 text-[12px] text-danger dark:text-danger-dark">{locateError}</p>
                )}
              </div>
            ) : (
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft dark:text-ink-soft-dark">
                    House number
                  </label>
                  <input
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. 12B"
                    className="w-full rounded-[9px] border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft dark:text-ink-soft-dark">
                    Street / area
                  </label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Palm Street, Block 14"
                    className="w-full rounded-[9px] border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <LatenessNote />
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[13px] font-bold normal-case">Available riders nearby</h2>
                <span className="text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
                  {sortedRiders.length} online
                </span>
              </div>
              {sortedRiders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-3.5 py-4 text-center text-[12.5px] text-ink-faint dark:border-line-dark dark:text-ink-faint-dark">
                  No riders are currently sharing their location. You can still request a ride — it'll go out to the
                  next rider who comes online.
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {sortedRiders.map((rider) => (
                    <RiderCard
                      key={rider.id}
                      rider={rider}
                      distanceMeters={liveCoords ? haversineMeters(liveCoords, rider) : null}
                      selected={selectedRiderId === rider.id}
                      onSelect={selectRider}
                      busy={submitting}
                    />
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <p className="mb-3 text-[12.5px] font-semibold text-danger dark:text-danger-dark">{submitError}</p>
            )}

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={() => handleRequest(selectedRiderId)}
              className="w-full rounded-[11px] bg-brand py-3.5 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Requesting…'
                : selectedRiderId
                  ? 'Request selected rider'
                  : 'Request any nearby rider'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function statusLabel(status) {
  return (
    {
      requested: 'Waiting for a rider to accept',
      accepted: 'Rider is on the way',
      enroute: 'Rider is on the way',
      completed: 'Ride completed',
      cancelled_by_passenger: 'You cancelled this ride',
      cancelled_by_rider: 'Rider cancelled this ride',
    }[status] || status
  )
}

function ActiveRideCard({
  ride,
  onCancel,
  cancelling,
  ratingOpen,
  setRatingOpen,
  stars,
  setStars,
  tip,
  setTip,
  onComplete,
  completing,
  onBookAnother,
}) {
  const isWaiting = ride.status === 'requested'
  const isEnRoute = ride.status === 'accepted' || ride.status === 'enroute'
  const isDone = ride.status === 'completed'
  const isCancelled = ride.status === 'cancelled_by_passenger' || ride.status === 'cancelled_by_rider'
  const isCancellable = ['requested', 'accepted', 'enroute'].includes(ride.status)

  return (
    <div className="rounded-[30px] border-2 border-line bg-gradient-to-b from-surface to-surface-2 p-4 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)] dark:border-line-dark dark:from-surface-dark dark:to-surface-2-dark dark:shadow-[0_30px_70px_-25px_rgba(0,0,0,0.75)]">
      <div className="rounded-[22px] bg-paper p-5 dark:bg-paper-dark">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wide ${
              isDone
                ? 'bg-good/15 text-good dark:text-good-dark'
                : isCancelled
                  ? 'bg-danger/10 text-danger dark:bg-danger-dark/15 dark:text-danger-dark'
                  : 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
            }`}
          >
            {statusLabel(ride.status)}
          </span>
          {ride.fare != null && (
            <span className="font-mono text-[13px] font-bold text-brand dark:text-brand-light">
              {formatNaira(ride.fare)}
            </span>
          )}
        </div>

        {isWaiting && (
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-soft-dark">
            Your request has gone out{ride.requestedRider ? ` to ${ride.requestedRider.name}` : ' to nearby riders'}
            . This updates automatically once someone accepts.
          </p>
        )}

        {(isEnRoute || isDone) && ride.rider && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 dark:border-line-dark dark:bg-surface-dark">
            <Avatar name={ride.rider.name} photo={ride.rider.photo} size={48} tone="accent" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{ride.rider.name}</div>
              <div className="truncate text-[12px] text-ink-faint dark:text-ink-faint-dark">
                {ride.rider.plateNumber} · {ride.rider.estate}
              </div>
            </div>
            {ride.rider.phone && isEnRoute && (
              <a
                href={`tel:${ride.rider.phone}`}
                className="flex-none rounded-full bg-brand px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-brand-deep"
              >
                Call {ride.rider.phone}
              </a>
            )}
          </div>
        )}

        {(ride.pickupAddress || ride.pickupLat != null) && (
          <div className="mb-4 text-[12.5px] text-ink-soft dark:text-ink-soft-dark">
            <span className="font-semibold">Pickup: </span>
            {ride.pickupAddress || `${ride.pickupLat?.toFixed(5)}, ${ride.pickupLng?.toFixed(5)} (shared location)`}
          </div>
        )}

        {(isWaiting || isEnRoute) && (
          <div className="mb-4">
            <LatenessNote />
          </div>
        )}

        {isDone && (
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-soft-dark">
            Pay {ride.rider?.name || 'your rider'} by bank transfer to close this out — nothing owed here in-app.
          </p>
        )}

        {isCancelled && (
          <p className="mb-4 text-[13px] text-ink-soft dark:text-ink-soft-dark">
            This ride won't be picked up. You can request a new one any time.
          </p>
        )}

        {isEnRoute && !ratingOpen && (
          <button
            type="button"
            onClick={() => setRatingOpen(true)}
            className="mb-2.5 w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Mark ride as completed
          </button>
        )}

        {isEnRoute && ratingOpen && (
          <div className="mb-3 rounded-2xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
            <div className="mb-2 text-center text-[13px] font-bold">Rate this ride (optional)</div>
            <div className="mb-3 flex justify-center gap-1.5">
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
            <p className="mb-1.5 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
              Cash tip? Fully optional.
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
              disabled={completing}
              onClick={onComplete}
              className="w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {completing ? 'Submitting…' : 'Confirm ride completed'}
            </button>
          </div>
        )}

        {isCancellable && (
          <button
            type="button"
            disabled={cancelling}
            onClick={onCancel}
            className="w-full rounded-full border border-danger py-2.5 text-sm font-bold text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-danger-dark dark:text-danger-dark dark:hover:bg-danger-dark/10"
          >
            Cancel ride
          </button>
        )}

        {(isDone || isCancelled) && (
          <button
            type="button"
            onClick={onBookAnother}
            className="w-full rounded-[11px] bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Book another ride
          </button>
        )}

        <p className="mt-4 text-center text-[11.5px] text-ink-faint dark:text-ink-faint-dark">
          Need help with this ride?{' '}
          <Link to="/support" className="font-semibold underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
