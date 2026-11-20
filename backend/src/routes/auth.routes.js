const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// General auth rate limiter (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Strict rate limiter for password reset (5 requests per 15 min per IP in production)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP, please try again after 15 minutes',
  },
});

router.post('/register', authLimiter, validate(registerValidator), authController.register);
router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.get('/me', authenticate, authController.getMe);
router.put(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  authController.changePassword
);

// Password Reset endpoints
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordValidator),
  authController.forgotPassword
);

router.get('/verify-reset-token/:token', authController.verifyResetToken);

router.post(
  '/reset-password/:token',
  passwordResetLimiter,
  validate(resetPasswordValidator),
  authController.resetPassword
);

// Dev token retrieval for automated tests (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  router.get('/dev-token', authController.getDevToken);
}

module.exports = router;
