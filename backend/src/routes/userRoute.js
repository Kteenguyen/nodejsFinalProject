const express = require('express');
const router = express.Router();

const { register, login, googleLogin, updateProfile, changePassword, addShippingAddress } = require('../controllers/userControllersss
const auth = require('../middleware/auth');

// Auth
router.post('/register', register);
router.post('/login', login);
router.post('/auth/google', googleLogin);

// Me (protected)
router.put('/me/profile', auth, updateProfile);
router.put('/me/password', auth, changePassword);
router.post('/me/shipping-addresses', auth, addShippingAddress);

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


