const express = require('express');
const storeController = require('../controllers/store.controller');
const { submitRatingValidator } = require('../validators/rating.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Any authenticated user can view stores and their own ratings
router.get('/', authenticate, storeController.getStores);

// Only NORMAL_USER can submit or update store ratings
router.post(
  '/:id/rating',
  authenticate,
  authorize('NORMAL_USER'),
  validate(submitRatingValidator),
  storeController.submitRating
);

module.exports = router;
