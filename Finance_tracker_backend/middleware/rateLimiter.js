const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const CONFIG = require('../config/config');

const getClientKey = (req) => {
  // With app.set('trust proxy', 1) this is proxy-safe.
  return ipKeyGenerator(req);
};

const createRateLimiter = (windowMs, max, message) => {
  if (CONFIG.isTest) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,
    keyGenerator: getClientKey,
    skip: (req) => req.path === '/api/health' || req.path === '/api/health/db' || req.path === '/api',
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Auth rate limit (stricter for login/register)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 auth requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Password reset rate limit
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // limit each IP to 3 password reset requests per hour
  'Too many password reset attempts, please try again later.'
);

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter
};
