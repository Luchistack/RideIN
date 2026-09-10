export default function SectionHead({ kicker, title, lede }) {
  return (
    <div className="mx-auto mb-11 max-w-xl text-center">
      <span className="mb-2.5 block text-[12.5px] font-bold uppercase tracking-widest text-accent-deep dark:text-accent-light">
        {kicker}
      </span>
      <h2 className="text-[28px] font-extrabold sm:text-[34px] lg:text-[40px]">{title}</h2>
      {lede && <p className="mt-3.5 text-base text-ink-soft dark:text-ink-soft-dark">{lede}</p>}
    </div>
  )
}
