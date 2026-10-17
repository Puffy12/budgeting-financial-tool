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
