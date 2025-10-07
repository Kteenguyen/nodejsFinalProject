//authRoutes.js
const { register, login } = require('../controllers/authController.js');
const express = require('express');

const router = express.Router();

// Auth
router.post('/register', register);
router.post('/login', login);

// router.post('/google', googleLogin);
module.exports = router;