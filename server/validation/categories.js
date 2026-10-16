const { z } = require('zod');
const { transactionTypeSchema } = require('./common');

const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  type: transactionTypeSchema,
  icon: z.string().max(50).optional(),
});

const updateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim()
    .optional(),
  type: transactionTypeSchema.optional(),
  icon: z.string().max(50).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = { createCategorySchema, updateCategorySchema };
