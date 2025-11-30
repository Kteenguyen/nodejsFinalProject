const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestInfo: {
        name: { type: String },
        email: { type: String }
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: String, required: true }, // ✅ THÊM LẠI VÀO ĐÚNG VỊ TRÍ NÀY
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String }, // Thêm ảnh sản phẩm
        variantName: { type: String } // Thêm tên variant (size, color, etc.)
    }],
    shippingAddress: {
        recipientName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    subTotal: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: {
        code: { type: String },
        percent: { type: Number },
        amount: { type: Number }
    },
    totalPrice: { type: Number, required: true },
    loyaltyPoints: { 
        pointsEarned: { type: Number, default: 0 },
        pointsUsed: { type: Number, default: 0 }
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    statusHistory: [{
        status: { type: String },
        updatedAt: { type: Date, default: Date.now }
    }],
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    // Ảnh chứng từ chuyển khoản (cho payment method = banking)
    paymentProof: {
        imageUrl: { type: String },
        uploadedAt: { type: Date },
        verifiedBy: { type: String }, // Admin ID đã xác nhận
        verifiedAt: { type: Date }
    }
}, {
    timestamps: true
});
orderSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);