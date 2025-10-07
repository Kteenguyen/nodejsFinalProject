const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

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