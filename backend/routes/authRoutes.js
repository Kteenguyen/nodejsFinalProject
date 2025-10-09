//authRoutes.js
const { register, login, logout } = require('../controllers/authController.js');
const authMiddleware = require("../middleware/authMiddleware.js");
const express = require('express');

const router = express.Router();

// Auth
router.post('/register', register);
router.post('/login', login);
router.post("/logout", authMiddleware, logout);

// router.post('/google', googleLogin);
module.exports = router;