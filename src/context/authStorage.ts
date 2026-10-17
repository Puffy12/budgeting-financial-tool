import type { User } from '../types'
import { isRecord, isUserRecord } from './session.rules'

const AUTH_TOKENS_KEY = 'auth_tokens'
const KNOWN_USERS_KEY = 'known_users'
const CACHED_USERS_KEY = 'cached_users'
const CURRENT_USER_KEY = 'currentUserId'

export interface KnownUser {
  id: string
  name: string
  pin?: string
}

// The sign-in check reads these before anything renders, so a damaged entry reads as empty instead of
// crashing the app, and a blocked write keeps the sign-in for this visit only.
function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage is full or blocked.
  }
}

function isKnownUser(value: unknown): value is KnownUser {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string'
    && (value.pin === undefined || typeof value.pin === 'string')
}

export function getStoredTokens(): Record<string, string> {
  const stored = readJson(AUTH_TOKENS_KEY)
  if (!isRecord(stored)) return {}
  return Object.fromEntries(
    Object.entries(stored).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

export function saveTokens(tokens: Record<string, string>) {
  writeJson(AUTH_TOKENS_KEY, tokens)
}

export function getKnownUsers(): KnownUser[] {
  const stored = readJson(KNOWN_USERS_KEY)
  return Array.isArray(stored) ? stored.filter(isKnownUser) : []
}

export function saveKnownUsers(users: KnownUser[]) {
  writeJson(KNOWN_USERS_KEY, users)
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
  const stored = readJson(CACHED_USERS_KEY)
  if (!isRecord(stored)) return {}
  return Object.fromEntries(
    Object.entries(stored).filter((entry): entry is [string, User] => isUserRecord(entry[1])),
  )
}

function saveCachedUsers(users: Record<string, User>) {
  writeJson(CACHED_USERS_KEY, users)
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

export function readCachedUser(userId: string): User | undefined {
  return getCachedUsers()[userId]
}

export function readCurrentUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY)
  } catch {
    return null
  }
}

export function saveCurrentUserId(userId: string | null) {
  try {
    if (userId) localStorage.setItem(CURRENT_USER_KEY, userId)
    else localStorage.removeItem(CURRENT_USER_KEY)
  } catch {
    // Storage is blocked.
  }
}

export function hasStoredSignIn(): boolean {
  return Object.keys(getStoredTokens()).length > 0 || getKnownUsers().some((entry) => entry.pin)
}
