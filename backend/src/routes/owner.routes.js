const express = require('express');
const ownerController = require('../controllers/owner.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Only STORE_OWNER can access owner routes
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', ownerController.getOwnerDashboard);
router.get('/ratings', ownerController.getStoreRatings);

module.exports = router;
