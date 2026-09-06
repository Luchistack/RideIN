import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Logo from '../ui/Logo.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
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
        <div className="flex items-center gap-2.5">
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
          {user && user.role === 'rider' && (
            <>
              <Button as={Link} to="/dashboard" variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button variant="primary" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          )}
          {user && user.role === 'passenger' && (
            <>
              <span className="hidden text-[13px] font-semibold text-ink-soft dark:text-ink-soft-dark sm:inline">
                Hi, {user.name.split(' ')[0]}
              </span>
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
