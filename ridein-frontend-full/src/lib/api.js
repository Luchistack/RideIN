// Thin fetch wrapper for the real ridein-backend API (see
// src/context/AuthContext.jsx for how it's used). Base URL comes from
// VITE_API_BASE_URL (see .env.example) — e.g.
//   dev:  http://localhost:8000/api/v1
//   prod: https://api.ridein.ng/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const ACCESS_KEY = 'ridein-access-token'
const REFRESH_KEY = 'ridein-refresh-token'

// NOTE on where tokens live: the backend's LoginSerializer/SignupSerializer
// return {access, refresh} directly in the JSON body (not an HttpOnly
// cookie), so there's nowhere else to put the refresh token but client-side
// storage. localStorage is used here to keep the user logged in across page
// reloads/tabs. This is a known tradeoff (an XSS bug in the frontend could
// steal a long-lived refresh token) — the architecture plan's original
// recommendation was an HttpOnly cookie for the refresh token, which would
// need a backend change (the login view setting a Set-Cookie header) to do
// properly. Fine for getting the real flow working end-to-end now.

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}
export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return null
  try {
    const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) {
      clearTokens()
      return null
    }
    const data = await res.json()
    setTokens({ access: data.access })
    return data.access
  } catch {
    return null
  }
}

// DRF error bodies vary by view: {"detail": "..."} for most APIView errors,
// {"field": ["msg", ...]} for serializer validation errors. This picks a
// single readable string out of either shape for display in a form.
function extractErrorMessage(data) {
  if (!data) return 'Something went wrong. Please try again.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  const firstKey = Object.keys(data)[0]
  const firstVal = data?.[firstKey]
  if (Array.isArray(firstVal)) return firstVal[0]
  if (typeof firstVal === 'string') return firstVal
  return 'Something went wrong. Please try again.'
}

/**
 * Core request helper.
 * - `body`: plain object (sent as JSON) or a FormData instance (sent as
 *   multipart — used for the photo upload; Content-Type is left for the
 *   browser to set so it includes the correct multipart boundary).
 * - `auth`: attach the current access token (default true). Pass false for
 *   endpoints that must be reachable while logged out (signup, login).
 * - On a 401 with a refresh token available, this retries exactly once
 *   after a silent token refresh, then gives up.
 */
async function request(path, { method = 'GET', body, isFormData = false, auth = true, _retried = false } = {}) {
  const headers = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth && !_retried && getRefreshToken()) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      return request(path, { method, body, isFormData, auth, _retried: true })
    }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const error = new Error(extractErrorMessage(data))
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body, ...opts }),
}

export { API_BASE_URL }
