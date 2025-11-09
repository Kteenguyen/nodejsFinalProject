// backend/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { OAuth2Client } = require('google-auth-library'); // 👈 Thêm import cho Google Client
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Cần thêm hàm sendEmail (Fen phải tự cài đặt, ví dụ dùng Nodemailer)
// const sendEmail = require('../utils/sendEmail');
// === CÁC HÀM HELPER (Túi giữ nguyên từ file của fen) ===
async function generateUuid() {
    return uuidv4();
}

// Hàm generateToken (nếu fen import từ utils thì tốt hơn)
const generateToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Ví dụ: 1 ngày
    });
};

const getCookieOptions = () => {
    const options = {
        httpOnly: true,
        secure: true, // 👈 Đã đúng (vì dùng HTTPS)
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        path: '/',
        sameSite: 'none' // 👈 BẮT BUỘC THÊM DÒNG NÀY
    };
    return options;
};

// --- HÀM LOGIN (Giữ nguyên từ file của fen) ---
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) return res.status(400).json({ message: 'Vui lòng cung cấp email/username và password.' });

        const user = await User.findOne({
            $or: [{ email: identifier }, { userName: identifier }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Email hoặc username không tồn tại.' });
        }

        if (user.provider.includes('google') || user.provider.includes('facebook')) {
            if (user.password === null) {
                return res.status(401).json({ message: `Tài khoản này được đăng ký qua ${user.provider.join(', ')}. Vui lòng đăng nhập bằng phương thức đó.` });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu.' });
        }

        const token = generateToken(user._id);
        res.cookie('jwt', token, getCookieOptions()); // 👈 SỬA: Đổi tên thành 'jwt'
        res.status(200).json({
            message: "Đăng nhập thành công!",
            user: {
                userId: user.userId,
                name: user.name,
                userName: user.userName,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                role: user.role,
                provider: user.provider
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- HÀM REGISTER (CẬP NHẬT 'provider' THÀNH MẢNG) ---
exports.register = async (req, res) => {
    try {
        const { name, userName, email, password } = req.body;
        if (!name || !userName || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: name, userName, email, password.' });
        }

        let user = await User.findOne({ $or: [{ email: email }, { userName: userName }] });
        if (user) {
            if (user.email === email) return res.status(400).json({ message: 'Email đã được sử dụng!' });
            if (user.userName === userName) return res.status(400).json({ message: 'Username đã được sử dụng!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserId = await generateUuid();

        let avatarUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "avatars",
                width: 150,
                crop: "scale"
            });
            avatarUrl = result.secure_url;
        }

        user = new User({
            userId: newUserId,
            name,
            userName,
            email,
            password: hashedPassword,
            avatar: avatarUrl,
            provider: ['local'], // 👈 CẬP NHẬT THÀNH MẢNG
            role: 'user',
        });

        await user.save();

        const token = generateToken(user._id);
        res.cookie('jwt', token, getCookieOptions()); // 👈 SỬA: Đổi tên thành 'jwt'
        res.status(201).json({
            message: "Đăng ký thành công!",
            user: {
                userId: user.userId,
                name: user.name,
                userName: user.userName,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                role: user.role,
                provider: user.provider
            },
            token
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// ... (các hàm khác như register, login,...)

// =============================================================
// === THAY THẾ TOÀN BỘ HÀM googleLogin CỦA BẠN BẰNG HÀM NÀY ===
// =============================================================
exports.googleLogin = async (req, res) => {

    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ message: 'Không có accessToken.' });
    }

    try {
        // 1. Dùng Access Token để lấy thông tin user từ Google
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { email, name, picture } = googleResponse.data;

        if (!email) {
            return res.status(400).json({ message: 'Không lấy được email từ Google.' });
        }

        let user = await User.findOne({ email: email });

        if (user) {
            // 5a. Nếu user tồn tại 
            if (!user.provider.includes('google')) {
                user.provider.push('google');
                await user.save();
            }
        } else {
            // 5b. Nếu user không tồn tại -> Tạo user mới
            const newUserId = await generateUuid();
            user = new User({
                userId: newUserId,
                email: email,
                name: name,
                userName: email.split('@')[0] + uuidv4().substring(0, 4),
                avatar: picture,
                provider: ['google'],
                password: await bcrypt.hash(uuidv4(), 10),
            });
            await user.save();
        }

        // 6. Tạo token JWT (local)
        const localToken = generateToken(user._id, user.email, user.role);
        const cookieOptions = getCookieOptions(); // 👈 Sẽ lấy hàm đã sửa ở trên

        res.cookie('jwt', localToken, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập Google thành công',
            user: user,
            token: localToken
        });

    } catch (error) {
        console.error("Lỗi xác thực Google (Access Token):", error.response?.data || error.message);
        // Gửi lỗi validation về frontend
        if (error.name === 'ValidationError') {
            return res.status(500).json({ message: error.message });
        }
        res.status(500).json({ message: error.response?.data?.error_description || error.message });
    }
};

// --- HÀM FACEBOOK LOGIN (CẬP NHẬT LOGIC LIÊN KẾT) ---
exports.facebookLogin = asyncHandler(async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        res.status(400);
        throw new Error('Không có access token từ Facebook.');
    }

    try {
        const fbResponse = await axios.get(
            `https://graph.facebook.com/me`,
            { params: { fields: 'id,name,email,picture.type(large)', access_token: accessToken } }
        );
        const { email, name, picture } = fbResponse.data;

        if (!email) {
            res.status(400);
            throw new Error('Tài khoản Facebook của bạn không được liên kết với email.');
        }

        const trimEmail = email.trim().toLowerCase();

        // === LOGIC LIÊN KẾT TÀI KHOẢN (MỚI) ===
        let user = await User.findOne({ email: trimEmail });

        if (user) {
            // 1. User đã tồn tại -> Kiểm tra và liên kết
            if (!user.provider.includes('facebook')) {
                user.provider.push('facebook');
                if (!user.avatar && picture?.data?.url) {
                    user.avatar = picture.data.url;
                }
                await user.save();
                console.log(`Đã liên kết Facebook với tài khoản: ${user.email}`);
            }
        } else {
            // 2. User chưa tồn tại -> Tạo mới
            console.log("User Facebook chưa tồn tại, tạo user mới:", trimEmail);
            const newUserId = await generateUuid();
            user = new User({
                userId: newUserId,
                name: name,
                userName: trimEmail.split('@')[0] + '_' + newUserId.substring(0, 4),
                email: trimEmail,
                password: null,
                avatar: picture?.data?.url || null,
                provider: ['facebook'], // 👈 Phải là mảng
                role: 'user',
            });
            await user.save();
        }
        // === KẾT THÚC LOGIC MỚI ===

        // 3. Đăng nhập
        const token = generateToken(user._id);
        res.cookie('jwt', token, getCookieOptions());
        res.status(200).json({
            message: 'Đăng nhập Facebook thành công!',
            user: {
                userId: user.userId,
                name: user.name,
                userName: user.userName,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                role: user.role,
                provider: user.provider
            },
            token: token
        });

    } catch (error) {
        console.error("Lỗi Facebook Login (Backend):", error.response?.data?.error || error.message);
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
            res.status(401);
            throw new Error('Facebook access token không hợp lệ hoặc đã hết hạn.');
        }
        throw error;
    }
});

// --- HÀM CHECK SESSION (Giữ nguyên từ file của fen) ---
exports.checkSession = asyncHandler(async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(200).json({ isAuthenticated: false, user: null });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
            return res.status(200).json({ isAuthenticated: true, user: user });
        } else {
            return res.status(200).json({ isAuthenticated: false, user: null });
        }
    } catch (error) {
        return res.status(200).json({ isAuthenticated: false, user: null });
    }
});
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy email.' });
    }

    // 1. Tạo Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save({ validateBeforeSave: false });

    // 2. Gửi Email (Phần này fen phải tự cài đặt)
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu reset mật khẩu. Vui lòng truy cập link sau: \n\n ${resetURL}`;

    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Yêu cầu reset mật khẩu FenShop',
        //     message
        // });
        console.log("GỬI EMAIL (CHƯA IMPLEMENT):", resetURL); // Tạm thời log ra console

        res.status(200).json({ success: true, message: 'Token đã được gửi tới email (kiểm tra console BE).' });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Lỗi khi gửi email.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    // 1. Hash token từ URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Tìm user
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() } // Token chưa hết hạn
    });

    if (!user) {
        return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu không khớp.' });
    }

    // 3. Đặt mật khẩu mới
    user.password = password;
    // (pre-save hook trong userModel sẽ tự động hash và xóa token)
    await user.save();

    res.status(200).json({ success: true, message: 'Reset mật khẩu thành công!' });
};
// --- HÀM LOGOUT (Giữ nguyên từ file của fen) ---
exports.logout = async (req, res) => {
    try {
        // Lấy cookie options đã sửa
        const clearOptions = getCookieOptions();

        // Ghi đè cookie cũ bằng cookie rỗng và hết hạn
        res.cookie('jwt', '', { ...clearOptions, maxAge: 0 });

        res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        res.cookie('jwt', '', { maxAge: 0, path: '/' }); // Xóa dự phòng
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng xuất' });
    }
};