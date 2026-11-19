const express = require('express');
const adminController = require('../controllers/admin.controller');
const { createUserValidator } = require('../validators/user.validator');
const { createStoreValidator } = require('../validators/store.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all admin routes: must be authenticated with SYSTEM_ADMIN role
router.use(authenticate, authorize('SYSTEM_ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.post('/users', validate(createUserValidator), adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.get('/stores', adminController.getStores);
router.post('/stores', validate(createStoreValidator), adminController.createStore);
router.get('/unassigned-owners', adminController.getUnassignedOwners);

module.exports = router;
