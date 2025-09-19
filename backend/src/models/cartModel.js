const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    cartId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true }
});

module.exports = mongoose.model('Cart', cartSchema);
