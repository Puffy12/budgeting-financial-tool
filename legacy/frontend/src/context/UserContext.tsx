import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { User, AuthenticatedUser } from '../types'
import { authApi, usersApi, setApiToken } from '../api'

const AUTH_TOKENS_KEY = 'auth_tokens'
const KNOWN_USERS_KEY = 'known_users'
const CACHED_USERS_KEY = 'cached_users'

export interface KnownUser {
  id: string
  name: string
  pin?: string
}

interface UserContextType {
  currentUser: User | null
  authenticatedUsers: AuthenticatedUser[]
  knownUsers: KnownUser[]
  loading: boolean
  error: string | null
  setCurrentUser: (user: User | null) => void
  login: (name: string, pin: string) => Promise<{ needsPin?: boolean; userId?: string; name?: string; user?: User }>
  signup: (name: string, pin: string) => Promise<User>
  setPin: (userId: string, pin: string) => Promise<User>
  logout: (userId?: string) => void
  switchUser: (userId: string) => void
  changePin: (currentPin: string, newPin: string) => Promise<User>
  deleteUser: (userId: string) => Promise<void>
  removeKnownUser: (userId: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

/**
 * Get stored tokens from localStorage
 */
function getStoredTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AUTH_TOKENS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Save tokens to localStorage
 */
function saveTokens(tokens: Record<string, string>) {
  localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens))
}

function getKnownUsers(): KnownUser[] {
  try {
    const raw = localStorage.getItem(KNOWN_USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveKnownUsers(users: KnownUser[]) {
  localStorage.setItem(KNOWN_USERS_KEY, JSON.stringify(users))
}

function addKnownUser(user: { id: string; name: string; pin?: string }) {
  const known = getKnownUsers()
  const idx = known.findIndex(u => u.id === user.id)
  if (idx === -1) {
    known.push({ id: user.id, name: user.name, pin: user.pin })
  } else {
    known[idx].name = user.name
    if (user.pin) known[idx].pin = user.pin
  }
  saveKnownUsers(known)
  return known
}

/**
 * Cache user objects in localStorage so we can restore them synchronously on refresh
 */
function getCachedUsers(): Record<string, User> {
  try {
    const raw = localStorage.getItem(CACHED_USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCachedUsers(users: Record<string, User>) {
  localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(users))
}

function cacheUser(user: User) {
  const cached = getCachedUsers()
  cached[user.id] = user
  saveCachedUsers(cached)
}

/**
 * Check if a token is expired by parsing the expiry from the token format (userId:expiryMs:hmac)
 */
function isTokenExpired(token: string): boolean {
  const parts = token.split(':')
  if (parts.length !== 3) return true
  const expiryMs = Number(parts[1])
  if (!Number.isFinite(expiryMs)) return true
  return Date.now() > expiryMs
}

/**
 * Synchronously restore auth state from localStorage.
 * Called at store creation time so isAuthenticated is true before first render.
 * This eliminates the race condition where useEffect runs AFTER the initial render.
 */
function restoreAuthSync(): {
  currentUser: User | null
  authenticatedUsers: AuthenticatedUser[]
  apiToken: string | null
} {
  const tokens = getStoredTokens()
  const cachedUsers = getCachedUsers()
  const lastUserId = localStorage.getItem('currentUserId')

  const authenticatedUsers: AuthenticatedUser[] = []

  for (const [userId, token] of Object.entries(tokens)) {
    if (isTokenExpired(token)) continue
    const user = cachedUsers[userId]
    if (user) {
      authenticatedUsers.push({ user, token })
    }
  }

  let currentUser: User | null = null
  let apiToken: string | null = null

  if (lastUserId) {
    const found = authenticatedUsers.find(au => au.user.id === lastUserId)
    if (found) {
      currentUser = found.user
      apiToken = found.token
    }
  }

  return { currentUser, authenticatedUsers, apiToken }
}

// Run synchronous restore ONCE at module load time, before any component renders
const initialAuth = restoreAuthSync()
if (initialAuth.apiToken) {
  setApiToken(initialAuth.apiToken)
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialAuth.currentUser)
  const [authenticatedUsers, setAuthenticatedUsers] = useState<AuthenticatedUser[]>(initialAuth.authenticatedUsers)
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>(() => getKnownUsers())
  // If we restored a user synchronously, skip the loading state entirely
  const [loading, setLoading] = useState(initialAuth.currentUser === null && Object.keys(getStoredTokens()).length > 0)
  const [error, setError] = useState<string | null>(null)
  const hasValidated = useRef(false)

  // Background validation: confirm tokens with the server, refresh user data,
  // and handle expired/invalid tokens. This runs AFTER the first render.
  useEffect(() => {
    if (hasValidated.current) return
    hasValidated.current = true

    let cancelled = false

    async function validateStoredTokens() {
      const tokens = getStoredTokens()
      const known = getKnownUsers()
      const entries = Object.entries(tokens)

      if (entries.length === 0 && known.every(k => !k.pin)) {
        setLoading(false)
        return
      }

      const validUsers: AuthenticatedUser[] = []
      const validTokens: Record<string, string> = {}

      // First pass: validate existing tokens with the server
      await Promise.all(
        entries.map(async ([userId, token]) => {
          try {
            const result = await authApi.validateToken(token)
            if (result.valid && result.user) {
              validUsers.push({ user: result.user, token })
              validTokens[userId] = token
              // Update cached user data with fresh server data
              cacheUser(result.user)
            }
          } catch {
            // Network error — if token isn't expired client-side, keep the cached session
            if (!isTokenExpired(token)) {
              const cachedUsers = getCachedUsers()
              if (cachedUsers[userId]) {
                validUsers.push({ user: cachedUsers[userId], token })
                validTokens[userId] = token
              }
            }
          }
        })
      )

      if (cancelled) return

      // Second pass: for known users with stored PINs whose tokens are missing/expired, auto-re-login
      const usersNeedingRelogin = known.filter(
        k => k.pin && !validTokens[k.id]
      )
      await Promise.all(
        usersNeedingRelogin.map(async (ku) => {
          try {
            const result = await authApi.login(ku.name, ku.pin!)
            if ('token' in result && 'user' in result) {
              validUsers.push({ user: result.user, token: result.token })
              validTokens[result.user.id] = result.token
              cacheUser(result.user)
            }
          } catch {
            // Re-login failed, skip
          }
        })
      )

      if (cancelled) return

      // Save only valid tokens
      saveTokens(validTokens)
      setAuthenticatedUsers(validUsers)

      // Restore/update current user with fresh server data
      const lastUserId = localStorage.getItem('currentUserId')
      if (lastUserId) {
        const found = validUsers.find(au => au.user.id === lastUserId)
        if (found) {
          setApiToken(found.token)
          setCurrentUser(found.user)
        } else {
          // Token was definitively invalid (not a network error) — clear the user
          setCurrentUser(null)
          setApiToken(null)
        }
      }

      setLoading(false)
    }

    validateStoredTokens()

    return () => {
      cancelled = true
    }
  }, [])

  // Persist current user ID and set API token
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', currentUser.id)
      const tokens = getStoredTokens()
      setApiToken(tokens[currentUser.id] || null)
    } else {
      localStorage.removeItem('currentUserId')
      setApiToken(null)
    }
  }, [currentUser])

  // Listen for unauthorized events (invalid/expired token)
  useEffect(() => {
    const handler = () => {
      if (currentUser) {
        const targetId = currentUser.id
        const tokens = getStoredTokens()
        delete tokens[targetId]
        saveTokens(tokens)
        setAuthenticatedUsers(prev => prev.filter(au => au.user.id !== targetId))
        setCurrentUser(null)
        setApiToken(null)
      }
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [currentUser])

  /**
   * Complete auth flow: store token, update known users, set current user
   */
  const completeAuth = useCallback((token: string, user: User, pin?: string) => {
    const tokens = getStoredTokens()
    tokens[user.id] = token
    saveTokens(tokens)

    // Cache user object so we can restore it synchronously on next page load
    cacheUser(user)

    setApiToken(token)

    if (pin) {
      setKnownUsers(addKnownUser({ ...user, pin }))
    }

    setAuthenticatedUsers(prev => {
      const filtered = prev.filter(au => au.user.id !== user.id)
      return [...filtered, { user, token }]
    })

    setCurrentUser(user)
  }, [])

  /**
   * Login with username and PIN
   * Returns { user } on success, or { needsPin, userId, name } if user needs to set PIN
   */
  const login = useCallback(async (name: string, pin: string) => {
    setError(null)
    const result = await authApi.login(name, pin)

    if ('needsPin' in result && result.needsPin) {
      return { needsPin: true, userId: result.userId, name: result.name }
    }

    if ('token' in result && 'user' in result) {
      completeAuth(result.token, result.user, pin)
      return { user: result.user }
    }

    throw new Error('Unexpected login response')
  }, [completeAuth])

  /**
   * Create a new user with username and PIN
   */
  const signup = useCallback(async (name: string, pin: string) => {
    setError(null)
    const { token, user } = await authApi.register(name, pin)
    completeAuth(token, user, pin)
    return user
  }, [completeAuth])

  /**
   * Set PIN for an existing user who doesn't have one
   */
  const setUserPin = useCallback(async (userId: string, pin: string) => {
    setError(null)
    const { token, user } = await authApi.setPin(userId, pin)
    completeAuth(token, user, pin)
    return user
  }, [completeAuth])

  /**
   * Change PIN for the current authenticated user
   */
  const changeUserPin = useCallback(async (currentPin: string, newPin: string) => {
    setError(null)
    const { token, user } = await authApi.changePin(currentPin, newPin)
    completeAuth(token, user, newPin)
    return user
  }, [completeAuth])

  /**
   * Logout a user (or current user if no userId specified)
   * Keeps the token stored for quick re-entry — use removeKnownUser to fully remove
   */
  const logout = useCallback((userId?: string) => {
    const targetId = userId || currentUser?.id
    if (!targetId) return

    // If logging out current user, clear them
    if (currentUser?.id === targetId) {
      setCurrentUser(null)
      setApiToken(null)
    }
  }, [currentUser])

  /**
   * Switch to a different authenticated user
   */
  const switchUser = useCallback((userId: string) => {
    const found = authenticatedUsers.find(au => au.user.id === userId)
    if (found) {
      setApiToken(found.token)
      setCurrentUser(found.user)
    }
  }, [authenticatedUsers])

  /**
   * Remove a user from the quick sign-in list and delete their token
   */
  const removeKnownUser = useCallback((userId: string) => {
    // Remove token
    const tokens = getStoredTokens()
    delete tokens[userId]
    saveTokens(tokens)

    // Remove cached user
    const cached = getCachedUsers()
    delete cached[userId]
    saveCachedUsers(cached)

    // Remove from authenticated users
    setAuthenticatedUsers(prev => prev.filter(au => au.user.id !== userId))

    // Remove from known users
    const updated = getKnownUsers().filter(u => u.id !== userId)
    saveKnownUsers(updated)
    setKnownUsers(updated)

    // If removing current user, clear them
    if (currentUser?.id === userId) {
      setCurrentUser(null)
      setApiToken(null)
    }
  }, [currentUser])

  /**
   * Delete a user account
   */
  const deleteUser = useCallback(async (userId: string) => {
    await usersApi.delete(userId)
    removeKnownUser(userId)
  }, [removeKnownUser])

  return (
    <UserContext.Provider
      value={{
        currentUser,
        authenticatedUsers,
        knownUsers,
        loading,
        error,
        setCurrentUser,
        login,
        signup,
        setPin: setUserPin,
        changePin: changeUserPin,
        logout,
        switchUser,
        deleteUser,
        removeKnownUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
