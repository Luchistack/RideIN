import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Logo from '../ui/Logo.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import Avatar from '../ui/Avatar.jsx'
import NotificationBell from '../notifications/NotificationBell.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#fares', label: 'Fares' },
  { href: '/#app', label: 'Open the app' },
  { href: '/#safety', label: 'Safety' },
  { href: '/#estates', label: 'For estates' },
]

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <div className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur dark:border-line-dark dark:bg-paper-dark/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-7 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <ul className="hidden gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-semibold text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
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
          {/* Rider and passenger get the identical set of account links —
              profile, dashboard, customer care, log out — nothing here
              differs by role beyond where each link actually takes them.
              An admin account gets none of this (just Dashboard + Log out,
              below), so there's nothing in the navbar that would ever hint
              an admin is logged in. */}
          {user && (user.role === 'rider' || user.role === 'passenger') && (
            <>
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
          {user && user.role === 'admin' && (
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
      </div>
    </div>
  )
}
