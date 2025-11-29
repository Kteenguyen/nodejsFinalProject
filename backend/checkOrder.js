// Script để kiểm tra order vừa tạo
const mongoose = require('mongoose');
const Order = require('./models/orderModel');
require('dotenv').config();

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop');
    console.log('✅ Connected to MongoDB');

    // Lấy order mới nhất
    const latestOrder = await Order.findOne().sort({ createdAt: -1 });
    
    if (!latestOrder) {
      console.log('⚠️ Không có order nào trong database');
      process.exit(0);
    }

    console.log('\n📦 Order mới nhất:');
    console.log('- Order ID:', latestOrder.orderId);
    console.log('- Account ID:', latestOrder.accountId);
    console.log('- Account ID type:', typeof latestOrder.accountId);
    console.log('- Guest Info:', latestOrder.guestInfo);
    console.log('- Shipping Address:', latestOrder.shippingAddress);
    console.log('- Total Price:', latestOrder.totalPrice);
    console.log('- Status:', latestOrder.status);
    console.log('- Created At:', latestOrder.createdAt);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkOrders();
