// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require('../models/userModel'); 
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Tìm cookie tên 'jwt' (Đã đúng)
    if (req.cookies && req.cookies.jwt) { 
        token = req.cookies.jwt; 
    }

    if (!token) {
        // (Lỗi 401 "jwt must be provided" là do cookie bị chặn)
        res.status(401);
        throw new Error('Không được ủy quyền, không có token (jwt must be provided)');
    }

    try {
        // 2. Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // === SỬA LỖI: 'user is not defined' ===
        // 1. Khai báo 'user' bằng 'const'
        const user = await User.findById(decoded.id).select('-password'); 
        
        // 2. Kiểm tra 'user' (thay vì 'req.user')
        if (!user) {
             res.status(401);
             throw new Error('Người dùng không tồn tại hoặc đã bị xóa.');
        }

        // 3. Gán 'user' vào 'req.user'
        req.user = user; 
        // ======================================
        
        next(); // Chuyển sang controller tiếp theo

    } catch (error) {
        console.error("--- DEBUG protect middleware: Lỗi xác minh token ---");
        console.error("Lỗi:", error.message);
        res.status(401);
        throw new Error('Token không hợp lệ.');
    }
});

// (Hàm admin của bạn giữ nguyên)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { 
        next();
    } else {
        res.status(403);
        throw new Error('Không có quyền Admin.');
    }
};

module.exports = { protect, admin };