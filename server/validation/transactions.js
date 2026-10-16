const { z } = require('zod');
const { uuidSchema, transactionTypeSchema, dateSchema } = require('./common');

const createTransactionSchema = z.object({
  amount: z.number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large'),
  type: transactionTypeSchema,
  categoryId: uuidSchema,
  date: dateSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large')
    .optional(),
  type: transactionTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  date: dateSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const transactionQuerySchema = z.object({
  month: z.string().transform(Number).pipe(z.number().int().min(0).max(11)).optional(),
  year: z.string().transform(Number).pipe(z.number().int().min(2000).max(2100)).optional(),
  type: transactionTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(1000)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
});

module.exports = { createTransactionSchema, updateTransactionSchema, transactionQuerySchema };
