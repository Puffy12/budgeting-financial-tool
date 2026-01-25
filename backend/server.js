/**
 * Budgeting App Server
 * 
 * Express server for managing personal budgets with JSON storage.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const recurringRouter = require('./routes/recurring');
const exportRouter = require('./routes/export');

// Import utilities
const db = require('./utils/db');
const { processRecurringTransactions } = require('./utils/recurringProcessor');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize database
db.initDb();

// Process recurring transactions on startup
processRecurringTransactions();

// Process recurring transactions every hour
setInterval(processRecurringTransactions, 60 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Budgeting App API',
    version: '1.0.0',
    description: 'API for managing personal budgets',
    endpoints: {
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:userId',
        create: 'POST /api/users',
        update: 'PUT /api/users/:userId',
        delete: 'DELETE /api/users/:userId'
      },
      categories: {
        list: 'GET /api/users/:userId/categories',
        get: 'GET /api/users/:userId/categories/:categoryId',
        create: 'POST /api/users/:userId/categories',
        update: 'PUT /api/users/:userId/categories/:categoryId',
        delete: 'DELETE /api/users/:userId/categories/:categoryId'
      },
      transactions: {
        list: 'GET /api/users/:userId/transactions',
        get: 'GET /api/users/:userId/transactions/:transactionId',
        create: 'POST /api/users/:userId/transactions',
        update: 'PUT /api/users/:userId/transactions/:transactionId',
        delete: 'DELETE /api/users/:userId/transactions/:transactionId'
      },
      recurring: {
        list: 'GET /api/users/:userId/recurring',
        get: 'GET /api/users/:userId/recurring/:recurringId',
        create: 'POST /api/users/:userId/recurring',
        update: 'PUT /api/users/:userId/recurring/:recurringId',
        delete: 'DELETE /api/users/:userId/recurring/:recurringId',
        process: 'POST /api/users/:userId/recurring/:recurringId/process'
      },
      export: {
        exportAll: 'GET /api/users/:userId/export',
        exportMonth: 'GET /api/users/:userId/export/month/:year/:month',
        import: 'POST /api/users/:userId/import'
      },
      stats: {
        summary: 'GET /api/users/:userId/stats/summary',
        monthly: 'GET /api/users/:userId/stats/monthly',
        comparison: 'GET /api/users/:userId/stats/comparison'
      }
    }
  });
});

// Mount API routes
app.use('/api/users', usersRouter);
app.use('/api/users/:userId/categories', categoriesRouter);
app.use('/api/users/:userId/transactions', transactionsRouter);
app.use('/api/users/:userId/recurring', recurringRouter);
app.use('/api/users/:userId', exportRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    hint: 'Visit /api for API documentation'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Budgeting App Server v1.0.0                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT.toString().padEnd(25)}║
║  API documentation: http://localhost:${PORT}/api                 ║
║  Health check:      http://localhost:${PORT}/health              ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
