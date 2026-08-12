const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Please try again later.' },
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many vote attempts. Please slow down.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

module.exports = { authLimiter, voteLimiter, generalLimiter };
