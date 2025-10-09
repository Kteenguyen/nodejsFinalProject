// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // 1️⃣ Lấy token từ cookie hoặc header
        const token =
            req.cookies?.token ||
            (req.headers.authorization && req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(401).json({ message: "Chưa đăng nhập hoặc thiếu token" });
        }

        // 2️⃣ Xác minh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3️⃣ Gán thông tin user vào request để các route sau có thể dùng
        req.user = decoded;

        next();
    } catch (error) {
        console.error("❌ Lỗi xác thực:", error);
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};
