// backend/models/userModel.js
const mongoose = require('mongoose');
const crypto = require('crypto');

// === 1. TẠO SCHEMA CHO ĐỊA CHỈ (MỚI) ===
const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: [true, 'Vui lòng nhập họ tên'] },
    phoneNumber: { type: String, required: [true, 'Vui lòng nhập số điện thoại'] },
    address: { type: String, required: [true, 'Vui lòng nhập địa chỉ'] }, // Số nhà, tên đường
    city: { type: String, required: [true, 'Vui lòng nhập Tỉnh/Thành phố'] },
    district: { type: String, required: [true, 'Vui lòng nhập Quận/Huyện'] },
    ward: { type: String, required: [true, 'Vui lòng nhập Phường/Xã'] },
    isDefault: { type: Boolean, default: false }
}, { _id: true }); // Bật _id để dễ dàng Sửa/Xóa

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String },
    userName: { type: String, required: true },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    loyaltyPoints: { type: Number, default: 0 },
    googleId: { type: String },
    provider: {
        type: [
            {
                type: String,
                enum: ['local', 'google', 'facebook', 'github', 'twitter']
            }
        ],
        required: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    isBanned: {
        type: Boolean,
        default: false,
    },
    // === 2. SỬA LẠI 'shippingAddresses' (QUAN TRỌNG) ===
    shippingAddresses: {
        type: [addressSchema], // Đổi thành một MẢNG các địa chỉ
        default: []
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// === VIRTUAL CHO HẠNG THÀNH VIÊN (MỚI) ===
// Tự động tính hạng dựa trên điểm, không cần lưu vào DB
// (Có thể tùy chỉnh các mốc điểm này)
userSchema.virtual('membershipTier').get(function () {
    if (this.loyaltyPoints >= 5000) { // Ví dụ: 5000 điểm
        return 'Kim Cương';
    }
    if (this.loyaltyPoints >= 2000) { // Ví dụ: 2000 điểm
        return 'Vàng';
    }
    if (this.loyaltyPoints >= 500) { // Ví dụ: 500 điểm
        return 'Bạc';
    }
    return 'Đồng'; // Mặc định
});

// Đảm bảo virtuals được bật khi chuyển sang JSON (file của bạn đã có sẵn)
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });
// ... (Các virtuals, methods, pre-save hooks của fen giữ nguyên) ...

module.exports = mongoose.model('User', userSchema);