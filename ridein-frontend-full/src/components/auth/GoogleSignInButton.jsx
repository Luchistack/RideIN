import { useEffect, useRef, useState } from 'react'
import { loadScript } from '../../lib/loadScript.js'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function decodeJwt(token) {
  const payload = token.split('.')[1]
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(normalized))
}

// A real "Continue with Google" button using Google Identity Services — not
// a mock. It needs your own OAuth Client ID (see .env.example) to render;
// without one it shows a clearly-labeled disabled state instead of a fake
// button, so it's obvious what's missing rather than silently doing nothing.
//
// Note on trust: this decodes the returned identity token client-side to
// read the name/email straight in the browser, which is enough for this
// frontend-only demo. A real backend should verify that token server-side
// (Google's tokeninfo endpoint or a server-side client library) before
// trusting it — never take a client-decoded token as proof of identity in
// production.
export default function GoogleSignInButton({ onCredential, text = 'signup_with' }) {
  const containerRef = useRef(null)
  const [scriptError, setScriptError] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return
    let cancelled = false

    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            try {
              const profile = decodeJwt(response.credential)
              onCredential({ name: profile.name, email: profile.email, picture: profile.picture })
            } catch {
              setScriptError(true)
            }
          },
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 320,
          text,
        })
      })
      .catch(() => setScriptError(true))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!CLIENT_ID) {
    return (
      <div className="rounded-full border border-dashed border-line px-4 py-3 text-center text-[12.5px] font-medium text-ink-faint dark:border-line-dark dark:text-ink-faint-dark">
        Google sign-in needs <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> set (see .env.example)
      </div>
    )
  }

  if (scriptError) {
    return (
      <div className="rounded-full border border-dashed border-danger/50 px-4 py-3 text-center text-[12.5px] font-medium text-danger dark:text-danger-dark">
        Couldn't load Google sign-in. Check your client ID and authorized origins.
      </div>
    )
  }

  return <div ref={containerRef} className="flex justify-center" />
}
