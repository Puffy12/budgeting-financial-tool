const apiInfo = {
  name: 'Budgeting App API',
  version: '1.0.0',
  description: 'API for managing personal budgets',
  endpoints: {
    users: {
      list: 'GET /api/users',
      get: 'GET /api/users/:userId',
      create: 'POST /api/users',
      update: 'PUT /api/users/:userId',
      delete: 'DELETE /api/users/:userId',
    },
    categories: {
      list: 'GET /api/users/:userId/categories',
      get: 'GET /api/users/:userId/categories/:categoryId',
      create: 'POST /api/users/:userId/categories',
      update: 'PUT /api/users/:userId/categories/:categoryId',
      delete: 'DELETE /api/users/:userId/categories/:categoryId',
    },
    transactions: {
      list: 'GET /api/users/:userId/transactions',
      get: 'GET /api/users/:userId/transactions/:transactionId',
      create: 'POST /api/users/:userId/transactions',
      update: 'PUT /api/users/:userId/transactions/:transactionId',
      delete: 'DELETE /api/users/:userId/transactions/:transactionId',
    },
    recurring: {
      list: 'GET /api/users/:userId/recurring',
      get: 'GET /api/users/:userId/recurring/:recurringId',
      create: 'POST /api/users/:userId/recurring',
      update: 'PUT /api/users/:userId/recurring/:recurringId',
      delete: 'DELETE /api/users/:userId/recurring/:recurringId',
      process: 'POST /api/users/:userId/recurring/:recurringId/process',
    },
    export: {
      exportAll: 'GET /api/users/:userId/export',
      exportMonth: 'GET /api/users/:userId/export/month/:year/:month',
      import: 'POST /api/users/:userId/import',
    },
    stats: {
      summary: 'GET /api/users/:userId/stats/summary',
      monthly: 'GET /api/users/:userId/stats/monthly',
      comparison: 'GET /api/users/:userId/stats/comparison',
    },
  },
};

module.exports = apiInfo;
