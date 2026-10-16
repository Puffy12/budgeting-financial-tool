const { z } = require('zod');
const { uuidSchema, pinSchema } = require('./common');

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const pinLoginSchema = z.object({
  name: z.string()
    .min(1, 'Username is required')
    .max(100, 'Username must be 100 characters or less')
    .trim(),
  pin: pinSchema,
});

const setPinSchema = z.object({
  userId: uuidSchema,
  pin: pinSchema,
});

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

const changePinSchema = z.object({
  currentPin: pinSchema,
  newPin: pinSchema,
}).refine((data) => data.currentPin !== data.newPin, {
  message: 'New PIN must be different from current PIN',
  path: ['newPin'],
});

const monthlyQuerySchema = z.object({
  months: z.string().transform(Number).pipe(z.number().int().min(1).max(36)).optional(),
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  pinLoginSchema,
  setPinSchema,
  validateTokenSchema,
  changePinSchema,
  monthlyQuerySchema,
};
