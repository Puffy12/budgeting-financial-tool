const { z } = require('zod');

const saveBudgetSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().finite().nonnegative(),
});

module.exports = { saveBudgetSchema };
