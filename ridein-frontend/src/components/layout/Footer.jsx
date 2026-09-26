import Logo from '../ui/Logo.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-line dark:border-line-dark">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-7 py-5 text-center sm:flex-row sm:flex-wrap sm:gap-4 sm:py-9 sm:text-left">
        <Logo small />
        <p className="text-[13px] text-ink-faint dark:text-ink-faint-dark">
          Millennium Estate Terminal · A ride management system for estates, one estate at a time.
        </p>
        <p className="font-mono text-[13px] text-ink-faint dark:text-ink-faint-dark">© 2026 RideIN</p>
      </div>
    </footer>
  )
}
