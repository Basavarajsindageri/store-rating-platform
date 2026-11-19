const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
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

module.exports = router;
