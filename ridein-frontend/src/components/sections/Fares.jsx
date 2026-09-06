import SectionHead from '../ui/SectionHead.jsx'
import { FARES, formatNaira } from '../../data/fares.js'

export default function Fares() {
  return (
    <section id="fares" className="px-7 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="Transparent fares"
          title="One price. Always shown before you ride."
          lede="RideIN doesn't mark up the rider's fare — it adds one visible service fee on top, so riders always get their full rate."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {Object.values(FARES).map((fare) => (
            <FareCard key={fare.key} fare={fare} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FareCard({ fare }) {
  const isChatter = fare.key === 'chatter'
  return (
    <div
      className={`rounded-2xl border bg-surface p-7 shadow-soft dark:bg-surface-dark ${
        isChatter ? 'border-accent' : 'border-line dark:border-line-dark'
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <span className="text-xl font-bold normal-case">{fare.label}</span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isChatter
              ? 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light'
              : 'bg-surface-2 text-ink-soft dark:bg-surface-2-dark dark:text-ink-soft-dark'
          }`}
        >
          {fare.badge}
        </span>
      </div>
      <p className="mb-5 text-[14.5px] text-ink-soft dark:text-ink-soft-dark">{fare.description}</p>
      <div className="flex flex-col gap-2.5 border-t border-line pt-4 dark:border-line-dark">
        <Line label="Rider's fare" value={formatNaira(fare.riderFare)} />
        <Line label="RideIN service fee" value={formatNaira(fare.serviceFee)} />
      </div>
      <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-line pt-3.5 dark:border-line-dark">
        <span className="font-bold">You pay</span>
        <span className="font-mono text-2xl font-semibold tabular-nums text-brand dark:text-brand-light">
          {formatNaira(fare.total)}
        </span>
      </div>
      <div className="mt-4 flex gap-1.5 text-[12.5px] text-ink-faint dark:text-ink-faint-dark">
        <span>💬</span>
        <span>Paid from your wallet · {formatNaira(fare.riderFare)} remitted to the rider daily</span>
      </div>
    </div>
  )
}

function Line({ label, value }) {
  return (
    <div className="flex justify-between text-[14.5px]">
      <span className="text-ink-soft dark:text-ink-soft-dark">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  )
}
