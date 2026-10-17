import type { AuthenticatedUser } from '../types'
import { authApi } from '../features/home/api'
import { ApiError } from '../lib/apiClient'
import {
  addKnownUser, cacheUser, getKnownUsers, getStoredTokens, hasStoredSignIn, readCachedUser, readCurrentUserId, saveTokens,
} from './authStorage'
import { failedCheck, keepsToken, readDeviceSession, signedInUser, type TokenCheck } from './session.rules'

// The app waits on this check, so a stalled request must not hold it behind the spinner.
const CHECK_TIMEOUT_MS = 8000

export interface RestoredSession {
  authenticatedUsers: AuthenticatedUser[]
  current: AuthenticatedUser | null
}

const NO_SESSION: RestoredSession = { authenticatedUsers: [], current: null }

function withTimeout<T>(request: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Sign-in check timed out')), CHECK_TIMEOUT_MS)
    request.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (error: unknown) => { clearTimeout(timer); reject(error) },
    )
  })
}

async function checkToken(token: string): Promise<TokenCheck> {
  try {
    const result = await withTimeout(authApi.validateToken(token))
    return result.valid && result.user ? { kind: 'confirmed', user: result.user } : { kind: 'rejected' }
  } catch (error) {
    return failedCheck(error instanceof ApiError ? error.status : undefined)
  }
}

async function signInWithSavedPin(name: string, pin: string): Promise<AuthenticatedUser | null> {
  try {
    const result = await withTimeout(authApi.login(name, pin))
    return 'token' in result ? { user: result.user, token: result.token } : null
  } catch {
    return null
  }
}

// Safari clears this storage after seven days of use without a visit. The server keeps a cookie copy of
// the open sign-in, read back only into empty storage, so a browser that signed out stays signed out.
async function restoreFromDevice(): Promise<RestoredSession> {
  try {
    const session = readDeviceSession(await withTimeout(authApi.getDeviceSession()))
    if (!session) return NO_SESSION
    saveTokens({ [session.user.id]: session.token })
    cacheUser(session.user)
    addKnownUser({ id: session.user.id, name: session.user.name })
    return { authenticatedUsers: [session], current: session }
  } catch {
    return NO_SESSION
  }
}

export async function restoreSession(): Promise<RestoredSession> {
  if (!hasStoredSignIn()) return restoreFromDevice()
  const lastUserId = readCurrentUserId()
  const now = Date.now()
  const kept: Record<string, string> = {}
  const restored: AuthenticatedUser[] = []

  await Promise.all(Object.entries(getStoredTokens()).map(async ([userId, token]) => {
    const check = await checkToken(token)
    if (keepsToken(check, token, now)) kept[userId] = token
    const user = signedInUser(check, token, readCachedUser(userId), now)
    if (user) restored.push({ user, token })
  }))

  const pinSignIns = await Promise.all(getKnownUsers().flatMap((known) =>
    known.pin && !kept[known.id] ? [signInWithSavedPin(known.name, known.pin)] : []))
  for (const entry of pinSignIns) {
    if (!entry) continue
    kept[entry.user.id] = entry.token
    restored.push(entry)
  }

  saveTokens(kept)
  for (const entry of restored) cacheUser(entry.user)
  return {
    authenticatedUsers: restored,
    current: restored.find((entry) => entry.user.id === lastUserId) ?? null,
  }
}
