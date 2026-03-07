const crypto = require('crypto');

const PIN_AUTH_SECRET = process.env.PIN_AUTH_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Generate a never-expiring token for a user
 * Format: userId:hmac where hmac = sha256(userId + secret)
 */
function generatePinToken(userId) {
  const hmac = crypto.createHmac('sha256', PIN_AUTH_SECRET)
    .update(userId)
    .digest('hex');
  return `${userId}:${hmac}`;
}

/**
 * Validate a pin token and return the userId if valid
 */
function validatePinToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split(':');
  if (parts.length !== 2) return null;

  const lastColonIndex = token.lastIndexOf(':');
  const userId = token.substring(0, lastColonIndex);
  const providedHmac = token.substring(lastColonIndex + 1);

  const expectedHmac = crypto.createHmac('sha256', PIN_AUTH_SECRET)
    .update(userId)
    .digest('hex');

  if (providedHmac.length !== expectedHmac.length) return null;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedHmac, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );

  return isValid ? userId : null;
}

module.exports = { generatePinToken, validatePinToken };
