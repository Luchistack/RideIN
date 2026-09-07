import { useState } from 'react'

// A compact "Share my location" control for the passenger phone preview.
// Uses the real browser Geolocation API — with a manual lat/lng fallback
// for when permission is denied, the API isn't available, or (as in most
// automated test browsers) there's simply no real GPS to report. Once set,
// the location is shown back to the passenger and also written to the
// shared-location mailbox so the rider side can see it (see RiderPhone.jsx
// and lib/sharedLocation.js).
export default function LocationShare({ location }) {
  const { location: current, status, error, shareOnce, startLiveTracking, stopSharing, setManualLocation } = location
  const [showManual, setShowManual] = useState(false)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')

  function handleManualSubmit(e) {
    e.preventDefault()
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    setManualLocation({ lat, lng })
    setShowManual(false)
  }

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-2.5 text-[11.5px] dark:border-line-dark dark:bg-surface-2-dark">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-ink dark:text-ink-dark">📍 Your location</div>
          {current ? (
            <div className="truncate font-mono text-ink-faint dark:text-ink-faint-dark">
              {current.lat.toFixed(4)}, {current.lng.toFixed(4)}
              {status === 'live' ? ' · live' : ''}
            </div>
          ) : (
            <div className="text-ink-faint dark:text-ink-faint-dark">Not shared yet</div>
          )}
        </div>
        <div className="flex flex-none gap-1.5">
          {!current && (
            <button
              type="button"
              onClick={shareOnce}
              disabled={status === 'requesting'}
              className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-bold hover:border-ink-faint disabled:opacity-60 dark:border-line-dark dark:bg-surface-dark dark:hover:border-ink-faint-dark"
            >
              {status === 'requesting' ? 'Locating…' : 'Share'}
            </button>
          )}
          {current && (
            <button
              type="button"
              onClick={stopSharing}
              className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-bold hover:border-ink-faint dark:border-line-dark dark:bg-surface-dark dark:hover:border-ink-faint-dark"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {current && status !== 'live' && (
        <button
          type="button"
          onClick={startLiveTracking}
          className="mt-1.5 text-[11px] font-semibold text-brand underline dark:text-brand-light"
        >
          Monitor live (keep updating)
        </button>
      )}

      {error && <p className="mt-1.5 text-danger dark:text-danger-dark">{error}</p>}

      {(error || showManual) && !current && (
        <form onSubmit={handleManualSubmit} className="mt-2 flex items-center gap-1.5">
          <input
            type="number"
            step="any"
            required
            placeholder="lat"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="w-16 rounded-md border border-line bg-surface px-1.5 py-1 font-mono text-[11px] dark:border-line-dark dark:bg-surface-dark"
          />
          <input
            type="number"
            step="any"
            required
            placeholder="lng"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="w-16 rounded-md border border-line bg-surface px-1.5 py-1 font-mono text-[11px] dark:border-line-dark dark:bg-surface-dark"
          />
          <button
            type="submit"
            className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-deep"
          >
            Set
          </button>
        </form>
      )}

      {!error && !current && !showManual && (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="mt-1.5 text-[11px] font-semibold text-ink-faint underline dark:text-ink-faint-dark"
        >
          Set manually instead
        </button>
      )}
    </div>
  )
}
