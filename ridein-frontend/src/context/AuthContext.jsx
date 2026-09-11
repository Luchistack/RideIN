import { createContext, useContext, useEffect, useState } from 'react'
import { api, downloadFile, getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/api.js'

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
// 4. (Resolved) listAllUsers()/listPendingRiders() are kept for backward
//    compatibility, but AdminDashboardPage now uses listAdminRiders() /
//    listAdminPassengers() instead — real admin search+list endpoints that
//    return every rider/passenger, with q/month/date_from/date_to filters,
//    not just pending riders.
//
// This file also now exposes: declineRider/appealDecline (decline+appeal),
// setAccountStatus/deleteAccount (suspend/block/reactivate + delete, usable
// on any passenger or rider account), downloadUserPdf (admin on-demand PDF
// export), the notification-bell functions (listNotifications,
// unreadNotificationCount, markNotificationRead, markAllNotificationsRead),
// and the real support-thread functions used by SupportPage and the admin
// dashboard's Support tab (replacing the old localStorage-only
// supportStore.js, which never left the browser it was created in).

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
    appealRequested: rp?.appeal_requested || false,
    appealRequestedAt: rp?.appeal_requested_at || null,
    accountStatus: apiUser.account_status || 'active',
  }
}

// GET list endpoints that paginate (apps.core.pagination.StandardResultsSetPagination)
// return {count, next, previous, results}. Some non-paginated ones return a
// plain array. This normalizes either shape to a plain array + count.
function unwrapList(data) {
  if (Array.isArray(data)) return { results: data, count: data.length }
  return { results: data?.results || [], count: data?.count ?? (data?.results || []).length }
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

  // Admin-only. verification_status is one of 'approved' | 'declined' |
  // 'pending_review'. Declining does NOT delete the account -- it stays on
  // record with status=declined; a separate deleteUser() call is needed to
  // actually remove it.
  async function setRiderVerification(riderId, verificationStatus) {
    await api.post(`/auth/riders/${riderId}/approve/`, { verification_status: verificationStatus })
  }
  async function approveRider(riderId) {
    return setRiderVerification(riderId, 'approved')
  }
  async function declineRider(riderId) {
    return setRiderVerification(riderId, 'declined')
  }

  // Rider-only, self-service. Appeals their OWN declined application. Does
  // NOT reprocess anything automatically -- it just flags the profile so an
  // admin can see it and reach out personally.
  async function appealDecline() {
    const result = await api.post('/auth/riders/appeal/')
    setUser(normalizeUser(result))
  }

  // See gap #4 above, now resolved: real admin listing endpoints exist.
  // `params` is a plain object of query params: {q, month, date_from,
  // date_to, status}.
  async function listPendingRiders() {
    try {
      const pending = await api.get('/auth/riders/pending/')
      return unwrapList(pending).results.map(normalizeUser)
    } catch {
      return []
    }
  }

  function toQuery(params = {}) {
    const usp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') usp.set(k, v)
    })
    const qs = usp.toString()
    return qs ? `?${qs}` : ''
  }

  async function listAdminPassengers(params = {}) {
    const data = await api.get(`/auth/admin/passengers/${toQuery(params)}`)
    const { results, count } = unwrapList(data)
    return { users: results.map(normalizeUser), count }
  }

  async function listAdminRiders(params = {}) {
    const data = await api.get(`/auth/admin/riders/${toQuery(params)}`)
    const { results, count } = unwrapList(data)
    return { users: results.map(normalizeUser), count }
  }

  // Kept for the pages that just want "every user" without the admin
  // search UI (none currently do, but this keeps the old call site working
  // if referenced). Prefer listAdminPassengers/listAdminRiders + search for
  // the real admin dashboard.
  async function listAllUsers() {
    const pending = await listPendingRiders()
    return pending
  }

  // Admin-only. Permanently deletes a passenger or rider account. This is a
  // separate, explicit action from declining -- declining keeps the record.
  async function deleteAccount(userId) {
    await api.delete(`/auth/admin/users/${userId}/`)
  }

  // Admin-only. status is 'active' | 'suspended' | 'blocked'. Works on any
  // passenger or rider account, approved or not.
  async function setAccountStatus(userId, status) {
    await api.post(`/auth/admin/users/${userId}/status/`, { account_status: status })
  }

  // Admin-only. Builds and downloads a PDF on-demand from that user's
  // currently stored registration details.
  async function downloadUserPdf(userId, suggestedName) {
    await downloadFile(`/auth/admin/users/${userId}/pdf/`, suggestedName || 'ridein-applicant.pdf')
  }

  // Admin-only. There's no self-service "forgot password" flow (no email
  // backend) -- an admin sets a new password directly here and relays it to
  // the user themselves. Also logs out every session that user currently
  // has (see the backend's AdminResetPasswordView).
  async function resetUserPassword(userId, newPassword) {
    await api.post(`/auth/admin/users/${userId}/reset-password/`, { new_password: newPassword })
  }

  // Self-service: lets the logged-in user pick their own new password,
  // e.g. right after an admin reset it for them to something temporary.
  // Requires the current password to confirm identity.
  async function changePassword(currentPassword, newPassword) {
    await api.post('/auth/me/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  // --- Notifications (bell) ---------------------------------------------
  async function listNotifications() {
    const data = await api.get('/notifications/mine/')
    return unwrapList(data).results
  }
  async function unreadNotificationCount() {
    try {
      const data = await api.get('/notifications/unread-count/')
      return data?.count || 0
    } catch {
      return 0
    }
  }
  async function markNotificationRead(id) {
    await api.post(`/notifications/${id}/mark-read/`)
  }
  async function markAllNotificationsRead() {
    await api.post('/notifications/mark-all-read/')
  }

  // --- Support (real backend threads, shared between the rider/passenger
  // chat view and the admin inbox -- replaces the old localStorage-only
  // supportStore.js, which never left the browser it was created in) ------
  async function getMySupportThread() {
    return api.get('/support/mine/')
  }
  async function postMySupportMessage(body) {
    return api.post('/support/mine/messages/', { body })
  }
  async function listAdminThreads(params = {}) {
    const data = await api.get(`/support/admin/threads/${toQuery(params)}`)
    return unwrapList(data)
  }
  async function getAdminThread(threadId) {
    return api.get(`/support/admin/threads/${threadId}/`)
  }
  async function postAdminReply(threadId, body) {
    return api.post(`/support/admin/threads/${threadId}/reply/`, { body })
  }
  async function markAdminThreadRead(threadId) {
    return api.post(`/support/admin/threads/${threadId}/mark-read/`)
  }
  async function deleteAdminThread(threadId) {
    await api.delete(`/support/admin/threads/${threadId}/delete/`)
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
        declineRider,
        appealDecline,
        listAllUsers,
        listPendingRiders,
        listAdminPassengers,
        listAdminRiders,
        deleteAccount,
        setAccountStatus,
        downloadUserPdf,
        resetUserPassword,
        changePassword,
        listNotifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        getMySupportThread,
        postMySupportMessage,
        listAdminThreads,
        getAdminThread,
        postAdminReply,
        markAdminThreadRead,
        deleteAdminThread,
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
