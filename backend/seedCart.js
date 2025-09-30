const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Cart = require('./models/cartModel');
const Product = require('./models/productModel');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const seedCart = async () => {
    await connectDB();

    // Lấy product đầu tiên trong database
    const firstProduct = await Product.findOne({});
    if (!firstProduct) {
        console.log('Không có sản phẩm nào để seed cart!');
        process.exit();
    }

    // Xóa cart cũ (nếu có)
    await Cart.deleteMany({ cartId: 'testcart1' });

    // Tạo cart mẫu cho guest
    await Cart.create({
        cartId: 'testcart1',
        productId: firstProduct._id, // Đúng kiểu ObjectId
        quantity: 2
    });

    console.log('Seed cart completed (cartId: testcart1, productId:', firstProduct._id.toString(), ')');
    process.exit();
};

seedCart();