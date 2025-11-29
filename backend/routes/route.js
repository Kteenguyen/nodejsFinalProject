// backend/routes/route.js
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');
const discountRoutes = require('./discountRoutes');
const adminRoutes = require('./adminRoutes');
const categoryRoutes = require('./categoryRoutes');

// ===========================================
// === LOGGING: ĐỂ XEM REQUEST ĐÃ VÀO ROUTE.JS CHƯA ===
router.use((req, res, next) => {
    console.log(`[ROUTE.JS]: Đã nhận request. Method: ${req.method}, URL: ${req.url}`);
    next();
});
// ===========================================

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/discounts', discountRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);

module.exports = router;