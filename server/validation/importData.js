const { z } = require('zod');
const { transactionTypeSchema, frequencySchema } = require('./common');

const importDataSchema = z.object({
  data: z.object({
    categories: z.array(z.object({
      name: z.string(),
      type: transactionTypeSchema,
      icon: z.string().optional(),
    })).optional(),
    transactions: z.array(z.object({
      amount: z.number(),
      type: transactionTypeSchema,
      categoryId: z.string(),
      date: z.string(),
      notes: z.string().optional(),
    })).optional(),
    recurring: z.array(z.object({
      name: z.string(),
      amount: z.number(),
      type: transactionTypeSchema,
      categoryId: z.string(),
      frequency: frequencySchema,
      startDate: z.string().optional(),
      notes: z.string().optional(),
    })).optional(),
  }),
  mode: z.enum(['merge', 'replace']).default('merge'),
});

module.exports = { importDataSchema };
