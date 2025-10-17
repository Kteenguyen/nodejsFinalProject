// seedCart.js

const mongoose = require('mongoose');
require('dotenv').config();

// !!! ĐẢM BẢO CÁC ĐƯỜNG DẪN NÀY LÀ CHÍNH XÁC !!!
const Cart = require('./models/cartModel');
const Product = require('./models/productModel'); 
const User = require('./models/userModel');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shop");
        console.log('✅ Kết nối MongoDB thành công...');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error);
        process.exit(1);
    }
};

const seedCart = async () => {
    await connectDB();
    
    try {
        console.log('🗑️  Đang xóa dữ liệu giỏ hàng cũ...');
        await Cart.deleteMany({});

        // --- LẤY DỮ LIỆU MẪU TỪ DATABASE ---
        console.log('🔍 Đang tìm dữ liệu người dùng và sản phẩm mẫu...');
        
        // Lấy người dùng thường
        const sampleUser = await User.findOne({ email: 'user@example.com' });
        if (!sampleUser) {
            throw new Error("Không tìm thấy người dùng mẫu 'user@example.com'. Vui lòng chạy 'node seeder.js' trước.");
        }

        // Lấy 2 sản phẩm mẫu
        const sampleProduct1 = await Product.findOne({ productId: 'laptop01' });
        const sampleProduct2 = await Product.findOne({ productId: 'monitor01' });
        if (!sampleProduct1 || !sampleProduct2) {
            throw new Error("Không tìm thấy sản phẩm mẫu ('laptop01', 'monitor01'). Vui lòng chạy 'node seedProducts.js' trước.");
        }

        // --- TẠO DỮ LIỆU GIỎ HÀNG MỚI ---
        const cartItems = [
            // 1. Giỏ hàng cho người dùng đã đăng nhập (user@example.com)
            {
                accountId: sampleUser.userId,
                productId: sampleProduct1._id, // Dùng _id của sản phẩm
                variantId: sampleProduct1.variants[0].variantId, // Lấy biến thể đầu tiên làm mẫu
                quantity: 1
            },
            // 2. Giỏ hàng cho khách vãng lai (guest)
            {
                cartId: "guest_cart_123456",
                accountId: null,
                productId: sampleProduct2._id, // Dùng _id của sản phẩm
                variantId: sampleProduct2.variants[0].variantId, // Lấy biến thể đầu tiên làm mẫu
                quantity: 2
            }
        ];

        console.log('➕ Đang thêm dữ liệu giỏ hàng mới...');
        await Cart.insertMany(cartItems);

        console.log(`🎉 Đã thêm thành công ${cartItems.length} sản phẩm vào giỏ hàng!`);
        
    } catch (error) {
        console.error(`❌ Lỗi khi thêm dữ liệu giỏ hàng: ${error.message}`);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        mongoose.connection.close();
        process.exit();
    }
};

seedCart();