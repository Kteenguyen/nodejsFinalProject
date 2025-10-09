const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

async function generateUuid() {
    return uuidv4();
}

// Đăng ký
exports.register = async (req, res) => {
    try {
        console.log("📥 Body nhận từ frontend:", req.body);  // 👈 thêm dòng này
        // Chuẩn hóa dữ liệu đầu vào
        const name = req.body.name;
        const userName = req.body.userName?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;


        if (!name || !userName || !password || !email) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
        }


        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({
            userId: await generateUuid(),
            name,
            userName,
            password: hashedPassword,
            email,
        });

        await newUser.save();

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { mail, password } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        // Tạo token
        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đăng nhập bằng Google (verify idToken từ client)
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: 'Thiếu idToken.' });
        }
        if (!googleClient) {
            return res.status(500).json({ message: 'Chưa cấu hình GOOGLE_CLIENT_ID.' });
        }

        const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || payload.given_name || '';

        if (!email) {
            return res.status(400).json({ message: 'Không lấy được email từ Google.' });
        }

        let user = await User.findOne({ mail: email });
        if (!user) {
            user = new User({
                userId: await generateUuid(),
                userName: email,
                password: await bcrypt.hash(await generateUuid(), 10), // placeholder để thỏa required
                mail: email,
                name,
                provider: 'google',
                googleId
            });
            await user.save();
        } else {
            // Cập nhật thông tin provider/googleId nếu cần
            const update = {};
            if (!user.googleId) update.googleId = googleId;
            if (user.provider !== 'google') update.provider = 'google';
            if (Object.keys(update).length) {
                user.set(update);
                await user.save();
            }
        }

        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Đăng nhập Google thành công!', token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};