// seedOrders.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const Order = require('./models/orderModel');
const Product = require('./models/productModel'); 
const User = require('./models/userModel');
const Discount = require('./models/discountModel');

dotenv.config();

const ordersData = [
    {
        paymentMethod: 'COD',
        shippingAddress: {
            recipientName: 'Normal User',
            phoneNumber: '0987654321',
            street: '456 User Ave',
            city: 'Ho Chi Minh City'
        },
        items: [
            // Chúng ta sẽ dùng productId để tìm sản phẩm, và script sẽ tự lấy biến thể đầu tiên
            { productId: 'laptop01', quantity: 1 }, 
            { productId: 'monitor01', quantity: 2 }
        ],
        status: 'Confirmed'
    },
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
            { productId: 'laptop01', quantity: 1 }
        ],
        status: 'Delivered',
        discountCode: 'SALE10'
    }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối Database thành công...');

        console.log('🗑️  Đang xóa dữ liệu đơn hàng cũ...');
        await Order.deleteMany();
        
        console.log('➕ Đang chuẩn bị và thêm dữ liệu đơn hàng mới...');
        
        const sampleUser = await User.findOne({ email: 'user@example.com' });
        if (!sampleUser) {
            throw new Error("Không tìm thấy người dùng mẫu 'user@example.com'. Vui lòng chạy seeder cho user trước.");
        }

        const processedOrders = [];

        for (const orderInfo of ordersData) {
            const entries = [];
            let subTotal = 0;

            for (const item of orderInfo.items) {
                // Sửa lại: Tìm bằng productId tùy chỉnh
                const product = await Product.findOne({ productId: item.productId }); 
                if (!product || !product.variants || product.variants.length === 0) {
                    console.warn(`⚠️  Cảnh báo: Bỏ qua sản phẩm không hợp lệ: ${item.productId}`);
                    continue;
                }
                
                // ================== LOGIC MỚI BẮT ĐẦU TỪ ĐÂY ==================

                // 1. Lấy thông tin biến thể đầu tiên làm mẫu
                const variant = product.variants[0]; 

                // 2. Lấy giá từ BIẾN THỂ, không phải từ sản phẩm
                const price = variant.price; 
                
                entries.push({ 
                    productId: product._id, 
                    variantId: variant.variantId, // 3. THÊM variantId vào item
                    name: `${product.productName} - ${variant.name}`, 
                    price: price, 
                    quantity: item.quantity 
                });
                subTotal += price * item.quantity;
                
                // ================== KẾT THÚC LOGIC MỚI ==================
            }

            if (entries.length === 0) continue;

            // ... (phần còn lại của logic tính toán giữ nguyên) ...
            const shippingPrice = subTotal > 1000000 ? 0 : 30000;
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
                isPaid: orderInfo.status === 'Delivered',
                status: orderInfo.status,
                statusHistory: [
                    { status: 'Pending', updatedAt: new Date() }
                ]
            };
            processedOrders.push(newOrder);
        }

        if (processedOrders.length > 0) {
            await Order.insertMany(processedOrders);
        }

        console.log(`🎉 Đã thêm thành công ${processedOrders.length} đơn hàng!`);
        
    } catch (error) {
        console.error(`❌ Lỗi khi thêm dữ liệu: ${error.message}`);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

importData();