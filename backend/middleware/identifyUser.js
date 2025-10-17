const jwt = require("jsonwebtoken");

/**
 * Middleware này sẽ cố gắng xác thực người dùng nếu có token.
 * Nếu không có token, nó sẽ bỏ qua và cho request đi tiếp.
 * Nếu có token nhưng token không hợp lệ, nó sẽ báo lỗi.
 */
const identifyUser = (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        // Nếu không có token, coi như là khách và cho đi tiếp
        if (!token) {
            return next();
        }

        // Nếu có token, giải mã và gán user vào request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        // Nếu token có vấn đề (hết hạn, không hợp lệ), báo lỗi
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

module.exports = identifyUser;