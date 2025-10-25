const User = require('../models/userModel'); // Đảm bảo đường dẫn này đúng
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
// Bạn sẽ cần cloudinary và multer-storage-cloudinary
// Hãy cài đặt chúng: npm install cloudinary multer-storage-cloudinary
// Và cài đặt multer (nếu chưa có): npm install multer
const cloudinary = require('cloudinary').v2;

async function generateUuid() {
    return uuidv4();
}

// =================================================================
// CẬP NHẬT HÀM REGISTER
// =================================================================
exports.register = async (req, res) => {
    try {
        // Khi dùng FormData (để upload ảnh),
        // các trường text sẽ nằm trong req.body, còn file nằm trong req.file
        console.log("📥 Body nhận từ frontend:", req.body);
        console.log("📁 File nhận từ frontend:", req.file); // Đây là file ảnh
        
        // Lấy dữ liệu từ req.body
        const {
            name,
            userName,
            email,
            password,
            phoneNumber, // <-- LẤY TRƯỜNG MỚI
            age          // <-- LẤY TRƯỜNG MỚI
        } = req.body;

        // Chuẩn hóa và kiểm tra dữ liệu cơ bản
        const trimUsername = userName?.trim();
        const trimEmail = email?.trim().toLowerCase();

        if (!name || !trimUsername || !password || !trimEmail) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc (tên, username, email, password)." });
        }

        // Kiểm tra email
        const existingUser = await User.findOne({ email: trimEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Xử lý avatar (nếu có file upload)
        let avatarUrl = null; // Mặc định là null
        if (req.file) {
            // req.file.path chính là URL an toàn (secure_url)
            // mà Cloudinary trả về (do đã cấu hình ở route)
            avatarUrl = req.file.path; 
            console.log("URL Avatar từ Cloudinary:", avatarUrl);
        }

        // Tạo user mới với đầy đủ thông tin
        const newUser = new User({
            userId: await generateUuid(),
            name,
            userName: trimUsername,
            password: hashedPassword,
            email: trimEmail,
            phoneNumber: phoneNumber || null, // Lưu null nếu không nhập
            age: age ? Number(age) : null, // Chuyển đổi age sang Number, lưu null nếu không nhập
            avatar: avatarUrl, // Lưu URL ảnh (nếu có) hoặc null
            provider: 'local' // Đánh dấu là tài khoản đăng ký thường
        });

        await newUser.save();

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error("Lỗi đăng ký:", error.message);
        // Nếu có lỗi, chúng ta nên thử xóa ảnh đã upload lên Cloudinary (nếu có)
        if (req.file) {
            try {
                // req.file.filename là public_id (do đã cấu hình ở route)
                await cloudinary.uploader.destroy(req.file.filename);
                console.log("Đã xóa ảnh trên Cloudinary do đăng ký thất bại.");
            } catch (cleanupError) {
                console.error("Lỗi khi dọn dẹp ảnh Cloudinary:", cleanupError);
            }
        }
        res.status(500).json({ error: error.message });
    }
};
// đang nhập
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email/username và mật khẩu.' });
        }

        // Tìm user, nhưng phải lấy cả password (vì model có thể đang select: false)
        const user = await User.findOne({
            $or: [
                { email: identifier.trim().toLowerCase() },
                { userName: identifier.trim() }
            ]
        }).select('+password'); // Đảm bảo lấy password để so sánh

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // Kiểm tra nếu user đăng ký bằng Google/Facebook mà chưa có mật khẩu
        if (!user.password && user.provider !== 'local') {
             return res.status(401).json({ message: 'Tài khoản này được đăng ký qua Google/Facebook. Vui lòng đăng nhập bằng Google/Facebook.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        const token = jwt.sign(
            { id: user.userId, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Bạn có thể tăng thời gian này, ví dụ '1d' hoặc '7d'
        );

        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: { // Trả về thông tin user an toàn (không có password)
                id: user.userId,
                name: user.name,
                userName: user.userName,
                email: user.email,
                isAdmin: user.isAdmin,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Đăng xuất (Giữ nguyên)
exports.logout = async (req, res) => {
    try {
        // (Nếu dùng JWT qua cookie, bạn sẽ clearCookie ở đây)
        // res.clearCookie("token"); 
        
        // Vì đang dùng localStorage (theo AuthController.js frontend), 
        // backend không cần làm gì nhiều, chỉ cần gửi tín hiệu thành công
        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Google Login (Giữ nguyên - đã cập nhật access token)
exports.googleLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ message: 'Thiếu accessToken.' });

        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const payload = googleResponse.data;
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || payload.given_name || '';
        const avatar = payload.picture || null; // Lấy avatar từ Google

        if (!email) return res.status(400).json({ message: 'Không lấy được email từ Google.' });

        let user = await User.findOne({ email });
        
        if (!user) {
            // Nếu user không tồn tại, tạo mới
            user = new User({
                userId: await generateUuid(),
                // Tạo userName từ email (bỏ phần @...) hoặc dùng email
                userName: email.split('@')[0] || email,
                // Mật khẩu không cần thiết cho social login, nhưng nên hash một giá trị ngẫu nhiên
                // Hoặc để null và logic login sẽ kiểm tra 'provider'
                password: await bcrypt.hash(await generateUuid(), 10), 
                email,
                name,
                avatar: avatar, // Lưu avatar từ Google
                provider: 'google',
                googleId,
                // Không có sđt/tuổi khi login bằng Google
                phoneNumber: null,
                age: null 
            });
            await user.save();
        } else {
            // Nếu user tồn tại (đăng ký 'local' trước đó)
            const update = {};
            if (!user.googleId) update.googleId = googleId;
            if (user.provider !== 'google') update.provider = 'google';
            if (!user.avatar) update.avatar = avatar; // Cập nhật avatar nếu chưa có
            if (Object.keys(update).length) {
                user.set(update);
                await user.save();
            }
        }

        // Tạo token JWT và trả về
        const token = jwt.sign(
            { id: user.userId, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Đăng nhập Google thành công!',
            token,
            user: {
                id: user.userId,
                name: user.name,
                userName: user.userName,
                email: user.email,
                isAdmin: user.isAdmin,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            return res.status(401).json({ message: 'Google access token không hợp lệ hoặc đã hết hạn.' });
        }
        console.error("Lỗi Google Login (Backend):", error.message);
        return res.status(500).json({ error: error.message });
    }
};

// (Bạn có thể thêm hàm facebookLogin ở đây nếu cần)