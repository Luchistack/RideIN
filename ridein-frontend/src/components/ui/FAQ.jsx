export default function FAQ({ kicker = 'FAQ', title = 'Common questions', items }) {
  return (
    <section className="border-t border-line px-7 py-10 dark:border-line-dark sm:py-14">
      <div className="mx-auto max-w-3xl">
        <span className="mb-2 block text-center text-[12.5px] font-semibold uppercase tracking-wider text-brand dark:text-brand-light">
          {kicker}
        </span>
        <h2 className="mb-8 text-center text-[24px] font-extrabold normal-case sm:text-[28px]">{title}</h2>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-line bg-surface p-5 dark:border-line-dark dark:bg-surface-dark"
            >
              <h3 className="mb-1.5 text-[15.5px] font-bold normal-case">{item.q}</h3>
              <p className="text-[14px] text-ink-soft dark:text-ink-soft-dark">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
