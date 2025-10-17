const mongoose = require('mongoose');
const crypto = require('crypto'); // 👈 1. Import thư viện crypto của Node.js

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    loyaltyPoints: { type: Number, default: 0 },
    googleId: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    
    // ================== BỔ SUNG CÁC TRƯỜNG CHO QUÊN MẬT KHẨU ==================
    passwordResetToken: String,
    passwordResetExpires: Date,
    // =======================================================================

    shippingAddresses: {
        type: [
            new mongoose.Schema(
                {
                    addressId: { type: String, required: true },
                    label: { type: String },
                    recipientName: { type: String, required: true },
                    phoneNumber: { type: String, required: true },
                    street: { type: String, required: true },
                    ward: { type: String },
                    district: { type: String },
                    city: { type: String, required: true },
                    country: { type: String, default: 'Vietnam' },
                    postalCode: { type: String },
                    isDefault: { type: Boolean, default: false }
                },
                { _id: false }
            )
        ],
        default: []
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual 'isAdmin' (giữ nguyên)
userSchema.virtual('isAdmin').get(function() {
    return this.role === 'admin';
});

// ================== BỔ SUNG PHƯƠNG THỨC TẠO TOKEN RESET MẬT KHẨU ==================
userSchema.methods.createPasswordResetToken = function() {
    // Tạo một token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Mã hóa token và lưu vào database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Đặt thời gian hết hạn cho token (ví dụ: 10 phút)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Trả về token chưa mã hóa để gửi cho người dùng qua email
    return resetToken;
};
// =================================================================================

module.exports = mongoose.model('User', userSchema);