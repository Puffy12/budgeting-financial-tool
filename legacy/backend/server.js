/**
 * Budgeting App Server
 * 
 * Express server for managing personal budgets with JSON storage.
 */

// Load environment variables
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const recurringRouter = require('./routes/recurring');
const exportRouter = require('./routes/export');
const authRouter = require('./routes/auth');

// Import utilities
const db = require('./utils/db');
const { processRecurringTransactions } = require('./utils/recurringProcessor');

// Import middleware
const { apiLimiter, authLimiter, writeLimiter } = require('./middleware/rateLimiter');

// PIN auth is imported below with route mounting

const app = express();
const PORT = process.env.PORT || 3001;

// Check if frontend dist folder exists
const distPath = path.join(__dirname, 'dist');
const hasFrontend = fs.existsSync(distPath);

// Production mode check
const isProduction = process.env.NODE_ENV === 'production';

// Development mode - disables authentication for local testing
const DEV_MODE = process.env.DEV_MODE === 'true' && !isProduction;

// Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Middleware
const allowedOrigins = isProduction
  ? [process.env.CORS_ORIGIN || `http://localhost:${PORT}`]
  : ['http://localhost:5173', `http://localhost:${PORT}`];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Apply stricter rate limiting to write operations
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});

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

// Apply auth limiter to auth endpoints
app.use('/api/auth', authLimiter);

// ============ Health & API Info ============

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
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
};

app.get('/api', (req, res) => {
  res.json(apiInfo);
});

// Also serve API info at / if no frontend
if (!hasFrontend) {
  app.get('/', (req, res) => {
    res.json(apiInfo);
  });
}

// ============ SPA Navigation Handler ============

// SPA navigation handler - serve index.html for browser navigation to frontend routes
// This must come BEFORE the API routes to intercept browser navigation requests
if (hasFrontend) {
  // Frontend routes that should serve the SPA
  const frontendRoutes = ['/', '/app', '/dashboard', '/transactions', '/recurring', '/categories', '/breakdown', '/settings'];
  
  app.use((req, res, next) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip file/download endpoints
    if (req.path.includes('/download') || req.path.includes('/export')) {
      return next();
    }
    
    // Check if this is a frontend route (or sub-route)
    const isFrontendRoute = frontendRoutes.some(route => 
      req.path === route || (route !== '/' && req.path.startsWith(route + '/'))
    );
    
    if (!isFrontendRoute && req.path !== '/') {
      return next();
    }
    
    // Detect if this is an API call vs browser navigation
    const acceptHeader = req.get('Accept') || '';
    const isXHR = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest';
    const wantsJson = acceptHeader.includes('application/json');
    const wantsHtml = acceptHeader.includes('text/html');
    
    // If it's clearly an API request, let it through
    if (isXHR || wantsJson || !wantsHtml) {
      return next();
    }
    
    // Browser navigation - serve the SPA
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ============ API Routes ============

// Mount API routes
const { requireAuth, requireOwnership } = require('./middleware/pinAuth');

app.use('/api/auth', authRouter);
app.use('/api/users/:userId/categories', requireAuth, requireOwnership, categoriesRouter);
app.use('/api/users/:userId/transactions', requireAuth, requireOwnership, transactionsRouter);
app.use('/api/users/:userId/recurring', requireAuth, requireOwnership, recurringRouter);
app.use('/api/users/:userId', requireAuth, requireOwnership, exportRouter);
app.use('/api/users', requireAuth, usersRouter);

// ============ Static Files & SPA Fallback ============

// Serve frontend static files if dist folder exists
if (hasFrontend) {
  // Serve static assets from dist
  app.use(express.static(distPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        hint: 'Visit /api for API documentation'
      });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // 404 handler (API only mode)
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      hint: 'Visit /api for API documentation'
    });
  });
}

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
  const frontendStatus = hasFrontend ? 'Serving from /dist' : 'Not deployed';
  const modeStatus = isProduction ? 'Production' : 'Development';
  const authStatus = DEV_MODE ? 'DISABLED (DEV_MODE)' : 'PIN Auth (14-day tokens)';

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Budgeting App Server v1.0.0                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT.toString().padEnd(25)}║
║  API documentation: http://localhost:${PORT}/api                 ║
║  Health check:      http://localhost:${PORT}/health              ║
║  Mode:              ${modeStatus.padEnd(41)}║
║  Frontend:          ${frontendStatus.padEnd(41)}║
║  Auth:              ${authStatus.padEnd(41)}║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  if (DEV_MODE) {
    console.log('⚠️  WARNING: DEV_MODE is enabled - authentication is disabled!');
    console.log('   Do NOT use DEV_MODE=true in production.\n');
  }
});

module.exports = app;
