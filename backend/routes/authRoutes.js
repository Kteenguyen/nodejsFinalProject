// FileName: routes/authRoutes.js

const express = require('express');
const router = express.Router();

// 1. Sửa lại cách import controller để đảm bảo các hàm tồn tại
const { register, login, logout } = require('../controllers/authController.js');

// 2. Sửa lại cách import middleware để lấy ra hàm 'protect'
const { protect } = require("../middleware/authMiddleware.js");

// === CÁC ROUTE CÔNG KHAI ===
router.post('/register', register);
router.post('/login', login);

// === CÁC ROUTE CẦN XÁC THỰC ===
// 3. Sử dụng middleware 'protect' đúng cách (nó là một hàm)
// Route logout yêu cầu người dùng phải đăng nhập trước
router.post("/logout", protect, logout);

module.exports = router;