const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    brand: { type: String },
    productDescription: { type: String },
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
    soldOut: { type: Boolean, default: false },

    // Thêm trường cho yêu cầu hiển thị
    isNewProduct: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },


    category: {
        categoryId: { type: String, required: true },
        categoryName: { type: String, required: true },
        level: { type: Number, required: true }
    }
});

module.exports = mongoose.model('Product', productSchema, 'product');
