//route.js
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');
const discountRoutes = require('./discountRoutes');
// Mount routes
router.use('/auth', authRoutes);

//API user routes
router.use('/users', userRoutes);

// API cart routes
router.use('/cart', cartRoutes);

// API product routes
router.use('/products', productRoutes);

// API order routes
router.use('/orders', orderRoutes);

// API discount routes
router.use('/discounts', discountRoutes);

module.exports = router;
