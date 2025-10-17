// models/cartModel.js

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    cartId: { type: String }, 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: true },
    accountId: { type: String, ref: 'User' },
    quantity: { type: Number, required: true, min: 1 }
}, {
    timestamps: true
});

// SỬA LẠI: Cập nhật chỉ mục (index) để bao gồm cả variantId
cartSchema.index(
    { accountId: 1, productId: 1, variantId: 1 }, 
    { unique: true, partialFilterExpression: { accountId: { $type: 'string' } } }
);

cartSchema.index(
    { cartId: 1, productId: 1, variantId: 1 }, 
    { unique: true, sparse: true }
);

module.exports = mongoose.model('Cart', cartSchema);