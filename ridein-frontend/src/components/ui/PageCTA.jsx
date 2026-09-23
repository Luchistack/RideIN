import { Link } from 'react-router-dom'

// A small closing call-to-action for the standalone pages that used to be
// sections in the middle of one long scrolling homepage (How it works,
// Fares, Safety, For estates). On their own, each page would otherwise
// just dead-end after its one section -- this gives the reader a next
// step and cross-links the pages to each other instead of back to Home.
export default function PageCTA({ title, body, primaryLabel, primaryTo, secondaryLabel, secondaryTo }) {
  return (
    <section className="border-t border-line px-7 py-14 text-center dark:border-line-dark sm:py-16">
      <div className="mx-auto max-w-xl">
        <h2 className="text-[22px] font-extrabold normal-case">{title}</h2>
        {body && <p className="mt-2.5 text-ink-soft dark:text-ink-soft-dark">{body}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3.5">
          <Link
            to={primaryTo}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-[11px] text-sm font-bold text-white transition hover:bg-brand-deep active:scale-[0.97]"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && (
            <Link
              to={secondaryTo}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-transparent px-5 py-[11px] text-sm font-bold text-ink transition hover:border-ink-faint active:scale-[0.97] dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-faint-dark"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
