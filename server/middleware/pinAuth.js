const { validatePinToken } = require('../auth/pinToken');

const isDevMode = process.env.DEV_MODE === 'true' && process.env.NODE_ENV !== 'production';

/**
 * Middleware: Require a valid Bearer token in the Authorization header.
 * Attaches req.auth = { userId } on success.
 * In DEV_MODE, bypasses token validation and uses the :userId URL param.
 */
function requireAuth(req, res, next) {
  if (isDevMode) {
    req.auth = { userId: req.params.userId || 'dev-user' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const userId = validatePinToken(token);

  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.auth = { userId };
  next();
}

/**
 * Middleware: Verify that the authenticated user matches the :userId URL param.
 * Must be used after requireAuth.
 */
function requireOwnership(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.params.userId && req.auth.userId !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}

module.exports = { requireAuth, requireOwnership };
