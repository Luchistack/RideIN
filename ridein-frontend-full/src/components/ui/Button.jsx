const SIZES = {
  md: 'px-5 py-[11px] text-sm',
  sm: 'px-3.5 py-2 text-[13px]',
}

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-deep',
  ghost:
    'bg-transparent text-ink border border-line hover:border-ink-faint dark:text-ink-dark dark:border-line-dark dark:hover:border-ink-faint-dark',
}

export default function Button({ as: As = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide transition active:scale-[0.97] ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}
