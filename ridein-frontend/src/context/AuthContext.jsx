import { createContext, useContext, useEffect, useState } from 'react'

// There is no backend yet, so "accounts" are stored in the browser
// (localStorage) rather than a real database. This is enough to demo the
// full signup → login → dashboard flow end to end, but it is NOT real
// auth: anyone can open devtools and edit these records, passwords aren't
// collected or checked, and nothing here is shared between devices or
// browsers. Replace this whole file with real API calls to your backend
// (and drop the localStorage persistence) once one exists — every place
// that calls useAuth() would keep working unchanged, since they only see
// { user, signupPassenger, signupRider, login, logout }.
const USERS_KEY = 'ridein-users'
const SESSION_KEY = 'ridein-session-id'

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
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

  function signupPassenger(data) {
    const newUser = {
      id: makeId(),
      role: 'passenger',
      name: data.name,
      email: data.email,
      authMethod: data.authMethod || 'email',
      walletBalance: data.walletTopUp || 0,
      createdAt: new Date().toISOString(),
    }
    const users = readUsers()
    writeUsers([...users, newUser])
    persistSession(newUser)
    return newUser
  }

  function signupRider(data) {
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
      createdAt: new Date().toISOString(),
    }
    const users = readUsers()
    writeUsers([...users, newUser])
    persistSession(newUser)
    return newUser
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

  return (
    <AuthContext.Provider
      value={{ user, ready, signupPassenger, signupRider, login, loginWithGoogleProfile, logout }}
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
