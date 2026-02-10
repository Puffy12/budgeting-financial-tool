/**
 * PIN-based Authentication Routes
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { validateBody } = require('../middleware/validate');
const { pinLoginSchema, setPinSchema, validateTokenSchema } = require('../validation/schemas');

// Secret for HMAC token generation
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
  
  // The userId could contain colons in theory, but UUIDs don't
  // Split on last colon to get userId and hmac
  const lastColonIndex = token.lastIndexOf(':');
  const userId = token.substring(0, lastColonIndex);
  const providedHmac = token.substring(lastColonIndex + 1);
  
  const expectedHmac = crypto.createHmac('sha256', PIN_AUTH_SECRET)
    .update(userId)
    .digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  if (providedHmac.length !== expectedHmac.length) return null;
  
  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedHmac, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );
  
  return isValid ? userId : null;
}

/**
 * Strip pinHash from user object before sending to client
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { pinHash, ...safeUser } = user;
  return safeUser;
}

/**
 * POST /api/auth/pin-login
 * Login with username and 4-digit PIN
 */
router.post('/pin-login', validateBody(pinLoginSchema), async (req, res) => {
  try {
    const { name, pin } = req.body;
    
    // Find user by name (case-insensitive)
    const user = db.getUserByName(name);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If user has no PIN set, signal frontend to show set-PIN flow
    if (!user.pinHash) {
      return res.status(200).json({
        needsPin: true,
        userId: user.id,
        name: user.name
      });
    }
    
    // Compare provided PIN with stored hash
    const isMatch = await bcrypt.compare(pin, user.pinHash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }
    
    // Generate token
    const token = generatePinToken(user.id);
    
    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Error during pin login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/set-pin
 * Set PIN for an existing user who doesn't have one
 */
router.post('/set-pin', validateBody(setPinSchema), async (req, res) => {
  try {
    const { userId, pin } = req.body;
    
    const user = db.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only allow setting PIN if user doesn't already have one
    if (user.pinHash) {
      return res.status(400).json({ error: 'User already has a PIN set' });
    }
    
    // Hash and store the PIN
    const pinHash = await bcrypt.hash(pin, 12);
    const updatedUser = db.updateUser(userId, { pinHash });
    
    // Generate token
    const token = generatePinToken(userId);
    
    return res.json({
      token,
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Error setting pin:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
});

/**
 * POST /api/auth/validate-token
 * Validate a stored token and return user info if valid
 */
router.post('/validate-token', validateBody(validateTokenSchema), (req, res) => {
  try {
    const { token } = req.body;
    
    const userId = validatePinToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = db.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    return res.json({
      valid: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Token validation failed' });
  }
});

module.exports = router;
