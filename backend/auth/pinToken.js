const crypto = require('crypto');

const PIN_AUTH_SECRET = process.env.PIN_AUTH_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Generate a token for a user that expires in 14 days.
 * Format: userId:expiryMs:hmac where hmac = sha256(userId:expiryMs + secret)
 */
function generatePinToken(userId) {
  const expiryMs = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}:${expiryMs}`;
  const hmac = crypto.createHmac('sha256', PIN_AUTH_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}:${hmac}`;
}

/**
 * Validate a pin token and return the userId if valid and not expired
 */
function validatePinToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split(':');
  if (parts.length !== 3) return null;

  const [userId, expiryStr, providedHmac] = parts;
  const expiryMs = Number(expiryStr);

  if (!userId || !Number.isFinite(expiryMs) || !providedHmac) return null;

  // Check expiry
  if (Date.now() > expiryMs) return null;

  const payload = `${userId}:${expiryStr}`;
  const expectedHmac = crypto.createHmac('sha256', PIN_AUTH_SECRET)
    .update(payload)
    .digest('hex');

  if (providedHmac.length !== expectedHmac.length) return null;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedHmac, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );

  return isValid ? userId : null;
}

module.exports = { generatePinToken, validatePinToken };
