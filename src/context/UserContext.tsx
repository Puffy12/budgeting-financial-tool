import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthenticatedUser, User } from '../types'
import { Spinner } from '../components/ui/Spinner'
import { UNAUTHORIZED_EVENT, getApiToken, rejectedToken, setApiToken } from '../lib/apiClient'
import { authApi } from '../features/home/api'
import { useAuthActions } from './useAuthActions'
import { getKnownUsers, getStoredTokens, hasStoredSignIn, saveCurrentUserId, saveTokens, type KnownUser } from './authStorage'
import { restoreSession } from './restoreSession'

interface UserContextType {
  currentUser: User | null
  authenticatedUsers: AuthenticatedUser[]
  knownUsers: KnownUser[]
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
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [authenticatedUsers, setAuthenticatedUsers] = useState<AuthenticatedUser[]>([])
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>(() => getKnownUsers())
  const [checkingSignIn, setCheckingSignIn] = useState(hasStoredSignIn)
  const [error, setError] = useState<string | null>(null)

  // Pages load data in effects that run before this provider's effects, so the token is attached
  // in the same step that sets the user rather than afterwards.
  const selectUser = useCallback((user: User | null, token: string | null) => {
    setApiToken(user ? token : null)
    saveCurrentUserId(user ? user.id : null)
    setCurrentUserState(user)
    // The server's cookie copy follows whoever is open, so a cleared browser reopens only that person.
    if (!user) authApi.forgetDevice().catch(() => {})
    else if (token) authApi.rememberDevice(token).catch(() => {})
  }, [])

  const actions = useAuthActions({ currentUser, selectUser, setAuthenticatedUsers, setKnownUsers, setError })

  // The stored sign-in is checked once, when the app opens, before any page renders.
  useEffect(() => {
    if (!checkingSignIn) return
    let cancelled = false
    restoreSession()
      .catch(() => ({ authenticatedUsers: [], current: null }))
      .then((restored) => {
        if (cancelled) return
        setAuthenticatedUsers(restored.authenticatedUsers)
        if (restored.current) selectUser(restored.current.user, restored.current.token)
        setCheckingSignIn(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const revoke = (event: Event) => {
      const token = rejectedToken(event)
      if (!token) return
      const tokens = getStoredTokens()
      for (const [userId, stored] of Object.entries(tokens)) {
        if (stored === token) delete tokens[userId]
      }
      saveTokens(tokens)
      setAuthenticatedUsers((prev) => prev.filter((entry) => entry.token !== token))
      if (getApiToken() === token) selectUser(null, null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, revoke)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, revoke)
  }, [selectUser])

  const switchUser = useCallback((userId: string) => {
    const found = authenticatedUsers.find((entry) => entry.user.id === userId)
    if (found) selectUser(found.user, found.token)
  }, [authenticatedUsers, selectUser])

  const setCurrentUser = useCallback((user: User | null) => {
    if (!user) return selectUser(null, null)
    const signedIn = authenticatedUsers.find((entry) => entry.user.id === user.id)
    selectUser(user, signedIn?.token ?? getStoredTokens()[user.id] ?? null)
  }, [authenticatedUsers, selectUser])

  return (
    <UserContext.Provider value={{
      currentUser,
      authenticatedUsers,
      knownUsers,
      error,
      setCurrentUser,
      switchUser,
      ...actions,
    }}>
      {checkingSignIn ? <SignInCheck /> : children}
    </UserContext.Provider>
  )
}

function SignInCheck() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <Spinner size="lg" className="border-2" />
    </div>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) throw new Error('useUser must be used within a UserProvider')
  return context
}

export type { KnownUser }
