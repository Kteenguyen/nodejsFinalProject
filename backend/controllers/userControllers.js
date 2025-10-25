const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

//Lấy thông tin cá nhân của người dùng đang đăng nhập
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
        }

        const user = await User.findOne({ userId }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật thông tin cá nhân
exports.updateUserProfile = async (req, res) => {
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

//Quên mật khẩu - Bước 1: Yêu cầu reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email.' });

        const user = await User.findOne({ email });
        if (!user) {
            // Luôn trả về thành công để không tiết lộ email nào tồn tại trong hệ thống
            return res.status(200).json({ message: 'Nếu email của bạn tồn tại trong hệ thống, một liên kết khôi phục mật khẩu đã được gửi đến.' });
        }

        // Tạo token reset và lưu vào database
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // 2. Tạo URL khôi phục mật khẩu
        // URL này sẽ trỏ đến trang đặt lại mật khẩu trên frontend của bạn
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // 3. Soạn nội dung và gửi email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Yêu cầu khôi phục mật khẩu cho tài khoản của bạn',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Khôi phục mật khẩu</h2>
                        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu:</p>
                        <a href="${resetURL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Đặt lại mật khẩu
                        </a>
                        <p>Liên kết này sẽ hết hạn sau 10 phút.</p>
                        <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
                    </div>
                `
            });

            res.status(200).json({ message: 'Link khôi phục mật khẩu đã được gửi đến email của bạn.' });

        } catch (emailError) {
            // Nếu gửi email thất bại, xóa token đã tạo để người dùng có thể thử lại
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error("Lỗi khi gửi email khôi phục mật khẩu:", emailError);
            return res.status(500).json({ message: 'Không thể gửi email khôi phục. Vui lòng thử lại sau.' });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//Quên mật khẩu - Bước 2: Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });

        user.password = await bcrypt.hash(req.body.password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

//Cập nhật một địa chỉ giao hàng
exports.updateShippingAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updates = req.body;

        const user = await User.findOne({ userId: req.user.id });
        const address = user.shippingAddresses.find(addr => addr.addressId === addressId);

        if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ.' });

        Object.assign(address, updates); // Cập nhật các trường được cung cấp
        await user.save();

        res.status(200).json({ message: 'Cập nhật địa chỉ thành công!', addresses: user.shippingAddresses });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Xóa một địa chỉ giao hàng
exports.deleteShippingAddress = async (req, res) => {
    try {
        await User.updateOne(
            { userId: req.user.id },
            { $pull: { shippingAddresses: { addressId: req.params.addressId } } }
        );
        res.status(200).json({ message: 'Xóa địa chỉ thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Đặt một địa chỉ làm mặc định
exports.setDefaultShippingAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findOne({ userId: req.user.id });

        let addressFound = false;
        user.shippingAddresses.forEach(addr => {
            if (addr.addressId === addressId) {
                addr.isDefault = true;
                addressFound = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (!addressFound) return res.status(404).json({ message: 'Không tìm thấy địa chỉ.' });

        await user.save();
        res.status(200).json({ message: 'Đặt địa chỉ mặc định thành công!', addresses: user.shippingAddresses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============================================================
// HÀM DÀNH CHO ADMIN
// =============================================================

/**
 * [ADMIN] Lấy danh sách tất cả người dùng với phân trang
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }
            : {};
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: "orders",
                    localField: "userId",
                    foreignField: "userId",
                    as: "orders",
                }
            },
            {
                $addFields: {
                    delivered: {
                        $size: {
                            $filter: {
                                input: "$orders",
                                as: "o",
                                cond: { $eq: ["$$o.status", "delivered"] },
                            }
                        }
                    },
                    pending: {
                        $size: {
                            $filter: {
                                input: "$orders",
                                as: "o",
                                cond: { $eq: ["$$o.status", "pending"] },
                            }
                        }
                    },
                    canceled: {
                        $size: {
                            $filter: {
                                input: "$orders",
                                as: "o",
                                cond: { $eq: ["$$o.status", "canceled"] },
                            }
                        }
                    },
                }
            },
            {
                $project: {
                    password: 0,
                    orders: 0
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
        ];

        const users = await User.aggregate(pipeline);


        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            users,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [ADMIN] Lấy chi tiết một người dùng
 */
exports.getUserByIdForAdmin = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [ADMIN] Cập nhật thông tin người dùng (ví dụ: cấp quyền admin)
 */
exports.updateUserByAdmin = async (req, res) => {
    try {
        const { name, role, isAdmin } = req.body;
        const user = await User.findOne({ userId: req.params.userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Cập nhật các trường được phép
        user.name = name || user.name;
        user.role = role || user.role;

        // Cập nhật isAdmin một cách an toàn
        if (typeof isAdmin !== 'undefined') {
            user.isAdmin = isAdmin;
        }

        const updatedUser = await user.save();

        // Trả về user đã cập nhật (không có mật khẩu)
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({ success: true, user: userResponse });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};