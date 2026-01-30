/**
 * JWT Authentication Module
 * Handles token generation, verification, and refresh
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Secrets - in production, these should be in environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

// In-memory store for refresh tokens (in production, use Redis or database)
const refreshTokenStore = new Map();

/**
 * Generate access and refresh tokens
 * @param {string} userId - User identifier
 * @returns {Object} Object containing accessToken and refreshToken
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh', jti: crypto.randomUUID() },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  // Store refresh token
  const decoded = jwt.decode(refreshToken);
  refreshTokenStore.set(decoded.jti, {
    userId,
    expiresAt: new Date(decoded.exp * 1000)
  });
  
  return { accessToken, refreshToken };
}

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token and generate new tokens
 * @param {string} token - JWT refresh token
 * @returns {Object|null} New tokens or null if invalid
 */
function refreshAccessToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    // Check if refresh token is in store (not revoked)
    const storedToken = refreshTokenStore.get(decoded.jti);
    if (!storedToken) {
      return null;
    }
    
    // Remove old refresh token
    refreshTokenStore.delete(decoded.jti);
    
    // Generate new tokens
    return generateTokens(decoded.userId);
  } catch (error) {
    return null;
  }
}

/**
 * Revoke a refresh token
 * @param {string} token - JWT refresh token to revoke
 * @returns {boolean} True if revoked successfully
 */
function revokeRefreshToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.jti) {
      refreshTokenStore.delete(decoded.jti);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Revoke all refresh tokens for a user
 * @param {string} userId - User identifier
 */
function revokeAllUserTokens(userId) {
  for (const [jti, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      refreshTokenStore.delete(jti);
    }
  }
}

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  // Get token from Authorization header or cookie
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1] || req.cookies?.access_token;
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required'
    });
  }
  
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired access token'
    });
  }
  
  req.user = decoded;
  next();
}

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require it
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1] || req.cookies?.access_token;
  
  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
}

// Clean up expired refresh tokens periodically
setInterval(() => {
  const now = new Date();
  for (const [jti, data] of refreshTokenStore.entries()) {
    if (data.expiresAt < now) {
      refreshTokenStore.delete(jti);
    }
  }
}, 60 * 60 * 1000); // Run every hour

module.exports = {
  generateTokens,
  verifyAccessToken,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  hashPassword,
  comparePassword,
  authenticateToken,
  optionalAuth,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
};
