import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Logo from '../ui/Logo.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import Avatar from '../ui/Avatar.jsx'
import NotificationBell from '../notifications/NotificationBell.jsx'
import SupportRideInButton from './SupportRideInButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useInstallPrompt } from '../../hooks/useInstallPrompt.js'

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/fares', label: 'Fares' },
  { action: 'open-app', label: 'Open the app' },
  { to: '/safety', label: 'Safety' },
  { to: '/for-estates', label: 'For estates' },
  { to: '/faq', label: 'FAQ' },
]

function MenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function NavLinks({ className, onLinkClass, openApp }) {
  return (
    <ul className={className}>
      {LINKS.map((link) => (
        <li key={link.label}>
          {link.action === 'open-app' ? (
            <button type="button" onClick={openApp} className={onLinkClass}>
              {link.label}
            </button>
          ) : (
            <Link to={link.to} className={onLinkClass}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { openApp } = useInstallPrompt()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Whatever page the person navigates to, the mobile menu should never be
  // left open behind it — this is the one thing an onClick handler on
  // every single link would otherwise have to remember to do.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  const isAccountUser = user && (user.role === 'rider' || user.role === 'passenger')
  const isAdmin = user && user.role === 'admin'

  return (
    <div className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur dark:border-line-dark dark:bg-paper-dark/90">
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-6 px-4 py-3.5 sm:px-7 sm:py-4 lg:px-10 xl:px-14">
        <Link to="/" className="flex-none">
          <Logo />
        </Link>

        {/* Full nav — only shown once there's genuinely enough width for
            every link plus every account action in one row. Below that,
            it collapses to the hamburger panel instead of wrapping/overflowing.
            A logged-in account bar has a lot more buttons than a guest one
            (Support RideIN, notifications, avatar, Dashboard, Support, Book a
            ride, Log out), so it needs a wider screen before it's safe to show
            inline — that's why the breakpoint differs by login state instead
            of using one fixed value that would overflow for one case or the
            other. */}
        <NavLinks
          className={!user ? 'hidden flex-1 justify-center gap-10 lg:flex' : 'hidden flex-1 justify-center gap-10 2xl:flex'}
          onLinkClass="whitespace-nowrap text-sm font-semibold text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
          openApp={openApp}
        />

        <div className={!user ? 'hidden flex-none items-center gap-3 lg:flex' : 'hidden flex-none items-center gap-3 2xl:flex'}>
          <ThemeToggle />
          {!user && (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/signup" variant="primary" size="sm">
                Sign up
              </Button>
            </>
          )}
          {isAccountUser && (
            <>
              <SupportRideInButton />
              <NotificationBell />
              <Link to="/profile" className="flex items-center" aria-label="Your profile">
                <Avatar name={user.name} photo={user.photo} size={30} tone={user.role === 'rider' ? 'accent' : 'brand'} />
              </Link>
              <Button as={Link} to="/dashboard" variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button as={Link} to="/support" variant="ghost" size="sm">
                Support
              </Button>
              {user.role === 'passenger' && (
                <Button as={Link} to="/book-ride" variant="primary" size="sm">
                  Book a ride
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          )}
          {isAdmin && (
            <>
              <NotificationBell />
              <Button as={Link} to="/dashboard" variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button variant="primary" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          )}
        </div>

        {/* Condensed bar: below the breakpoint above, this shows instead — a
            couple of always-relevant icons plus one hamburger, so it never
            has to wrap no matter how many account buttons exist. */}
        <div className={!user ? 'flex flex-none items-center gap-1.5 lg:hidden' : 'flex flex-none items-center gap-1.5 2xl:hidden'}>
          <ThemeToggle />
          {(isAccountUser || isAdmin) && <NotificationBell />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line text-ink hover:border-ink-faint dark:border-line-dark dark:text-ink-dark dark:hover:border-ink-faint-dark"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={
            !user
              ? 'max-h-[calc(100vh-64px)] overflow-y-auto border-t border-line bg-paper px-4 py-4 dark:border-line-dark dark:bg-paper-dark lg:hidden'
              : 'max-h-[calc(100vh-64px)] overflow-y-auto border-t border-line bg-paper px-4 py-4 dark:border-line-dark dark:bg-paper-dark 2xl:hidden'
          }
        >
          <NavLinks
            className="mb-4 flex flex-col gap-1"
            onLinkClass="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-ink-soft-dark dark:hover:bg-surface-2-dark dark:hover:text-ink-dark"
            openApp={openApp}
          />

          <div className="flex flex-col gap-2 border-t border-line pt-4 dark:border-line-dark">
            {!user && (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm" className="w-full">
                  Log in
                </Button>
                <Button as={Link} to="/signup" variant="primary" size="sm" className="w-full">
                  Sign up
                </Button>
              </>
            )}

            {isAccountUser && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2 dark:hover:bg-surface-2-dark"
                >
                  <Avatar name={user.name} photo={user.photo} size={32} tone={user.role === 'rider' ? 'accent' : 'brand'} />
                  <span className="text-sm font-bold">{user.name}</span>
                </Link>
                <div className="px-1">
                  <SupportRideInButton />
                </div>
                <Button as={Link} to="/dashboard" variant="ghost" size="sm" className="w-full">
                  Dashboard
                </Button>
                <Button as={Link} to="/support" variant="ghost" size="sm" className="w-full">
                  Support
                </Button>
                {user.role === 'passenger' && (
                  <Button as={Link} to="/book-ride" variant="primary" size="sm" className="w-full">
                    Book a ride
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={logout} className="w-full">
                  Log out
                </Button>
              </>
            )}

            {isAdmin && (
              <>
                <Button as={Link} to="/dashboard" variant="ghost" size="sm" className="w-full">
                  Dashboard
                </Button>
                <Button variant="primary" size="sm" onClick={logout} className="w-full">
                  Log out
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
