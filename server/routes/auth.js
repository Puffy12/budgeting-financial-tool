const express = require('express');
const router = express.Router();
const { validateBody } = require('../middleware/validate');
const {
  pinLoginSchema,
  setPinSchema,
  validateTokenSchema,
  createUserSchema,
  changePinSchema,
} = require('../validation/schemas');
const { requireAuth } = require('../middleware/pinAuth');
const auth = require('../services/auth');
const { sessionCookieName, readSessionCookie, sessionCookieOptions, tokenLifetimeMs } = require('../auth/deviceSession');

// Browsers accept a __Host- cookie only over HTTPS, which production always uses.
const secureCookie = process.env.NODE_ENV === 'production';
const deviceCookie = sessionCookieName(secureCookie);

function send(res, result) {
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.body);
}

function clearDeviceSession(res) {
  res.clearCookie(deviceCookie, sessionCookieOptions(secureCookie));
}

router.post('/pin-login', validateBody(pinLoginSchema), async (req, res) => {
  try {
    send(res, await auth.pinLogin(req.body.name, req.body.pin));
  } catch (error) {
    console.error('Error during pin login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/set-pin', validateBody(setPinSchema), async (req, res) => {
  try {
    send(res, await auth.setPin(req.body.userId, req.body.pin));
  } catch (error) {
    console.error('Error setting pin:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
});

router.post('/validate-token', validateBody(validateTokenSchema), (req, res) => {
  try {
    send(res, auth.validateToken(req.body.token));
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Token validation failed' });
  }
});

router.post('/register', validateBody(createUserSchema), async (req, res) => {
  try {
    send(res, await auth.registerUser(req.body.name, req.body.pin));
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.put('/change-pin', requireAuth, validateBody(changePinSchema), async (req, res) => {
  try {
    send(res, await auth.changePin(req.auth.userId, req.body.currentPin, req.body.newPin));
  } catch (error) {
    console.error('Error changing pin:', error);
    res.status(500).json({ error: 'Failed to change PIN' });
  }
});

// The client reads this back only when its own storage is empty, which is what Safari's cleanup leaves.
router.get('/device-session', (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const token = readSessionCookie(req.headers.cookie, secureCookie);
    const result = token ? auth.validateToken(token) : null;
    if (!result || result.error) {
      if (token) clearDeviceSession(res);
      return res.json({ session: null });
    }
    return res.json({ session: { user: result.body.user, token } });
  } catch (error) {
    console.error('Error reading device session:', error);
    return res.status(500).json({ error: 'Could not read the saved sign-in' });
  }
});

router.put('/device-session', (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '';
    if (auth.validateToken(token).error) return res.status(401).json({ error: 'Invalid or expired token' });
    res.cookie(deviceCookie, token, sessionCookieOptions(secureCookie, tokenLifetimeMs(token, Date.now())));
    return res.json({ remembered: true });
  } catch (error) {
    console.error('Error saving device session:', error);
    return res.status(500).json({ error: 'Could not save the sign-in' });
  }
});

router.delete('/device-session', (req, res) => {
  clearDeviceSession(res);
  res.json({ remembered: false });
});

module.exports = router;
