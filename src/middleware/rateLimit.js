const rateLimit = require('express-rate-limit');

// Define rate limiter (max 100 requests per hour)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = limiter;
