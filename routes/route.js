const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Define routes
router.get('/', (req, res) => {
    res.redirect('/home');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

//xử lý đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // Lấy email và password từ request body

    try {
        // Tìm người dùng trong database
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            // Nếu mật khẩu khớp, chuyển hướng đến trang home
            res.redirect('/home');
        } else {
            // Nếu không khớp, trả về lỗi
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
