import { createContext, useContext, useEffect, useState } from 'react'
import { api, getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/api.js'

// This now talks to the real ridein-backend API (https://api.ridein.ng) via
// src/lib/api.js instead of localStorage. The public useAuth() interface is
// unchanged from the old mock version on purpose — every page that calls
// useAuth() keeps working, with the small per-page edits noted in the repo
// (password fields on Login/Signup, updatePhoto now takes a File).
//
// Known gaps vs. the old mock, because the live backend doesn't support
// these yet (flagging clearly rather than silently faking them):
//
// 1. isEmailTaken() is now a stub that always returns false. There's no
//    email-availability-check endpoint on the backend, so a duplicate email
//    is now only caught when signupPassenger/signupRider is actually
//    submitted (both signup pages already handle that failure by resetting
//    to step 1, so this degrades gracefully — it just can't warn you at
//    step 1 anymore before you fill out the rest of the form).
//
// 2. Rider signup fields guarantorName/guarantorPhone/guarantorAddress/
//    bankName/accountNumber/address/faceVerified are collected by the UI
//    but NOT stored by the backend — RiderSignupSerializer only persists
//    email/password/name/phone/estate/vehicle_plate. They're still sent
//    (harmless — DRF ignores unrecognized fields) but won't come back from
//    the API, so RiderProfilePage will show "—" for those until the
//    backend's RiderProfile model/serializer is extended to store them.
//
// 3. loginWithGoogleProfile() is now a stub that always fails. The backend
//    has no Google-credential-exchange endpoint (only email+password
//    signup/login) — Google sign-in needs a new backend endpoint before it
//    can work for real.
//
// 4. listAllUsers() currently only returns PENDING riders, because that's
//    the one list endpoint that exists (GET /auth/riders/pending/). There
//    is no "list every rider and passenger" admin endpoint yet, so
//    AdminDashboardPage's "All riders" / "All passengers" tables will be
//    incomplete (approved riders and all passengers won't show) until a
//    real admin listing endpoint is added on the backend.

const AuthContext = createContext(null)

// The backend nests rider-only fields under user.rider_profile (estate,
// vehicle_plate, verification_status) instead of flat top-level fields.
// This flattens them back onto the user object under their old mock names
// so existing pages (RiderDashboardPage, RiderProfilePage,
// AdminDashboardPage, Navbar, ...) don't all need to learn the nested shape.
function normalizeUser(apiUser) {
  if (!apiUser) return null
  const rp = apiUser.rider_profile
  return {
    ...apiUser,
    plateNumber: rp?.vehicle_plate || '',
    estate: rp?.estate || '',
    status: rp?.verification_status || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // On load, if there's a stored token, try to restore the session by
  // fetching /auth/me/ — this replaces the old "look up session id in
  // localStorage users list" restore.
  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      if (!getAccessToken() && !getRefreshToken()) {
        setReady(true)
        return
      }
      try {
        const me = await api.get('/auth/me/')
        if (!cancelled) setUser(normalizeUser(me))
      } catch {
        clearTokens()
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  function applyAuthResult(data) {
    setTokens({ access: data.access, refresh: data.refresh })
    const normalized = normalizeUser(data.user)
    setUser(normalized)
    return normalized
  }

  // See gap #1 above.
  function isEmailTaken() {
    return false
  }

  async function signupPassenger(data) {
    try {
      const result = await api.post('/auth/signup/passenger/', {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone || '',
      })
      return { ok: true, user: applyAuthResult(result) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  async function signupRider(data) {
    try {
      const result = await api.post('/auth/signup/rider/', {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone || '',
        estate: data.estate || '',
        vehicle_plate: data.plateNumber || '',
      })
      return { ok: true, user: applyAuthResult(result) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  async function login(email, password) {
    try {
      const result = await api.post('/auth/login/', { email, password }, { auth: false })
      return { ok: true, user: applyAuthResult(result) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  // See gap #3 above.
  function loginWithGoogleProfile() {
    return {
      ok: false,
      isNew: false,
      error: "Google sign-in isn't connected to the live backend yet — please use email + password.",
    }
  }

  async function logout() {
    const refresh = getRefreshToken()
    try {
      if (refresh) await api.post('/auth/logout/', { refresh })
    } catch {
      // Even if blacklisting server-side fails (e.g. token already expired
      // or already blacklisted), still clear local state below so the user
      // ends up logged out client-side either way.
    }
    clearTokens()
    setUser(null)
  }

  // Takes a real File now, not a base64 data URL — PassengerProfilePage and
  // RiderProfilePage pass the File straight from <input type="file">
  // onChange, since the backend's photo field is a real multipart upload
  // (an ImageField), not a JSON string.
  async function updatePhoto(file) {
    if (!file || !user) return
    const formData = new FormData()
    formData.append('photo', file)
    await api.patch('/auth/me/photo/', formData, { isFormData: true })
    // /auth/me/photo/ only returns the photo field, so refetch the full
    // profile rather than hand-merging a partial response.
    const me = await api.get('/auth/me/')
    setUser(normalizeUser(me))
  }

  // Admin-only. verification_status is updated for real now — see gap #4
  // above for the caveat on the list this reads from.
  async function approveRider(riderId) {
    await api.post(`/auth/riders/${riderId}/approve/`, { verification_status: 'approved' })
  }

  // See gap #4 above: currently pending-riders-only, since that's the one
  // admin list endpoint that exists on the backend today.
  async function listAllUsers() {
    try {
      const pending = await api.get('/auth/riders/pending/')
      const results = Array.isArray(pending) ? pending : pending?.results || []
      return results.map(normalizeUser)
    } catch {
      return []
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        signupPassenger,
        signupRider,
        isEmailTaken,
        login,
        loginWithGoogleProfile,
        logout,
        updatePhoto,
        approveRider,
        listAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
