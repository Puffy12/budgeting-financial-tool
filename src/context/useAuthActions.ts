import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { AuthenticatedUser, User } from '../types'
import { authApi } from '../features/home/api'
import { usersApi } from '../features/dashboard/api'
import {
  addKnownUser,
  cacheUser,
  getStoredTokens,
  removeCachedUser,
  saveKnownUsers,
  saveTokens,
  getKnownUsers,
  type KnownUser,
} from './authStorage'

interface AuthSetters {
  currentUser: User | null
  selectUser: (user: User | null, token: string | null) => void
  setAuthenticatedUsers: Dispatch<SetStateAction<AuthenticatedUser[]>>
  setKnownUsers: Dispatch<SetStateAction<KnownUser[]>>
  setError: Dispatch<SetStateAction<string | null>>
}

export function useAuthActions({
  currentUser,
  selectUser,
  setAuthenticatedUsers,
  setKnownUsers,
  setError,
}: AuthSetters) {
  const completeAuth = useCallback((token: string, user: User, pin?: string) => {
    const tokens = getStoredTokens()
    tokens[user.id] = token
    saveTokens(tokens)
    cacheUser(user)
    if (pin) setKnownUsers(addKnownUser({ ...user, pin }))
    setAuthenticatedUsers((prev) => {
      const filtered = prev.filter((entry) => entry.user.id !== user.id)
      return [...filtered, { user, token }]
    })
    selectUser(user, token)
  }, [selectUser, setAuthenticatedUsers, setKnownUsers])

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
  }, [completeAuth, setError])

  const signup = useCallback(async (name: string, pin: string) => {
    setError(null)
    const { token, user } = await authApi.register(name, pin)
    completeAuth(token, user, pin)
    return user
  }, [completeAuth, setError])

  const setPin = useCallback(async (userId: string, pin: string) => {
    setError(null)
    const { token, user } = await authApi.setPin(userId, pin)
    completeAuth(token, user, pin)
    return user
  }, [completeAuth, setError])

  const changePin = useCallback(async (currentPin: string, newPin: string) => {
    setError(null)
    const { token, user } = await authApi.changePin(currentPin, newPin)
    completeAuth(token, user, newPin)
    return user
  }, [completeAuth, setError])

  const logout = useCallback((userId?: string) => {
    const targetId = userId || currentUser?.id
    if (!targetId) return
    if (currentUser?.id === targetId) selectUser(null, null)
  }, [currentUser, selectUser])

  const removeKnownUser = useCallback((userId: string) => {
    const tokens = getStoredTokens()
    delete tokens[userId]
    saveTokens(tokens)
    removeCachedUser(userId)
    setAuthenticatedUsers((prev) => prev.filter((entry) => entry.user.id !== userId))
    const updated = getKnownUsers().filter((entry) => entry.id !== userId)
    saveKnownUsers(updated)
    setKnownUsers(updated)
    if (currentUser?.id === userId) selectUser(null, null)
  }, [currentUser, selectUser, setAuthenticatedUsers, setKnownUsers])

  const deleteUser = useCallback(async (userId: string) => {
    await usersApi.delete(userId)
    removeKnownUser(userId)
  }, [removeKnownUser])

  return { login, signup, setPin, changePin, logout, removeKnownUser, deleteUser }
}
