const { z } = require('zod');

const uuidSchema = z.string().uuid('Invalid UUID format');

const transactionTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Type must be "income" or "expense"' }),
});

const frequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'], {
  errorMap: () => ({ message: 'Frequency must be weekly, biweekly, monthly, quarterly, or yearly' }),
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const pinSchema = z.string()
  .length(4, 'PIN must be exactly 4 digits')
  .regex(/^\d{4}$/, 'PIN must be exactly 4 digits');

module.exports = {
  uuidSchema,
  transactionTypeSchema,
  frequencySchema,
  dateSchema,
  pinSchema,
};
