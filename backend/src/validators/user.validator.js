const { body } = require('express-validator');
const { passwordPattern } = require('./auth.validator');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(passwordPattern)
    .withMessage(
      'Password must be 8-16 characters long and include at least one uppercase letter and one special character'
    ),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Role must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER'),
];

module.exports = {
  createUserValidator,
};
