const assert = require('node:assert/strict');
const test = require('node:test');
const { sessionCookieName, readSessionCookie, sessionCookieOptions, tokenLifetimeMs } = require('./deviceSession');

const expiry = Date.UTC(2027, 9, 16, 12);
const token = `user-1:${expiry}:${'a'.repeat(64)}`;

test('the session cookie is found among other cookies and decoded', () => {
  const header = `theme=dark; ${sessionCookieName(true)}=${encodeURIComponent(token)}; other=1`;

  assert.equal(readSessionCookie(header, true), token);
  assert.equal(readSessionCookie(`budget_session=${encodeURIComponent(token)}`, false), token);
});

test('a missing, renamed, unprefixed, or garbled cookie reads as no session', () => {
  const name = sessionCookieName(true);
  const headers = [
    undefined, '', 'theme=dark', `${name}=`, `x${name}=${token}`, `${name}_old=${token}`,
    `${name}=%E0%A4%A`, `budget_session=${token}`,
  ];

  for (const header of headers) assert.equal(readSessionCookie(header, true), null);
});

test('the cookie is HttpOnly, same-site only, and ends with its token', () => {
  const now = expiry - 30 * 24 * 60 * 60 * 1000;

  assert.deepEqual(sessionCookieOptions(true, tokenLifetimeMs(token, now)), {
    httpOnly: true, sameSite: 'strict', secure: true, path: '/', maxAge: expiry - now,
  });
  assert.deepEqual(sessionCookieOptions(false), { httpOnly: true, sameSite: 'strict', secure: false, path: '/' });
  assert.equal(tokenLifetimeMs(token, expiry + 1), 0);
  assert.equal(tokenLifetimeMs('garbled', now), 0);
});
