const express = require('express');
const router = express.Router();
const {register, login} = require('../controllers/userControllers');
const User = require('../models/userModel');

// Define routes
router.get('/', (req, res) => {
    res.redirect('/home');
});

//route trang chủ
router.get('/home', (req, res) => {
    res.render('home');
});

//route đăng ký
router.post('/register', register);

//route đăng nhập
router.post('/login', login);

//route quản lý người dùng
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
