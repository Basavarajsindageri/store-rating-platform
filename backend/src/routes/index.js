const express = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const storeRoutes = require('./store.routes');
const ownerRoutes = require('./owner.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/owner', ownerRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
