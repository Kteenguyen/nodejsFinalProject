const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const userRoutes = require('./userRoute');


const productRoutes = require('./productRoute');
const cartRoutes = require('./cartRoute');
const orderRoutes = require('./orderRoute');
router.use('/api/cart', cartRoutes);
router.use('/api/orders', orderRoutes);

// Define routes
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
