import { useState } from 'react'
import { ESTATES } from '../../data/estates.js'

export default function EstateSignup() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Hook this up to your backend / form service — this preview just confirms locally.
    setSubmitted(true)
  }

  return (
    <section
      id="estates"
      className="border-y border-line bg-brand-tint px-7 py-16 dark:border-line-dark dark:bg-brand-tint-dark sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-brand dark:border-line-dark dark:bg-surface-dark dark:text-brand-light">
            <span className="h-1.5 w-1.5 rounded-full bg-brand dark:bg-brand-light" />
            Estate network
          </span>
          <h2 className="mb-3.5 font-display text-[28px] font-extrabold uppercase tracking-wide sm:text-4xl">
            One system, built to grow estate by estate
          </h2>
          <p className="max-w-[46ch] text-ink-soft dark:text-ink-soft-dark">
            RideIN started at Millennium Estate. Any estate can apply to bring their own keke riders onto the same
            system — their own riders, their own fares, one shared standard for safety and payment.
          </p>
          <div className="mt-6 flex flex-col gap-3.5">
            {ESTATES.map((estate) => (
              <div
                key={estate.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft dark:border-line-dark dark:bg-surface-dark"
              >
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-brand font-display text-base font-extrabold text-white">
                  {estate.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold">{estate.name}</div>
                  <div className="text-[12.5px] text-ink-faint dark:text-ink-faint-dark">{estate.meta}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 opacity-60 dark:border-line-dark dark:bg-surface-dark">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-surface-2 font-display text-base font-extrabold text-ink-faint dark:bg-surface-2-dark">
                ?
              </div>
              <div>
                <div className="font-bold">Your estate could be next</div>
                <div className="text-[12.5px] text-ink-faint dark:text-ink-faint-dark">Applications reviewed weekly</div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-surface p-7 shadow-soft dark:border-line-dark dark:bg-surface-dark"
        >
          <h3 className="mb-1.5 text-lg font-bold normal-case">Apply to bring RideIN to your estate</h3>
          <p className="mb-5 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
            Estate management fills this in once — we handle onboarding riders and residents after.
          </p>

          <Field id="estate-name" label="Estate name" placeholder="e.g. Parkview Estate" required />
          <Field id="estate-loc" label="Location / LGA" placeholder="e.g. Ikeja, Lagos" required />
          <Field id="estate-riders" label="Estimated number of keke riders" type="number" min="1" placeholder="e.g. 15" />
          <Field id="estate-contact" label="Contact email" type="email" placeholder="you@estate.com" required />

          <button
            type="submit"
            className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Submit application
          </button>
          {submitted && (
            <p className="mt-3 text-[12px] font-semibold text-good dark:text-good-dark">
              ✓ Received — this is a working preview, so nothing was sent yet. Wire this form up to your backend to
              go live.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

function Field({ id, label, ...inputProps }) {
  return (
    <div className="mb-3.5">
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft dark:text-ink-soft-dark">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-[9px] border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
        {...inputProps}
      />
    </div>
  )
}
