export default function FormField({ id, label, hint, as: As = 'input', children, ...inputProps }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-ink-soft dark:text-ink-soft-dark">
        {label}
      </label>
      <As
        id={id}
        className="w-full rounded-[9px] border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
        {...inputProps}
      >
        {children}
      </As>
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-faint dark:text-ink-faint-dark">{hint}</p>}
    </div>
  )
}
