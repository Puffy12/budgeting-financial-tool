/**
 * Zod Validation Schemas
 * Centralized validation for all API endpoints
 */

const { z } = require('zod');

// ============ Common Schemas ============

const uuidSchema = z.string().uuid('Invalid UUID format');

const transactionTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Type must be "income" or "expense"' })
});

const frequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'], {
  errorMap: () => ({ message: 'Frequency must be weekly, biweekly, monthly, quarterly, or yearly' })
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// ============ User Schemas ============

const createUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim()
});

const updateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim()
});

// ============ Category Schemas ============

const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  type: transactionTypeSchema,
  icon: z.string().max(50).optional()
});

const updateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim()
    .optional(),
  type: transactionTypeSchema.optional(),
  icon: z.string().max(50).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// ============ Transaction Schemas ============

const createTransactionSchema = z.object({
  amount: z.number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large'),
  type: transactionTypeSchema,
  categoryId: uuidSchema,
  date: dateSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
});

const updateTransactionSchema = z.object({
  amount: z.number()
    .positive('Amount must be a positive number')
    .max(999999999, 'Amount is too large')
    .optional(),
  type: transactionTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  date: dateSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// ============ Recurring Schemas ============

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
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
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
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

// ============ Import/Export Schemas ============

const importDataSchema = z.object({
  data: z.object({
    categories: z.array(z.object({
      name: z.string(),
      type: transactionTypeSchema,
      icon: z.string().optional()
    })).optional(),
    transactions: z.array(z.object({
      amount: z.number(),
      type: transactionTypeSchema,
      categoryId: z.string(),
      date: z.string(),
      notes: z.string().optional()
    })).optional(),
    recurring: z.array(z.object({
      name: z.string(),
      amount: z.number(),
      type: transactionTypeSchema,
      categoryId: z.string(),
      frequency: frequencySchema,
      startDate: z.string().optional(),
      notes: z.string().optional()
    })).optional()
  }),
  mode: z.enum(['merge', 'replace']).default('merge')
});

// ============ Query Parameter Schemas ============

const transactionQuerySchema = z.object({
  month: z.string().transform(Number).pipe(z.number().int().min(0).max(11)).optional(),
  year: z.string().transform(Number).pipe(z.number().int().min(2000).max(2100)).optional(),
  type: transactionTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(1000)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional()
});

const recurringQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

const monthlyQuerySchema = z.object({
  months: z.string().transform(Number).pipe(z.number().int().min(1).max(36)).optional()
});

// ============ Auth Schemas ============

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
  // Common
  uuidSchema,
  transactionTypeSchema,
  frequencySchema,
  dateSchema,
  
  // User
  createUserSchema,
  updateUserSchema,
  
  // Category
  createCategorySchema,
  updateCategorySchema,
  
  // Transaction
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  
  // Recurring
  createRecurringSchema,
  updateRecurringSchema,
  recurringQuerySchema,
  
  // Import/Export
  importDataSchema,
  
  // Stats
  monthlyQuerySchema,
  
  // Auth
  loginSchema,
  refreshTokenSchema
};
