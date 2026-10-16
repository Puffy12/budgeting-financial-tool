/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse while allowing heavy usage
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 5000 requests per 15 minutes - generous for heavy usage
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for authentication endpoints
 * 100 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for data export endpoints
 * 100 requests per hour
 */
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    error: 'Too Many Requests',
    message: 'Too many export requests, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for write operations (POST, PUT, DELETE)
 * 300 requests per minute
 */
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  message: {
    error: 'Too Many Requests',
    message: 'Too many write requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  exportLimiter,
  writeLimiter
};
