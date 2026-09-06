// Loads an external <script> tag once and caches the in-flight promise, so
// calling this twice for the same URL (e.g. two components both wanting
// Google Maps) only ever inserts one <script> tag and both callers await the
// same load.
const cache = new Map()

export function loadScript(src) {
  if (cache.has(src)) return cache.get(src)

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)))
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })

  cache.set(src, promise)
  return promise
}
