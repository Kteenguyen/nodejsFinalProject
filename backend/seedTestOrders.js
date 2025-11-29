// backend/seedTestOrders.js
// Tạo test orders với status "Delivered" để test Dashboard

const mongoose = require('mongoose');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');
require('dotenv').config();

async function seedTestOrders() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop');
    console.log('✅ Connected to MongoDB');

    // Lấy vài products từ database
    const products = await Product.find().limit(5);
    console.log(`📦 Found ${products.length} products in database`);
    
    if (products.length === 0) {
      console.warn('⚠️ Không có products trong database. Cần seed products trước.');
      process.exit(1);
    }

    // Tạo 15 test orders với status "Delivered"
    const testOrders = [];
    const today = new Date();

    for (let i = 0; i < 15; i++) {
      const product = products[i % products.length];
      const daysAgo = Math.floor(i / 3); // Spread orders over different days
      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - daysAgo);

      // Random quantity 1-5
      const qty = Math.floor(Math.random() * 5) + 1;
      const unitPrice = Math.floor(Math.random() * 10000000) + 5000000;
      const subTotal = unitPrice * qty;
      const shippingFee = 30000;
      const taxFee = 0; // Hoặc tính thuế nếu cần: subTotal * 0.1

      testOrders.push({
        orderId: `ORD-${Date.now()}-${i}`,
        userId: new mongoose.Types.ObjectId(), // Fake User ID
        
        // --- SỬA LỖI 1: Cấu trúc items thiếu variantId ---
        items: [
          {
            productId: product._id,
            // Giả lập variantId (nếu product có variants thật thì lấy thật, không thì tạo fake ID)
            variantId: new mongoose.Types.ObjectId(), 
            name: product.name || `Test Product ${i}`,
            price: unitPrice,
            quantity: qty,
            category: product.category?.categoryName || 'Laptop',
            image: product.image || '/images/placeholder.png' // Thêm ảnh cho chắc
          }
        ],

        // --- SỬA LỖI 2: Thiếu các trường tính toán tiền ---
        subTotal: subTotal,
        tax: taxFee,
        shippingPrice: shippingFee,
        totalPrice: subTotal + taxFee + shippingFee, // Tổng tiền cuối cùng
        
        // Các trường khác
        status: 'Delivered', 
        paymentMethod: 'credit_card',
        isPaid: true,        // Đơn Delivered thường đã thanh toán
        paidAt: orderDate,

        // --- SỬA LỖI 3: Sai key trong shippingAddress ---
        shippingAddress: {
          recipientName: `Test Customer ${i}`, // Sửa từ fullName -> recipientName
          phoneNumber: '0901234567',           // Sửa từ phone -> phoneNumber
          street: '123 Test Street',           // Sửa từ address -> street
          city: 'Ho Chi Minh',                 // Thêm field city bắt buộc
          district: 'District 1',              // Thêm cho đầy đủ (nếu model yêu cầu)
          ward: 'Ben Nghe',                    // Thêm cho đầy đủ
          country: 'Vietnam'
        },

        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    // Xóa orders cũ (optional)
    await Order.deleteMany({ orderId: { $regex: '^ORD-' } });
    console.log('🗑️ Cleared old test orders');

    // Insert test orders
    const result = await Order.insertMany(testOrders);
    console.log(`✅ Created ${result.length} test orders with status "Delivered"`);

    // Verify
    const count = await Order.countDocuments({ status: 'Delivered' });
    console.log(`📊 Total Delivered orders in database: ${count}`);

    console.log('\n✨ Success! Now go to /admin/dashboard and check Category & Top Products');
  } catch (error) {
    console.error('❌ Error details:', error.message);
    // In ra lỗi chi tiết hơn nếu validation vẫn fail
    if (error.errors) {
        Object.keys(error.errors).forEach(key => {
            console.error(`- Field "${key}": ${error.errors[key].message}`);
        });
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run
seedTestOrders();