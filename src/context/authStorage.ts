import type { AuthenticatedUser, User } from '../types'

const AUTH_TOKENS_KEY = 'auth_tokens'
const KNOWN_USERS_KEY = 'known_users'
const CACHED_USERS_KEY = 'cached_users'

export interface KnownUser {
  id: string
  name: string
  pin?: string
}

export function getStoredTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AUTH_TOKENS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveTokens(tokens: Record<string, string>) {
  localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens))
}

export function getKnownUsers(): KnownUser[] {
  try {
    const raw = localStorage.getItem(KNOWN_USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveKnownUsers(users: KnownUser[]) {
  localStorage.setItem(KNOWN_USERS_KEY, JSON.stringify(users))
}

export function addKnownUser(user: { id: string; name: string; pin?: string }) {
  const known = getKnownUsers()
  const idx = known.findIndex((entry) => entry.id === user.id)
  if (idx === -1) {
    known.push({ id: user.id, name: user.name, pin: user.pin })
  } else {
    known[idx].name = user.name
    if (user.pin) known[idx].pin = user.pin
  }
  saveKnownUsers(known)
  return known
}

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

export function cacheUser(user: User) {
  const cached = getCachedUsers()
  cached[user.id] = user
  saveCachedUsers(cached)
}

export function removeCachedUser(userId: string) {
  const cached = getCachedUsers()
  delete cached[userId]
  saveCachedUsers(cached)
}

export function isTokenExpired(token: string): boolean {
  const parts = token.split(':')
  if (parts.length !== 3) return true
  const expiryMs = Number(parts[1])
  if (!Number.isFinite(expiryMs)) return true
  return Date.now() > expiryMs
}

export function restoreAuthSync(): {
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
    if (user) authenticatedUsers.push({ user, token })
  }

  let currentUser: User | null = null
  let apiToken: string | null = null
  if (lastUserId) {
    const found = authenticatedUsers.find((entry) => entry.user.id === lastUserId)
    if (found) {
      currentUser = found.user
      apiToken = found.token
    }
  }

  return { currentUser, authenticatedUsers, apiToken }
}

export function readCachedUser(userId: string): User | undefined {
  return getCachedUsers()[userId]
}
