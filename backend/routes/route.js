const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoute');
const productRoutes = require('./productRoute');
const cartRoutes = require('./cartRoute');
const orderRoutes = require('./orderRoute');

//API user routes
router.use('/api/users', userRoutes);

// API cart routes
router.use('/api/cart', cartRoutes);

// API product routes
router.use('/api/products', productRoutes);

// API order routes
router.use('/api/orders', orderRoutes);

// Define root routes
router.get('/', (req, res) => {
    res.redirect('/home');
});

//route trang chủ
router.get('/home', (req, res) => {
    res.render('home');
});

// render trang login
router.get('/login', (req, res) => {
    res.render('login');
});

// Mount routes
router.use('/', userRoutes);

module.exports = router;
