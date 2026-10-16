const { z } = require('zod');
const { uuidSchema, transactionTypeSchema, frequencySchema, dateSchema } = require('./common');

const createRecurringSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  amount: z.number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large'),
  type: transactionTypeSchema,
  categoryId: uuidSchema,
  frequency: frequencySchema,
  startDate: dateSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

const updateRecurringSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim()
    .optional(),
  amount: z.number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large')
    .optional(),
  type: transactionTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  frequency: frequencySchema.optional(),
  nextDueDate: dateSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const recurringQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

module.exports = { createRecurringSchema, updateRecurringSchema, recurringQuerySchema };
