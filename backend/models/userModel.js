// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // <-- Quyền hạn được định nghĩa ở đây
    googleId: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
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
    // Thêm tùy chọn này để đảm bảo virtuals được bao gồm khi chuyển sang JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ======================= THÊM MỘT VIRTUAL GETTER =======================
// Tạo một thuộc tính ảo 'isAdmin' không được lưu trong DB
userSchema.virtual('isAdmin').get(function() {
    // 'this' ở đây chính là document user
    // Trả về true nếu role của user là 'admin', ngược lại trả về false
    return this.role === 'admin';
});
// =======================================================================

module.exports = mongoose.model('User', userSchema);