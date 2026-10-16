import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthenticatedUser, User } from '../types'
import { authApi } from '../features/home/api'
import { ApiError, setApiToken } from '../lib/apiClient'
import { useAuthActions } from './useAuthActions'
import {
  cacheUser,
  getKnownUsers,
  getStoredTokens,
  isTokenExpired,
  readCachedUser,
  saveTokens,
  type KnownUser,
} from './authStorage'

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

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authenticatedUsers, setAuthenticatedUsers] = useState<AuthenticatedUser[]>([])
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>(() => getKnownUsers())
  const [loading, setLoading] = useState(() => {
    const tokens = getStoredTokens()
    return Object.keys(tokens).length > 0 || getKnownUsers().some((entry) => entry.pin)
  })
  const [error, setError] = useState<string | null>(null)
  const actions = useAuthActions({ currentUser, setCurrentUser, setAuthenticatedUsers, setKnownUsers, setError })

  useEffect(() => {
    let cancelled = false

    async function validateStoredTokens() {
      const tokens = getStoredTokens()
      const known = getKnownUsers()
      const entries = Object.entries(tokens)
      if (entries.length === 0 && known.every((entry) => !entry.pin)) {
        if (!cancelled) setLoading(false)
        return
      }

      const validUsers: AuthenticatedUser[] = []
      const validTokens: Record<string, string> = {}
      try {
        await Promise.all(entries.map(async ([userId, token]) => {
          try {
            const result = await authApi.validateToken(token)
            if (result.valid && result.user) {
              validUsers.push({ user: result.user, token })
              validTokens[userId] = token
              cacheUser(result.user)
            }
          } catch (err) {
            const rejected = err instanceof ApiError && (err.status === 401 || err.status === 403)
            if (rejected || isTokenExpired(token)) return
            const cached = readCachedUser(userId)
            if (cached) {
              validUsers.push({ user: cached, token })
              validTokens[userId] = token
            }
          }
        }))
        if (cancelled) return

        const usersNeedingRelogin = known.filter((entry) => entry.pin && !validTokens[entry.id])
        await Promise.all(usersNeedingRelogin.map(async (knownUser) => {
          try {
            const result = await authApi.login(knownUser.name, knownUser.pin!)
            if ('token' in result && 'user' in result) {
              validUsers.push({ user: result.user, token: result.token })
              validTokens[result.user.id] = result.token
              cacheUser(result.user)
            }
          } catch {
            // Stored PIN was rejected. Leave the sign-in form up.
          }
        }))
        if (cancelled) return

        saveTokens(validTokens)
        setAuthenticatedUsers(validUsers)
        const lastUserId = localStorage.getItem('currentUserId')
        if (lastUserId) {
          const found = validUsers.find((entry) => entry.user.id === lastUserId)
          if (found) {
            setApiToken(found.token)
            setCurrentUser(found.user)
          } else {
            setCurrentUser(null)
            setApiToken(null)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    validateStoredTokens()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', currentUser.id)
      setApiToken(getStoredTokens()[currentUser.id] || null)
    } else {
      localStorage.removeItem('currentUserId')
      setApiToken(null)
    }
  }, [currentUser])

  useEffect(() => {
    const handler = () => {
      if (!currentUser) return
      const targetId = currentUser.id
      const tokens = getStoredTokens()
      delete tokens[targetId]
      saveTokens(tokens)
      setAuthenticatedUsers((prev) => prev.filter((entry) => entry.user.id !== targetId))
      setCurrentUser(null)
      setApiToken(null)
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [currentUser])

  const switchUser = useCallback((userId: string) => {
    const found = authenticatedUsers.find((entry) => entry.user.id === userId)
    if (found) {
      setApiToken(found.token)
      setCurrentUser(found.user)
    }
  }, [authenticatedUsers])

  return (
    <UserContext.Provider value={{
      currentUser,
      authenticatedUsers,
      knownUsers,
      loading,
      error,
      setCurrentUser,
      switchUser,
      ...actions,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) throw new Error('useUser must be used within a UserProvider')
  return context
}

export type { KnownUser }
