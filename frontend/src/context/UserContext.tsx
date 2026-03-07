import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, AuthenticatedUser } from '../types'
import { authApi, usersApi, setApiToken } from '../api'

const AUTH_TOKENS_KEY = 'auth_tokens'
const KNOWN_USERS_KEY = 'known_users'

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

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authenticatedUsers, setAuthenticatedUsers] = useState<AuthenticatedUser[]>([])
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>(() => getKnownUsers())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On mount, validate all stored tokens and restore authenticated users
  // If a token is expired but we have a stored PIN, auto-re-login
  useEffect(() => {
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
      const triedUserIds = new Set<string>()

      // First pass: validate existing tokens
      await Promise.all(
        entries.map(async ([userId, token]) => {
          triedUserIds.add(userId)
          try {
            const result = await authApi.validateToken(token)
            if (result.valid && result.user) {
              validUsers.push({ user: result.user, token })
              validTokens[userId] = token
            }
          } catch {
            // Token invalid, skip — will try re-login below
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

      // Restore current user from localStorage
      const lastUserId = localStorage.getItem('currentUserId')
      if (lastUserId) {
        const found = validUsers.find(au => au.user.id === lastUserId)
        if (found) {
          setApiToken(found.token)
          setCurrentUser(found.user)
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
   * Login with username and PIN
   * Returns { user } on success, or { needsPin, userId, name } if user needs to set PIN
   */
  const login = useCallback(async (name: string, pin: string) => {
    setError(null)
    const result = await authApi.login(name, pin)

    // Check if user needs to set PIN
    if ('needsPin' in result && result.needsPin) {
      return { needsPin: true, userId: result.userId, name: result.name }
    }

    // Successful login
    if ('token' in result && 'user' in result) {
      const { token, user } = result

      // Store token
      const tokens = getStoredTokens()
      tokens[user.id] = token
      saveTokens(tokens)

      // Set API token immediately
      setApiToken(token)

      // Add to known users (with PIN for auto-re-login) and authenticated users
      setKnownUsers(addKnownUser({ ...user, pin }))

      // Add to authenticated users (replace if exists)
      setAuthenticatedUsers(prev => {
        const filtered = prev.filter(au => au.user.id !== user.id)
        return [...filtered, { user, token }]
      })

      // Set as current user
      setCurrentUser(user)

      return { user }
    }

    throw new Error('Unexpected login response')
  }, [])

  /**
   * Create a new user with username and PIN
   */
  const signup = useCallback(async (name: string, pin: string) => {
    setError(null)
    const result = await authApi.register(name, pin)
    const { token, user } = result

    // Store token
    const tokens = getStoredTokens()
    tokens[user.id] = token
    saveTokens(tokens)

    // Set API token immediately
    setApiToken(token)

    // Add to known users (with PIN for auto-re-login) and authenticated users
    setKnownUsers(addKnownUser({ ...user, pin }))

    // Add to authenticated users
    setAuthenticatedUsers(prev => {
      const filtered = prev.filter(au => au.user.id !== user.id)
      return [...filtered, { user, token }]
    })

    setCurrentUser(user)

    return user
  }, [])

  /**
   * Set PIN for an existing user who doesn't have one
   */
  const setUserPin = useCallback(async (userId: string, pin: string) => {
    setError(null)
    const result = await authApi.setPin(userId, pin)
    const { token, user } = result

    // Store token
    const tokens = getStoredTokens()
    tokens[user.id] = token
    saveTokens(tokens)

    // Add to known users (with PIN for auto-re-login) and authenticated users
    setKnownUsers(addKnownUser({ ...user, pin }))

    setAuthenticatedUsers(prev => {
      const filtered = prev.filter(au => au.user.id !== user.id)
      return [...filtered, { user, token }]
    })

    setCurrentUser(user)

    return user
  }, [])

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
