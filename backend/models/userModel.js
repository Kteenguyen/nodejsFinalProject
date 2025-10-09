// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phoneNumber: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
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
});

module.exports = mongoose.model('User', userSchema);