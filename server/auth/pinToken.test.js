const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

process.env.PIN_AUTH_SECRET = 'test-only-secret';
const { generatePinToken, validatePinToken } = require('./pinToken');

const DAY_MS = 24 * 60 * 60 * 1000;

function signed(payload) {
  return `${payload}:${crypto.createHmac('sha256', 'test-only-secret').update(payload).digest('hex')}`;
}

test('a sign-in token names its user and lasts 365 days', (t) => {
  let now = Date.UTC(2026, 9, 16, 12);
  t.mock.method(Date, 'now', () => now);
  const token = generatePinToken('user-1');

  assert.equal(Number(token.split(':')[1]), now + 365 * DAY_MS);
  now += 364 * DAY_MS;
  assert.equal(validatePinToken(token), 'user-1');
  now += 2 * DAY_MS;
  assert.equal(validatePinToken(token), null);
});

test('a token with a changed user, expiry, or signature is refused', () => {
  const [userId, expiry, signature] = generatePinToken('user-1').split(':');

  assert.equal(validatePinToken(`user-2:${expiry}:${signature}`), null);
  assert.equal(validatePinToken(`${userId}:${Number(expiry) + 1}:${signature}`), null);
  assert.equal(validatePinToken(`${userId}:${expiry}:${'0'.repeat(64)}`), null);
});

test('a malformed token is refused instead of throwing', () => {
  const payload = `user-1:${Date.now() + DAY_MS}`;
  const malformed = [undefined, null, 42, '', 'user-1', 'a:b:c:d', `${payload}:${'z'.repeat(64)}`, `${signed(payload)}00`];

  for (const token of malformed) assert.equal(validatePinToken(token), null);
  assert.equal(validatePinToken(signed(payload)), 'user-1');
});
