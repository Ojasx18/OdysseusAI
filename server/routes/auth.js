const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  registerValidation,
  login,
  loginValidation,
  refresh,
  logout,
  me,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = Router();

// Auth-specific rate limiter: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
