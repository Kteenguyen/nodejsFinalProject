const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, addShippingAddress } = require('../controllers/userControllers');
const auth = require('../middleware/auth');
const User = require('../models/userModel');



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


