const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary.js');
const { register, login, logout, googleLogin } = require('../controllers/authController.js');

const { protect } = require("../middleware/authMiddleware.js");

// === CÁC ROUTE CÔNG KHAI ===

// /api/auth/register
router.post('/register', upload.single('avatar'), register);
// /api/auth/login
router.post('/login', login);

// /api/auth/googleLogin
router.post('/googleLogin', googleLogin);

// === CÁC ROUTE CẦN XÁC THỰC ===
// 3. Sử dụng middleware 'protect' đúng cách (nó là một hàm)
// Route logout yêu cầu người dùng phải đăng nhập trước
router.post("/logout", protect, logout);

module.exports = router;