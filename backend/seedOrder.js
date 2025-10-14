// FileName: seedOrders.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// !!! ĐẢM BẢO CÁC ĐƯỜNG DẪN NÀY LÀ CHÍNH XÁC !!!
const Order = require('./models/orderModel');
const Product = require('./models/productModel'); 
const User = require('./models/userModel');
const Discount = require('./models/discountModel');

dotenv.config();

// --- DỮ LIỆU MẪU ---

// !!! BẠN CẦN THAY ĐỔI CÁC ID NÀY !!!
// Lấy 2 _id bất kỳ từ collection 'products' trong database của bạn
const PRODUCT_ID_1 = 'laptop01'; // <-- ID thật từ database của bạn
const PRODUCT_ID_2 = 'laptop02'; // <-- ID thật từ database của bạn

const ordersData = [
    // --- Đơn hàng 1: Của người dùng đã đăng nhập, đang xử lý ---
    {
        paymentMethod: 'COD',
        shippingAddress: {
            recipientName: 'Normal User',
            phoneNumber: '0987654321',
            street: '456 User Ave',
            city: 'Ho Chi Minh City'
        },
        items: [
            { productId: PRODUCT_ID_1, quantity: 1 },
            { productId: PRODUCT_ID_2, quantity: 2 }
        ],
        status: 'Confirmed'
    },
    // --- Đơn hàng 2: Của khách vãng lai, đã giao, có giảm giá ---
    {
        isGuestOrder: true,
        guestInfo: {
            name: 'Guest Customer',
            email: 'guest@example.com'
        },
        paymentMethod: 'Bank Transfer',
        shippingAddress: {
            recipientName: 'Guest Customer',
            phoneNumber: '0123456789',
            street: '789 Guest Street',
            city: 'Hanoi'
        },
        items: [
            { productId: PRODUCT_ID_1, quantity: 1 }
        ],
        status: 'Delivered',
        discountCode: 'SALE10' // Giả sử mã này tồn tại
    }
];

// --- LOGIC SCRIPT ---

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối Database thành công...');

        console.log('🗑️  Đang xóa dữ liệu đơn hàng cũ...');
        await Order.deleteMany();
        
        console.log('➕ Đang chuẩn bị và thêm dữ liệu đơn hàng mới...');
        
        // Lấy thông tin người dùng mẫu
        const sampleUser = await User.findOne({ email: 'user@example.com' });
        if (!sampleUser) {
            throw new Error("Không tìm thấy người dùng mẫu 'user@example.com'. Vui lòng chạy seeder cho user trước.");
        }

        const processedOrders = [];

        for (const orderInfo of ordersData) {
            const entries = [];
            let subTotal = 0;

            for (const item of orderInfo.items) {
                const product = await Product.findOne({ productId: item.productId });
                if (!product) {
                    console.warn(`⚠️  Cảnh báo: Bỏ qua sản phẩm với ID không tồn tại: ${item.productId}`);
                    continue;
                }
                entries.push({ 
                    productId: product._id, 
                    name: product.productName, 
                    price: product.price, 
                    quantity: item.quantity 
                });
                subTotal += product.price * item.quantity;
            }

            if (entries.length === 0) continue;

            const shippingPrice = subTotal > 1000 ? 0 : 50;
            const tax = +(subTotal * 0.1).toFixed(2);
            let discountAmount = 0;
            let discountPayload = null;
            
            if (orderInfo.discountCode) {
                const d = await Discount.findOne({ discountCode: orderInfo.discountCode.toUpperCase() });
                if (d) {
                    discountAmount = +(subTotal * (d.percent / 100)).toFixed(2);
                    discountPayload = { code: d.discountCode, percent: d.percent, amount: discountAmount };
                }
            }
            
            const totalPrice = +(subTotal - discountAmount + tax + shippingPrice).toFixed(2);

            const newOrder = {
                orderId: uuidv4(),
                accountId: orderInfo.isGuestOrder ? null : sampleUser.userId,
                guestInfo: orderInfo.isGuestOrder ? orderInfo.guestInfo : null,
                items: entries,
                shippingAddress: orderInfo.shippingAddress,
                paymentMethod: orderInfo.paymentMethod,
                shippingPrice,
                subTotal,
                discount: discountPayload,
                tax,
                totalPrice,
                isPaid: orderInfo.status === 'Delivered', // Giả sử đơn đã giao là đã thanh toán
                status: orderInfo.status,
                statusHistory: [ // Tạo lịch sử trạng thái mẫu
                    { status: 'Pending', updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 giờ trước
                    { status: 'Confirmed', updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }, // 1 giờ trước
                ]
            };
            
            if (orderInfo.status === 'Delivered') {
                 newOrder.statusHistory.push({ status: 'Delivered', updatedAt: new Date() });
            }

            processedOrders.push(newOrder);
        }

        await Order.insertMany(processedOrders);

        console.log(`🎉 Đã thêm thành công ${processedOrders.length} đơn hàng!`);
        process.exit();
    } catch (error) {
        console.error(`❌ Lỗi khi thêm dữ liệu: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Order.deleteMany();
        console.log('🔥 Dữ liệu đơn hàng đã được xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`❌ Lỗi khi xóa dữ liệu: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}