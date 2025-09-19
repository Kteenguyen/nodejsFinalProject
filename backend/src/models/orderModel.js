const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
    createAt: { type: Date, default: Date.now },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentResult: { type: String },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date }
});


module.exports = mongoose.model('Order', orderSchema);
