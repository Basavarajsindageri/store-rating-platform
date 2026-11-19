const { body } = require('express-validator');

const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid store email address'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required')
    .isLength({ max: 400 })
    .withMessage('Store address cannot exceed 400 characters'),
  body('owner_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Owner ID must be a valid integer ID'),
];

module.exports = {
  createStoreValidator,
};
