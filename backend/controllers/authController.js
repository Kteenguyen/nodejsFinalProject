// backend/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const generateToken = require('../utils/generateToken');
async function generateUuid() {
    return uuidv4();
}
const asyncHandler = require('express-async-handler'); // Nên dùng để bắt lỗi async
// === COOKIE OPTIONS (KHÔNG SET SAMESITE KHI DEV) ===
const getCookieOptions = () => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Chỉ true khi deploy HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày (ví dụ)
        path: '/',
    };
    if (process.env.NODE_ENV === 'production') {
        options.sameSite = 'Lax'; // Set Lax khi production
    }
    return options;
};
// --- HÀM LOGIN (SET COOKIE) ---
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        // ... (code tìm user, check password giữ nguyên) ...
        if (!identifier || !password) return res.status(400).json({ message: 'Vui lòng cung cấp email/username và mật khẩu.' });
        const user = await User.findOne({ $or: [{ email: identifier.trim().toLowerCase() }, { userName: identifier.trim() }] }).select('+password');
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        if (!user.password && user.provider !== 'local') return res.status(401).json({ message: 'Tài khoản này được đăng ký qua Google.' }); // Hoặc provider khác
        if (user.provider === 'local') {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        const token = jwt.sign(
            { id: user.userId, email: user.email, isAdmin: user.isAdmin, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '1d' }
        );

        // 👇 SET COOKIE THAY VÌ TRẢ TOKEN
        res.cookie('token', token, getCookieOptions());

        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            user: {
                id: user.userId, // Sửa thành id cho khớp payload
                token: token,
                name: user.name,
                userName: user.userName,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                role: user.role,
                provider: user.provider

            }
        });

    } catch (error) {
        console.error("Login Error (Backend):", error.message);
        return res.status(500).json({ error: error.message });
    }
};

exports.register = asyncHandler(async (req, res) => {
    console.log("📥 Body nhận từ frontend:", req.body);
    console.log("📁 File nhận từ frontend:", req.file);

    const { name, userName, email, password, phoneNumber, dateOfBirth } = req.body;
    const trimUsername = userName?.trim();
    const trimEmail = email?.trim().toLowerCase();

    if (!name || !trimUsername || !password || !trimEmail) {
        res.status(400);
        throw new Error("Thiếu thông tin bắt buộc (tên, username, email, password).");
    }

    // Check trùng
    const existingUser = await User.findOne({ email: trimEmail });
    if (existingUser) {
        res.status(400);
        throw new Error('Email đã được sử dụng!');
    }
    const existingUsername = await User.findOne({ userName: trimUsername });
    if (existingUsername) {
        res.status(400);
        throw new Error('Tên đăng nhập đã được sử dụng!');
    }

    let avatarUrl = null;
    if (req.file) {
        avatarUrl = req.file.path;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = await generateUuid(); // Tạo UUID

    const newUser = new User({
        userId: newUserId, // Dùng UUID
        name,
        userName: trimUsername,
        password: hashedPassword,
        email: trimEmail,
        phoneNumber: phoneNumber || null,
        dateOfBirth: dateOfBirth || null,
        avatar: avatarUrl,
        provider: 'local'
    });

    const savedUser = await newUser.save();

    if (savedUser) {
        // --- LOGIC MỚI: TỰ ĐỘNG LOGIN SAU KHI ĐĂNG KÝ ---
        // 1. Tạo Token
        const token = generateToken(
            savedUser.userId, // Dùng userId (UUID)
            savedUser.email,
            savedUser.isAdmin,
            savedUser.role
        );

        // 2. Set Cookie
        res.cookie('token', token, getCookieOptions());

        // 3. Trả về thông tin user (giống hệt hàm login)
        console.log("✅ Đăng ký VÀ ĐĂNG NHẬP thành công cho user:", savedUser.email);
        res.status(201).json({
            message: 'Đăng ký thành công!',
            user: {
                userId: savedUser.userId,
                name: savedUser.name,
                userName: savedUser.userName,
                email: savedUser.email,
                avatar: savedUser.avatar,
                isAdmin: savedUser.isAdmin,
                role: savedUser.role,
                provider: savedUser.provider
            },
            token: token
        });
    } else {
        res.status(400);
        throw new Error('Đăng ký thất bại, dữ liệu không hợp lệ.');
    }
});

// ... (code googleLogin, logout) ...

exports.googleLogin = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        res.status(400);
        throw new Error('Thiếu accessToken.');
    }

    try {
        // Lấy thông tin user từ Google
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const payload = googleResponse.data;

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || payload.given_name || '';
        const avatar = payload.picture || null;

        if (!email) {
            res.status(400);
            throw new Error('Không lấy được email từ Google.');
        }

        // Tìm user trong DB
        let user = await User.findOne({ email });
        let isNewUser = false;

        // Nếu user chưa tồn tại -> Tạo user mới
        if (!user) {
            isNewUser = true;
            // Tạo username mặc định (cần đảm bảo không trùng, có thể thêm số ngẫu nhiên)
            let baseUsername = email.split('@')[0] || `user_${Date.now()}`;
            let finalUsername = baseUsername;
            let counter = 1;
            while (await User.findOne({ userName: finalUsername })) {
                finalUsername = `${baseUsername}${counter}`;
                counter++;
            }

            user = new User({
                userId: await generateUuid(), // Đảm bảo hàm generateUuid tồn tại và trả về UUID string
                userName: finalUsername,
                password: await bcrypt.hash(await generateUuid(), 10), // Tạo password ngẫu nhiên
                email,
                name,
                avatar,
                provider: 'google',
                googleId,
                role: 'user', // Gán role mặc định
                isAdmin: false, // Mặc định không phải admin
                phoneNumber: null,
                dateOfBirth: null
            });
            await user.save();
            console.log("Google Login: Đã tạo user mới:", user.email);
        } else {
            // Nếu user đã tồn tại, cập nhật thông tin nếu cần (ví dụ: googleId, avatar)
            const update = {};
            if (!user.googleId && googleId) update.googleId = googleId;
            if (user.provider !== 'google') update.provider = 'google';
            if (!user.avatar && avatar) update.avatar = avatar; // Chỉ cập nhật nếu avatar chưa có

            if (Object.keys(update).length > 0) {
                Object.assign(user, update); // Gán các thay đổi
                await user.save();
                console.log("Google Login: Đã cập nhật thông tin user:", update);
            }
        }

        // --- Đảm bảo user đã có giá trị ở đây ---
        if (!user) {
            // Trường hợp cực hiếm sau khi tạo/tìm
            res.status(500);
            throw new Error('Không thể tìm hoặc tạo người dùng.');
        }

        // Tạo token cho user (mới hoặc cũ)
        // QUAN TRỌNG: Truyền đúng ID (userId hoặc _id) vào generateToken
        const token = generateToken(user.userId || user._id, user.email, user.isAdmin, user.role);

        // Set cookie
        res.cookie('token', token, getCookieOptions()); // Đảm bảo hàm getCookieOptions tồn tại

        // Trả về response (bao gồm cả token)
        const statusCode = isNewUser ? 201 : 200;
        const message = isNewUser ? 'Tạo tài khoản Google và đăng nhập thành công!' : 'Đăng nhập Google thành công!';

        res.status(statusCode).json({
            message: message,
            user: {
                id: user.userId || user._id, // Trả về ID đúng
                name: user.name,
                userName: user.userName,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                role: user.role,
                provider: user.provider
            },
            token: token // TRẢ TOKEN VỀ CHO FRONTEND
        });

    } catch (error) {
        // Xử lý lỗi từ Google API (ví dụ: token hết hạn)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            res.status(401);
            throw new Error('Google access token không hợp lệ hoặc đã hết hạn.');
        }
        // Ném lỗi để asyncHandler hoặc error handler bắt
        console.error("Lỗi Google Login (Backend):", error.message);
        throw error; // Ném lỗi để middleware error handler xử lý
    }
});
// --- HÀM LOGOUT (CLEAR COOKIE) ---
exports.logout = async (req, res) => {
    try {
        const clearOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/', // <-- THÊM DÒNG NÀY
        };
        if (process.env.NODE_ENV === 'production') {
            clearOptions.sameSite = 'Lax';
        }

        res.clearCookie('token', clearOptions);

        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        console.error("Logout Error (Backend):", error.message);
        res.status(500).json({ error: error.message });
    }
};