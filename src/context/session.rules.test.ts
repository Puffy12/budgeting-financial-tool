import assert from 'node:assert/strict'
import test from 'node:test'
import type { User } from '../types'
import { failedCheck, isTokenExpired, keepsToken, readDeviceSession, signedInUser } from './session.rules.ts'

const now = Date.UTC(2026, 9, 16, 12)
const day = 24 * 60 * 60 * 1000
const cached: User = { id: 'u1', name: 'Mike', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
const fresh: User = { ...cached, name: 'Mike R', updatedAt: '2026-10-01T00:00:00.000Z' }
const tokenUntil = (expiry: number) => `u1:${expiry}:${'a'.repeat(64)}`
const live = tokenUntil(now + 300 * day)
const expired = tokenUntil(now - 1)

test('a token expires only after the expiry it carries', () => {
  assert.equal(isTokenExpired(live, now), false)
  assert.equal(isTokenExpired(tokenUntil(now), now), false)
  assert.equal(isTokenExpired(expired, now), true)
  assert.equal(isTokenExpired('not-a-token', now), true)
  assert.equal(isTokenExpired('u1:soon:sig', now), true)
})

test('a token the server confirms signs in with the server copy of the user', () => {
  const check = { kind: 'confirmed', user: fresh } as const
  assert.equal(signedInUser(check, live, cached, now), fresh)
  assert.equal(keepsToken(check, live, now), true)
})

test('a token the server rejects ends the sign-in even while the cache still has the user', () => {
  const check = { kind: 'rejected' } as const
  assert.equal(signedInUser(check, live, cached, now), null)
  assert.equal(keepsToken(check, live, now), false)
})

test('an unreachable server keeps an unexpired sign-in from the cache', () => {
  const check = { kind: 'unreachable' } as const
  assert.equal(signedInUser(check, live, cached, now), cached)
  assert.equal(keepsToken(check, live, now), true)
})

test('an unreachable server does not revive an expired token or invent a user', () => {
  const check = { kind: 'unreachable' } as const
  assert.equal(signedInUser(check, expired, cached, now), null)
  assert.equal(keepsToken(check, expired, now), false)
  assert.equal(signedInUser(check, live, undefined, now), null)
  assert.equal(keepsToken(check, live, now), true)
})

test('only a 401 or 403 counts as the server rejecting a token', () => {
  assert.deepEqual(failedCheck(401), { kind: 'rejected' })
  assert.deepEqual(failedCheck(403), { kind: 'rejected' })
  for (const status of [undefined, 400, 404, 429, 500, 502, 503]) {
    assert.deepEqual(failedCheck(status), { kind: 'unreachable' })
  }
})

test('a saved device sign-in opens only a well-formed user holding their own token', () => {
  assert.deepEqual(readDeviceSession({ session: { user: fresh, token: live } }), { user: fresh, token: live })
  const refused = [
    null, 'u1', [], {}, { session: null }, { session: [] }, { session: { user: fresh } },
    { session: { user: { id: 'u1' }, token: live } },
    { session: { user: fresh, token: 42 } },
    { session: { user: { ...fresh, id: 'u2' }, token: live } },
  ]
  for (const body of refused) assert.equal(readDeviceSession(body), null)
})
