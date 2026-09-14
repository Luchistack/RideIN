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

// Flattens a ride's nested passenger/rider/requested_rider user objects
// through normalizeUser() (so pages can read ride.rider.plateNumber etc.,
// same convention as the top-level current user), and rewrites the
// snake_case ride fields to their camelCase page-facing names.
function normalizeRide(apiRide) {
  if (!apiRide) return null
  return {
    id: apiRide.id,
    status: apiRide.status,
    passenger: normalizeUser(apiRide.passenger),
    rider: normalizeUser(apiRide.rider),
    requestedRider: normalizeUser(apiRide.requested_rider),
    pickupLat: apiRide.pickup_lat != null ? Number(apiRide.pickup_lat) : null,
    pickupLng: apiRide.pickup_lng != null ? Number(apiRide.pickup_lng) : null,
    pickupAddress: apiRide.pickup_address || '',
    rideType: apiRide.ride_type || 'pickup',
    fare: apiRide.fare != null ? Number(apiRide.fare) : null,
    tipAmount: apiRide.tip_amount != null ? Number(apiRide.tip_amount) : 0,
    rating: apiRide.rating ?? null,
    passengerComment: apiRide.passenger_comment || '',
    riderRating: apiRide.rider_rating ?? null,
    riderComment: apiRide.rider_comment || '',
    requestedAt: apiRide.requested_at,
    acceptedAt: apiRide.accepted_at,
    completedAt: apiRide.completed_at,
    cancelledAt: apiRide.cancelled_at,
  }
}

function normalizeNearbyRider(apiRider) {
  return {
    id: apiRider.id,
    name: apiRider.name,
    phone: apiRider.phone,
    photo: apiRider.photo,
    estate: apiRider.estate,
    plateNumber: apiRider.plate_number,
    lat: Number(apiRider.lat),
    lng: Number(apiRider.lng),
    updatedAt: apiRider.updated_at,
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
      error: "Google sign-in isn't connected to the live backend yet, please use email + password.",
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

  // --- Rides (Book a ride) ------------------------------------------------
  // Real requests against apps.rides -- not the old homepage preview, which
  // never left the browser (simulated riders, localStorage location only).

  // pickup: {lat, lng, address}. requestedRiderId is optional -- pass a
  // specific rider's id (from listNearbyRiders()) to request them by name,
  // or omit it to broadcast to every approved rider nearby. rideType is
  // 'pickup' (default, shared/₦400) or 'chatter' (private/₦1500) -- the
  // server looks up the matching flat fare, it's never sent from here.
  async function requestRide({ pickupLat, pickupLng, pickupAddress, requestedRiderId, rideType } = {}) {
    const body = {
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      pickup_address: pickupAddress || '',
      ride_type: rideType || 'pickup',
    }
    if (requestedRiderId) body.requested_rider_id = requestedRiderId
    const data = await api.post('/rides/request/', body)
    return normalizeRide(data)
  }

  async function getRide(rideId) {
    const data = await api.get(`/rides/${rideId}/`)
    return normalizeRide(data)
  }

  async function listMyRides() {
    const data = await api.get('/rides/mine/')
    return unwrapList(data).results.map(normalizeRide)
  }

  // Rider only: broadcast requests plus anything requested specifically for
  // this rider -- never a ride requested for someone else (the backend
  // filters that out at the query level, not just in the UI).
  async function listAvailableRides() {
    const data = await api.get('/rides/available/')
    return unwrapList(data).results.map(normalizeRide)
  }

  async function acceptRide(rideId) {
    const data = await api.post(`/rides/${rideId}/accept/`)
    return normalizeRide(data)
  }

  async function cancelRide(rideId) {
    const data = await api.post(`/rides/${rideId}/cancel/`)
    return normalizeRide(data)
  }

  async function completeRide(rideId, { rating, tipAmount, comment } = {}) {
    const body = {}
    if (rating != null) body.rating = rating
    if (tipAmount != null) body.tip_amount = tipAmount
    if (comment) body.comment = comment
    const data = await api.post(`/rides/${rideId}/complete/`, body)
    return normalizeRide(data)
  }

  // Rider only, and only once the ride is completed -- the mirror of the
  // rating the passenger leaves via completeRide(). One rating per ride.
  async function ratePassenger(rideId, { rating, comment } = {}) {
    const body = { rating }
    if (comment) body.comment = comment
    const data = await api.post(`/rides/${rideId}/rate-passenger/`, body)
    return normalizeRide(data)
  }

  // --- Locations (live GPS + "nearby riders") -----------------------------

  async function upsertMyLocation(lat, lng, accuracy) {
    const body = { lat, lng }
    if (accuracy != null) body.accuracy = accuracy
    await api.post('/locations/me/', body)
  }

  // Passenger only: approved, active riders who've shared a live location
  // in the last 15 minutes -- for the "choose a rider" step of booking.
  async function listNearbyRiders() {
    const data = await api.get('/locations/riders/')
    return unwrapList(data).results.map(normalizeNearbyRider)
  }

  // Rider only, and only while they have an active (accepted/enroute) ride
  // with that passenger -- enforced server-side too, not just by hiding
  // the button.
  async function getPassengerLocation(passengerId) {
    const data = await api.get(`/locations/${passengerId}/`)
    return { lat: Number(data.lat), lng: Number(data.lng), updatedAt: data.updated_at }
  }

  // --- Payments (bank transfer, admin-confirmed) --------------------------

  function normalizePayment(apiPayment) {
    if (!apiPayment) return null
    return {
      id: apiPayment.id,
      ride: typeof apiPayment.ride === 'object' ? normalizeRide(apiPayment.ride) : apiPayment.ride,
      amount: apiPayment.amount != null ? Number(apiPayment.amount) : null,
      tipAmount: apiPayment.tip_amount != null ? Number(apiPayment.tip_amount) : 0,
      tipRecipient: apiPayment.tip_recipient || 'rider',
      bankReference: apiPayment.bank_reference || '',
      status: apiPayment.status,
      submittedAt: apiPayment.submitted_at,
      confirmedAt: apiPayment.confirmed_at,
    }
  }

  // Passenger only: a single "I've paid" tap for one of their own rides.
  // amount defaults to the ride's fare and tipAmount to 0 server-side if
  // left out -- but the passenger can type in exactly what they sent (fare
  // + any transfer tip), and bankReference is optional on top of that.
  // tipRecipient is 'rider' (default) or 'app' -- who a nonzero tip is for.
  async function submitPayment(rideId, { amount, tipAmount, tipRecipient, bankReference } = {}) {
    const body = { ride: rideId }
    if (amount != null && amount !== '') body.amount = amount
    if (tipAmount != null && tipAmount !== '') body.tip_amount = tipAmount
    if (tipRecipient) body.tip_recipient = tipRecipient
    if (bankReference) body.bank_reference = bankReference
    const data = await api.post('/payments/submit/', body)
    return normalizePayment(data)
  }

  async function listMyPayments() {
    const data = await api.get('/payments/mine/')
    return unwrapList(data).results.map(normalizePayment)
  }

  // Admin only: every payment, newest first, with the ride (passenger/
  // rider/pickup) nested. Optional status filter: 'pending' | 'confirmed' | 'failed'.
  async function listAdminPayments(statusFilter) {
    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''
    const data = await api.get(`/payments/admin/${query}`)
    return unwrapList(data).results.map(normalizePayment)
  }

  // Admin only. status: 'confirmed' | 'pending' | 'failed' (shown in the UI
  // as "Not paid").
  async function setPaymentStatus(paymentId, statusValue) {
    const data = await api.post(`/payments/${paymentId}/confirm/`, { status: statusValue })
    return normalizePayment(data)
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
        requestRide,
        getRide,
        listMyRides,
        listAvailableRides,
        acceptRide,
        cancelRide,
        completeRide,
        ratePassenger,
        upsertMyLocation,
        listNearbyRiders,
        getPassengerLocation,
        submitPayment,
        listMyPayments,
        listAdminPayments,
        setPaymentStatus,
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
