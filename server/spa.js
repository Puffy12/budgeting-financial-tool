const path = require('path');

const frontendRoutes = ['/', '/app', '/dashboard', '/transactions', '/recurring', '/categories', '/breakdown', '/settings'];

function attachSpa(app, distPath) {
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) return next();
    if (req.path.includes('/download') || req.path.includes('/export')) return next();

    const isFrontendRoute = frontendRoutes.some((route) =>
      req.path === route || (route !== '/' && req.path.startsWith(route + '/'))
    );
    if (!isFrontendRoute && req.path !== '/') return next();

    const acceptHeader = req.get('Accept') || '';
    const isXHR = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest';
    const wantsJson = acceptHeader.includes('application/json');
    const wantsHtml = acceptHeader.includes('text/html');
    if (isXHR || wantsJson || !wantsHtml) return next();

    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

function attachStatic(app, distPath) {
  const express = require('express');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        hint: 'Visit /api for API documentation',
      });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

module.exports = { attachSpa, attachStatic };
