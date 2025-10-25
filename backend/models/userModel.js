const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String },
    userName: { type: String, required: true },
    // Sửa: select: false để password không bị trả về khi query
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    loyaltyPoints: { type: Number, default: 0 },
    googleId: { type: String },
    // Sửa: Thêm 'local' vào enum
    provider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },

    passwordResetToken: String,
    passwordResetExpires: Date,

    shippingAddresses: {}
}, {
    timestamps: true, // Thêm timestamps
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual 'isAdmin' (giữ nguyên)
userSchema.virtual('isAdmin').get(function () {
    return this.role === 'admin';
});


const User = mongoose.model('User', userSchema);
module.exports = User;