/**
 * PIN-based Authentication Routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const { validateBody } = require('../middleware/validate');
const { pinLoginSchema, setPinSchema, validateTokenSchema, createUserSchema } = require('../validation/schemas');
const { generatePinToken, validatePinToken } = require('../auth/pinToken');

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

/**
 * POST /api/auth/register
 * Create a new user with username and PIN, return token
 */
router.post('/register', validateBody(createUserSchema), async (req, res) => {
  try {
    const { name, pin } = req.body;

    // Check if user with this name already exists
    const existing = db.getUserByName(name);
    if (existing) {
      return res.status(409).json({ error: 'A user with that name already exists' });
    }

    const userId = uuidv4();
    const now = new Date().toISOString();

    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 12);

    const user = {
      id: userId,
      name,
      pinHash,
      createdAt: now,
      updatedAt: now
    };

    db.insertUser(user);

    // Create default categories for the new user
    const defaultCategories = db.getDefaultCategories().map(cat => ({
      id: uuidv4(),
      userId: userId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      createdAt: now,
      updatedAt: now
    }));

    db.insertMany('categories', defaultCategories, userId);

    // Generate token
    const token = generatePinToken(userId);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
