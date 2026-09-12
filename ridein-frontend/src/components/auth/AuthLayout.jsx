import { Link } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'

export default function AuthLayout({ title, subtitle, children, wide = false }) {
  return (
    // h-full fills whatever vertical space `main` actually has left (viewport
    // minus navbar minus footer — `main` gets a real, definite height from
    // its own flex-1 in App.jsx, which is what makes h-full here resolve to
    // something meaningful). This used to be a fixed `calc(100vh-73px)`
    // guess that only accounted for the navbar's height, not the footer's
    // too, so the page ended up taller than the viewport and pushed the
    // footer below the fold instead of pinning it to the bottom.
    //
    // Deliberately NOT `main { display: flex }` + `flex-1` here instead:
    // that would make every page's root element a flex item of `main`, and
    // any page whose content has an intrinsically wide element (a table, a
    // row of chips, anything that doesn't wrap) would force that flex item
    // wider than the viewport instead of shrinking to fit — the exact "page
    // shifted off to one side" bug this file's history is trying to avoid.
    <div className="flex h-full items-center justify-center px-6 py-14">
      <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="mb-7 flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-8 shadow-soft dark:border-line-dark dark:bg-surface-dark">
          <h1 className="mb-1.5 text-center text-2xl font-extrabold normal-case">{title}</h1>
          {subtitle && (
            <p className="mb-6 text-center text-[13.5px] text-ink-soft dark:text-ink-soft-dark">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
