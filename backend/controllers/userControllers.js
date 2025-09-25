const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// uuid v8+ is ESM-only; use dynamic import helper to avoid ERR_REQUIRE_ESM in CommonJS
async function generateUuid() {
    const { v4: uuidv4 } = await import('uuid');
    return uuidv4();
}
const { OAuth2Client } = require('google-auth-library');

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { userName, password, mail, name, phoneNumber, address } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ mail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
            const newUser = new User({
                userId: await generateUuid(),
            userName,
            password: hashedPassword,
            mail,
            name,
            phoneNumber,
            address,
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

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        // Lấy userId từ middleware xác thực (bắt buộc)
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
        }

        const { name, phoneNumber, address } = req.body;

        // Chỉ cho phép cập nhật các trường thông tin cá nhân không nhạy cảm
        const updates = {};
        if (typeof name !== 'undefined') updates.name = name;
        if (typeof phoneNumber !== 'undefined') updates.phoneNumber = phoneNumber;
        if (typeof address !== 'undefined') updates.address = address;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Ẩn mật khẩu trước khi trả về
        const { password, _id, __v, ...safeUser } = updatedUser.toObject();
        return res.status(200).json({ message: 'Cập nhật thông tin thành công!', user: safeUser });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        // Lấy userId từ auth middleware (bắt buộc)
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
        }

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp currentPassword và newPassword.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng.' });
        }

        // Tránh đặt mật khẩu mới trùng mật khẩu cũ
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return res.status(400).json({ message: 'Mật khẩu mới không được trùng mật khẩu hiện tại.' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        return res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Thêm địa chỉ giao hàng (có thể nhiều)
exports.addShippingAddress = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
        }

        const {
            label,
            recipientName,
            phoneNumber,
            street,
            ward,
            district,
            city,
            country,
            postalCode,
            isDefault
        } = req.body;

        if (!recipientName || !phoneNumber || !street || !city) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: recipientName, phoneNumber, street, city.' });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Luôn đảm bảo là một danh sách, không ghi đè
        user.shippingAddresses = Array.isArray(user.shippingAddresses) ? user.shippingAddresses : [];

        // Chặn trùng địa chỉ (so sánh các trường chính)
        const normalized = value => (value || '').trim().toLowerCase();
        const isDup = user.shippingAddresses.some(a =>
            normalized(a.recipientName) === normalized(recipientName) &&
            normalized(a.phoneNumber) === normalized(phoneNumber) &&
            normalized(a.street) === normalized(street) &&
            normalized(a.ward) === normalized(ward) &&
            normalized(a.district) === normalized(district) &&
            normalized(a.city) === normalized(city) &&
            normalized(a.country || 'Vietnam') === normalized(country || 'Vietnam') &&
            normalized(a.postalCode) === normalized(postalCode)
        );
        if (isDup) {
            return res.status(409).json({ message: 'Địa chỉ đã tồn tại trong danh sách.' });
        }

            const addressId = await generateUuid();
        const newAddress = {
            addressId,
            label,
            recipientName,
            phoneNumber,
            street,
            ward,
            district,
            city,
            country,
            postalCode,
            isDefault: Boolean(isDefault)
        };

        // Nếu đặt mặc định, gỡ mặc định cũ (không xóa địa chỉ cũ)
        if (newAddress.isDefault) {
            user.shippingAddresses = (user.shippingAddresses || []).map(a => ({ ...a.toObject?.() || a, isDefault: false }));
        }

        // Thêm mới vào cuối danh sách, không ghi đè danh sách hiện có
        user.shippingAddresses = [...user.shippingAddresses, newAddress];
        await user.save();

        const { password, _id, __v, ...safeUser } = user.toObject();
        return res.status(201).json({ message: 'Thêm địa chỉ giao hàng thành công!', address: newAddress, user: safeUser });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};