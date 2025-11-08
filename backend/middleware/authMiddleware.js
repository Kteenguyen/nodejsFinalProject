// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require('../models/userModel'); // Nên import User để check user tồn tại
const asyncHandler = require('express-async-handler');
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Kiểm tra nếu có token trong cookie
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // --- LOGIC QUAN TRỌNG: NẾU KHÔNG CÓ TOKEN, TRẢ VỀ 401 NGAY LẬP TỨC ---
    // if (!token) {
    //     console.log("🚫 protect: Không tìm thấy token trong cookie. Trả về 401.");
    //     res.status(401);
    //     throw new Error('Không được ủy quyền, không có token'); // Lỗi này sẽ được error handler bắt
    // }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("🔑 protect: Token hợp lệ! Payload:", decoded);
        console.log("🔑 protect: Token hợp lệ!");

        // 2. Tìm user trong DB bằng ID từ token
        // QUAN TRỌNG: Đảm bảo 'id' trong decoded.id khớp với field ID trong User model (userId hoặc _id)
        const user = await User.findOne({ userId: decoded.id }).select('-password'); // Hoặc User.findById(decoded.id)

        if (!user) {
            console.log("❌ protect: User từ token không còn tồn tại trong DB. Trả về 401.");
            // Xóa cookie cũ nếu user không tồn tại để tránh vòng lặp lỗi
            res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.status(401);
            throw new Error('Người dùng không tồn tại hoặc đã bị xóa.');
        }

        req.user = user; // Gán user đầy đủ vào req
        next(); // Chuyển sang middleware/controller tiếp theo

    } catch (error) {
        console.error("--- DEBUG protect middleware: Lỗi xác minh token ---");
        console.error("Lỗi:", error.message);

        // Xóa token bị lỗi để frontend không gửi lại
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Token đã hết hạn.');
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Token không hợp lệ.');
        } else {
            res.status(401);
            throw new Error('Không được ủy quyền, lỗi xác thực token khác.');
        }
    }
});

const admin = (req, res, next) => {
    // Check isAdmin từ req.user đã lấy từ DB
    if (req.user && req.user.isAdmin) {
        console.log("👑 Check Admin: Oke!");
        next();
    } else {
        console.log("⛔ Check Admin: Hong phải admin!");
        res.status(403).json({ message: '403 Forbidden: Hong có quyền admin!' });
    }
};

module.exports = { protect, admin };