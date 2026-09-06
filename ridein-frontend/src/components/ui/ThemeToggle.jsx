import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ridein-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// A light/dark switch. The page already avoids a flash-of-wrong-theme on load
// via the inline script in index.html — this component just takes over from
// there, keeps <html class="dark"> and localStorage in sync, and renders the
// button. Tailwind's `dark:` classes throughout the app respond automatically
// once darkMode: 'class' is set in tailwind.config.js.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light background' : 'Switch to dark background'}
      aria-pressed={isDark}
      className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-ink-faint hover:text-ink dark:border-line-dark dark:text-ink-soft-dark dark:hover:border-ink-faint-dark dark:hover:text-ink-dark"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
          <path
            d="M20 14.2A8.5 8.5 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
