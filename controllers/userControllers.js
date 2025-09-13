// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLoginPage = (req, res) => {
    res.render('login'); // Render the login view
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Successful login: establish session or generate JWT
        req.session.userId = user._id; // Example using express-session
        res.redirect('/dashboard'); // Redirect to a protected route

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};