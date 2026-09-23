import { useEffect, useRef } from 'react'

// Backs the navbar's "Open the app" action. Chromium browsers fire
// beforeinstallprompt once the PWA install criteria are met -- capture it
// early (this hook is mounted from Navbar, which is always on screen) so
// it's ready the moment someone actually clicks the link. Everywhere that
// event doesn't fire (iOS Safari, desktop browsers that don't support it,
// or it's already been used/dismissed this session) just falls back to the
// APK download, which always works.
export function useInstallPrompt() {
  const deferredPromptRef = useRef(null)

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      e.preventDefault()
      deferredPromptRef.current = e
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  async function openApp() {
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (isStandalone) return // already running as the installed app -- nothing to do

    if (deferredPromptRef.current) {
      const promptEvent = deferredPromptRef.current
      deferredPromptRef.current = null
      promptEvent.prompt()
      try {
        await promptEvent.userChoice
      } catch {
        // ignore -- user dismissed it, nothing more to do either way
      }
      return
    }

    window.location.href = '/app/ridein.apk'
  }

  return { openApp }
}
