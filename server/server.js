const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createApp } = require('./createApp');

const { app, port, hasFrontend, isProduction, devMode } = createApp();

app.listen(port, '0.0.0.0', () => {
  const frontendStatus = hasFrontend ? 'Serving from /dist' : 'Not deployed';
  const modeStatus = isProduction ? 'Production' : 'Development';
  const authStatus = devMode ? 'DISABLED (DEV_MODE)' : 'PIN Auth (365-day tokens)';
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              Budgeting App Server v1.0.0                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${port.toString().padEnd(25)}║
║  API documentation: http://localhost:${port}/api                 ║
║  Health check:      http://localhost:${port}/health              ║
║  Mode:              ${modeStatus.padEnd(41)}║
║  Frontend:          ${frontendStatus.padEnd(41)}║
║  Auth:              ${authStatus.padEnd(41)}║
╚═══════════════════════════════════════════════════════════════╝
  `);
  if (devMode) {
    console.log('⚠️  WARNING: DEV_MODE is enabled - authentication is disabled!');
    console.log('   Do NOT use DEV_MODE=true in production.\n');
  }
});

module.exports = app;
