const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, businessSignupSchema, businessLoginSchema, businessUpdateSchema } = require('../middleware/validation');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to login and signup
router.use('/login', authLimiter);
router.use('/signup', authLimiter);

// Public routes
router.post('/signup', validate(businessSignupSchema), signup);
router.post('/login', validate(businessLoginSchema), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validate(businessUpdateSchema), updateProfile);

module.exports = router;
