const mongoose = require('mongoose');

// Schema cho một biến thể sản phẩm
const variantSchema = new mongoose.Schema({
    variantId: { type: String, required: true },
    name: { type: String, required: true }, // Ví dụ: "Màu Đen, 16GB RAM"
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 } // Số lượng tồn kho
}, { _id: false });

const productSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    brand: { type: String },
    productDescription: { type: String },
    
    //Thay thế các trường cũ bằng một mảng các biến thể
    variants: [variantSchema],

    images: [{ type: String }], // Mảng các URL hình ảnh
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
    isNewProduct: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    category: {
        categoryId: { type: String, required: true },
        categoryName: { type: String, required: true },
        level: { type: Number, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);