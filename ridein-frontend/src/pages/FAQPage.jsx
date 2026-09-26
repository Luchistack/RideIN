import FAQ from '../components/ui/FAQ.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'
import { HOW_IT_WORKS_FAQ, FARES_FAQ, SAFETY_FAQ, ESTATES_FAQ } from '../data/faq.js'

export default function FAQPage() {
  return (
    <>
      <div className="border-b border-line px-7 pb-8 pt-14 text-center dark:border-line-dark sm:pt-20">
        <span className="mb-2 block text-[12.5px] font-semibold uppercase tracking-wider text-brand dark:text-brand-light">
          FAQ
        </span>
        <h1 className="text-[26px] font-extrabold normal-case sm:text-[32px]">Everything in one place</h1>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft dark:text-ink-soft-dark">
          Every question from across the site, gathered here for quick reference.
        </p>
      </div>
      <FAQ kicker="How it works" title="Before you request your first ride" items={HOW_IT_WORKS_FAQ} />
      <FAQ kicker="Fares" title="How fares actually work" items={FARES_FAQ} />
      <FAQ kicker="Safety" title="How RideIN keeps every ride accountable" items={SAFETY_FAQ} />
      <FAQ kicker="For estates" title="Bringing RideIN to your estate" items={ESTATES_FAQ} />
      <PageCTA
        title="Ready to get started?"
        body="Sign up as a passenger and request your first ride in minutes."
        primaryLabel="Sign up"
        primaryTo="/signup"
        secondaryLabel="How it works"
        secondaryTo="/how-it-works"
      />
    </>
  )
}
