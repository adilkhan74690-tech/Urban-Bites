import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for admin login to prevent brute force password attacks
 * Allows maximum 15 login attempts per 15-minute window
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated test environments
});
