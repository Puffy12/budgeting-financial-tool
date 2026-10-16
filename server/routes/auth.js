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

function send(res, result) {
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.body);
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

module.exports = router;
