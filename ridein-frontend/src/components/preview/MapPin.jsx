// A single pin on the map. Purely presentational — position, icon, tone and
// label all come from props, so the same pin renders "you", a rider, or a
// waiting passenger depending on what's passed in.
const TONES = {
  brand: 'bg-brand',
  ink: 'bg-ink dark:bg-ink-dark',
  accent: 'bg-accent',
}

export default function MapPin({ top, left, tone = 'brand', icon = '🛺', label, onClick, selected = false }) {
  const isInteractive = typeof onClick === 'function'
  const bg = selected ? 'bg-accent' : TONES[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      aria-label={label}
      className={`group absolute -translate-x-1/2 -translate-y-full ${isInteractive ? '' : 'cursor-default'}`}
      style={{ top: `${top}%`, left: `${left}%` }}
    >
      <div
        className={`flex h-[30px] w-[30px] -rotate-45 items-center justify-center rounded-full rounded-bl-none border-2 border-surface shadow-soft dark:border-surface-dark ${bg}`}
      >
        <span className="rotate-45 text-[13px] font-bold text-white">{icon}</span>
      </div>
      {label && (
        <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-line-dark dark:bg-surface-dark">
          {label}
        </span>
      )}
    </button>
  )
}
