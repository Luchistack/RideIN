import Logo from '../ui/Logo.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-line dark:border-line-dark">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-7 py-9">
        <Logo small />
        <p className="text-[13px] text-ink-faint dark:text-ink-faint-dark">
          Millennium Estate Terminal · A ride management system for estates, one estate at a time.
        </p>
        <p className="font-mono text-[13px] text-ink-faint dark:text-ink-faint-dark">© 2026 RideIN</p>
      </div>
    </footer>
  )
}
