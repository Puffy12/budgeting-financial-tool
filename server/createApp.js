const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const recurringRouter = require('./routes/recurring');
const exportRouter = require('./routes/export');
const budgetsRouter = require('./routes/budgets');
const authRouter = require('./routes/auth');
const db = require('./db');
const { processRecurringTransactions } = require('./services/recurringProcessor');
const { apiLimiter, authLimiter, writeLimiter } = require('./middleware/rateLimiter');
const { requireAuth, requireOwnership } = require('./middleware/pinAuth');
const apiInfo = require('./apiInfo');
const { attachSpa, attachStatic } = require('./spa');

function createApp() {
  const app = express();
  const port = Number(process.env.PORT) || 3001;
  const distPath = path.join(__dirname, '..', 'dist');
  const hasFrontend = fs.existsSync(distPath);
  const isProduction = process.env.NODE_ENV === 'production';
  const devMode = process.env.DEV_MODE === 'true' && !isProduction;

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  const allowedOrigins = isProduction
    ? [process.env.CORS_ORIGIN || `http://localhost:${port}`]
    : ['http://localhost:5173', 'http://127.0.0.1:5173', `http://localhost:${port}`, `http://127.0.0.1:${port}`];
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/api', apiLimiter);
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return writeLimiter(req, res, next);
    next();
  });
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  db.initDb();
  processRecurringTransactions();
  setInterval(processRecurringTransactions, 60 * 60 * 1000);

  app.use('/api/auth', authLimiter);
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
  });
  app.get('/api', (req, res) => res.json(apiInfo));
  if (!hasFrontend) app.get('/', (req, res) => res.json(apiInfo));
  if (hasFrontend) attachSpa(app, distPath);

  app.use('/api/auth', authRouter);
  app.use('/api/users/:userId/categories', requireAuth, requireOwnership, categoriesRouter);
  app.use('/api/users/:userId/transactions', requireAuth, requireOwnership, transactionsRouter);
  app.use('/api/users/:userId/recurring', requireAuth, requireOwnership, recurringRouter);
  app.use('/api/users/:userId/budgets', requireAuth, requireOwnership, budgetsRouter);
  app.use('/api/users/:userId', requireAuth, requireOwnership, exportRouter);
  app.use('/api/users', requireAuth, usersRouter);

  if (hasFrontend) {
    attachStatic(app, distPath);
  } else {
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        hint: 'Visit /api for API documentation',
      });
    });
  }

  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    });
  });

  return { app, port, hasFrontend, isProduction, devMode };
}

module.exports = { createApp };
