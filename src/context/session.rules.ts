import type { User } from '../types'

export type TokenCheck =
  | { kind: 'confirmed'; user: User }
  | { kind: 'rejected' }
  | { kind: 'unreachable' }

export function isTokenExpired(token: string, now: number): boolean {
  const parts = token.split(':')
  if (parts.length !== 3) return true
  const expiryMs = Number(parts[1])
  return !Number.isFinite(expiryMs) || now > expiryMs
}

// Only the server refusing the token ends a sign-in. An outage, a timeout, or a rate limit keeps it.
export function failedCheck(status: number | undefined): TokenCheck {
  return status === 401 || status === 403 ? { kind: 'rejected' } : { kind: 'unreachable' }
}

export function keepsToken(check: TokenCheck, token: string, now: number): boolean {
  switch (check.kind) {
    case 'confirmed':
      return true
    case 'rejected':
      return false
    case 'unreachable':
      return !isTokenExpired(token, now)
  }
}

export function signedInUser(check: TokenCheck, token: string, cached: User | undefined, now: number): User | null {
  switch (check.kind) {
    case 'confirmed':
      return check.user
    case 'rejected':
      return null
    case 'unreachable':
      return cached && !isTokenExpired(token, now) ? cached : null
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Only settings reads createdAt, and it guards for a missing value, so an id and a name make a usable user.
export function isUserRecord(value: unknown): value is User {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string'
}
