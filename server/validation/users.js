const { z } = require('zod');
const { pinSchema } = require('./common');

const createUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  pin: pinSchema,
});

const updateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
});

module.exports = { createUserSchema, updateUserSchema };
