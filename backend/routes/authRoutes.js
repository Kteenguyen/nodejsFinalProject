const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary.js');
const { register, login, logout, googleLogin, facebookLogin, checkSession } = require('../controllers/authController.js');

const { protect } = require("../middleware/authMiddleware.js");

// === CÁC ROUTE CÔNG KHAI ===

// /api/auth/register
router.post('/register', upload.single('avatar'), register);
// /api/auth/login
router.post('/login', login);

// /api/auth/googleLogin
router.post('/googleLogin', googleLogin);

// /api/auth/facebookLogin
router.post('/facebookLogin', facebookLogin);
// === CÁC ROUTE BẢO VỆ (CẦN ĐĂNG NHẬP) ===
router.get('/check-session', checkSession);
// /api/auth/logout
router.post("/logout", logout);
module.exports = router;