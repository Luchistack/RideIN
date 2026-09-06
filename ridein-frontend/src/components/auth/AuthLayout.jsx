import { Link } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'

export default function AuthLayout({ title, subtitle, children, wide = false }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-14">
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
