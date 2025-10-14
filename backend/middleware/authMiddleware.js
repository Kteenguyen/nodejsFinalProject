// FileName: middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

// 1️⃣ Middleware để xác thực token (bảo vệ route)
const protect = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers.authorization && req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(401).json({ message: "Chưa đăng nhập hoặc thiếu token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Gán thông tin user vào request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

// 2️⃣ Middleware để kiểm tra quyền admin

const admin = (req, res, next) => {
    // req.user được lấy từ token đã giải mã
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập, yêu cầu quyền Admin' });
    }
};

// 3️⃣ Export một object chứa cả hai hàm
module.exports = { protect, admin };