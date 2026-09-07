import { createContext, useContext, useEffect, useState } from 'react'

// There is no backend yet, so "accounts" are stored in the browser
// (localStorage) rather than a real database. This is enough to demo the
// full signup → login → dashboard flow end to end, but it is NOT real
// auth: anyone can open devtools and edit these records, passwords aren't
// collected or checked, and nothing here is shared between devices or
// browsers. Replace this whole file with real API calls to your backend
// (and drop the localStorage persistence) once one exists — every place
// that calls useAuth() would keep working unchanged, since they only see
// { user, signupPassenger, signupRider, login, logout, ... }.
const USERS_KEY = 'ridein-users'
const SESSION_KEY = 'ridein-session-id'

// --- Admin, without a public signup page ---------------------------------
// There is deliberately no "sign up as admin" option anywhere in the UI —
// the login page is the same single "Log in" form everyone uses, and
// nothing in the app hints that an admin role exists. To make the demo
// usable, this file quietly seeds one demo admin account into the same
// localStorage users list the first time the app loads, if one isn't
// already there. Log in as the estate operator by typing this email on the
// normal /login page — nothing about the login form or the navbar changes
// for anyone else. Replace this with real backend-issued admin accounts
// (created by whoever runs RideIN, never self-served) once there's a
// backend — delete this seeding block at that point.
const ADMIN_EMAIL = 'admin@ridein.app'
const ADMIN_NAME = 'RideIN Admin'

const AuthContext = createContext(null)

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function makeId() {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function ensureAdminSeeded() {
  const users = readUsers()
  if (users.some((u) => u.role === 'admin')) return
  const admin = {
    id: makeId(),
    role: 'admin',
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    authMethod: 'email',
    createdAt: new Date().toISOString(),
  }
  writeUsers([...users, admin])
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureAdminSeeded()
    const sessionId = localStorage.getItem(SESSION_KEY)
    if (sessionId) {
      const found = readUsers().find((u) => u.id === sessionId)
      if (found) setUser(found)
    }
    setReady(true)
  }, [])

  function persistSession(newUser) {
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, newUser.id)
  }

  // An email must resolve to exactly one account. Without this check, the
  // same email could be used to sign up as both a passenger and a rider,
  // and login(email) — which only ever returns the FIRST matching user —
  // would then silently log that person into whichever role was created
  // first, regardless of which role they meant to use. Enforcing uniqueness
  // at signup is what makes plain email lookup in login() safe.
  function emailTaken(email) {
    return readUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())
  }

  // Exposed so multi-step signup forms (the rider application in
  // particular) can catch a duplicate email right at step 1 instead of
  // making someone fill out the whole form before finding out.
  function isEmailTaken(email) {
    return emailTaken(email)
  }

  function signupPassenger(data) {
    if (emailTaken(data.email)) {
      return { ok: false, error: 'An account with this email already exists. Try logging in instead.' }
    }
    const newUser = {
      id: makeId(),
      role: 'passenger',
      name: data.name,
      email: data.email,
      authMethod: data.authMethod || 'email',
      photo: null, // set later from the passenger's own profile page
      createdAt: new Date().toISOString(),
    }
    const users = readUsers()
    writeUsers([...users, newUser])
    persistSession(newUser)
    return { ok: true, user: newUser }
  }

  function signupRider(data) {
    if (emailTaken(data.email)) {
      return { ok: false, error: 'An account with this email already exists. Try logging in instead.' }
    }
    const newUser = {
      id: makeId(),
      role: 'rider',
      name: data.name,
      email: data.email,
      authMethod: data.authMethod || 'email',
      plateNumber: data.plateNumber,
      estate: data.estate,
      address: data.address,
      phone: data.phone,
      guarantorName: data.guarantorName,
      guarantorPhone: data.guarantorPhone,
      guarantorAddress: data.guarantorAddress,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      faceVerified: Boolean(data.faceVerified),
      status: 'pending_review', // a real backend would flip this once staff verify the details
      photo: null, // set later from the rider's own profile page
      createdAt: new Date().toISOString(),
    }
    const users = readUsers()
    writeUsers([...users, newUser])
    persistSession(newUser)
    return { ok: true, user: newUser }
  }

  function login(email) {
    const found = readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return { ok: false, error: 'No account found with that email. Try signing up instead.' }
    persistSession(found)
    return { ok: true, user: found }
  }

  function loginWithGoogleProfile(profile) {
    const users = readUsers()
    const existing = users.find((u) => u.email.toLowerCase() === profile.email.toLowerCase())
    if (existing) {
      persistSession(existing)
      return { ok: true, user: existing, isNew: false }
    }
    return { ok: false, isNew: true }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  // The ONLY field a rider or passenger can ever change about their own
  // account from their profile page — everything else they filled in at
  // signup (name, email, address, plate number, guarantor details, bank
  // details, etc.) is locked, by design. If those details are wrong, that's
  // a support/estate-management conversation, not a self-service edit.
  function updatePhoto(dataUrl) {
    if (!user) return
    const users = readUsers().map((u) => (u.id === user.id ? { ...u, photo: dataUrl } : u))
    writeUsers(users)
    const updated = users.find((u) => u.id === user.id)
    setUser(updated)
  }

  // Admin-only: flips a rider's account out of "pending review" once
  // estate management has confirmed their details. There is no reject/
  // delete here on purpose — this demo only models the one action an
  // operator actually needs day to day.
  function approveRider(riderId) {
    const users = readUsers().map((u) => (u.id === riderId && u.role === 'rider' ? { ...u, status: 'approved' } : u))
    writeUsers(users)
  }

  // Admin-only: a read view of every account, for the admin dashboard.
  // A real backend would paginate/filter this server-side and never send
  // the full list to the client.
  function listAllUsers() {
    return readUsers()
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
