// A stylized estate road layout used behind the map pins.
// Swap this out for a real Google Maps / Mapbox embed once you wire up live locations —
// the pins in MapPin.jsx already position themselves by percentage, so the swap is contained here.
export default function RoadGridSVG({ variant = 'passenger' }) {
  if (variant === 'rider') {
    return (
      <svg viewBox="0 0 340 220" className="block w-full">
        <path d="M0 55 H340 M0 120 H340 M0 180 H340" className="stroke-line dark:stroke-line-dark" strokeWidth="10" />
        <path d="M60 0 V220 M170 0 V220 M260 0 V220" className="stroke-line dark:stroke-line-dark" strokeWidth="10" />
        <rect x="76" y="70" width="80" height="40" rx="6" className="fill-surface-2 dark:fill-surface-2-dark" />
        <rect x="186" y="70" width="60" height="40" rx="6" className="fill-surface-2 dark:fill-surface-2-dark" />
        <text x="170" y="16" textAnchor="middle" className="fill-ink-faint dark:fill-ink-faint-dark" fontSize="10" fontFamily="'IBM Plex Mono', monospace">
          GATE 2 ZONE
        </text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 340 260" className="block w-full">
      <path d="M0 60 H340 M0 140 H340 M0 210 H340" className="stroke-line dark:stroke-line-dark" strokeWidth="10" />
      <path d="M70 0 V260 M180 0 V260 M270 0 V260" className="stroke-line dark:stroke-line-dark" strokeWidth="10" />
      <rect x="86" y="76" width="70" height="48" rx="6" className="fill-surface-2 dark:fill-surface-2-dark" />
      <rect x="196" y="76" width="58" height="48" rx="6" className="fill-surface-2 dark:fill-surface-2-dark" />
      <rect x="86" y="156" width="70" height="40" rx="6" className="fill-surface-2 dark:fill-surface-2-dark" />
      <rect x="196" y="156" width="58" height="40" rx="6" className="fill-surface-2 dark:fill-surface-2-dark" />
      <text x="188" y="18" textAnchor="middle" className="fill-ink-faint dark:fill-ink-faint-dark" fontSize="10" fontFamily="'IBM Plex Mono', monospace">
        MILLENNIUM ESTATE
      </text>
    </svg>
  )
}
