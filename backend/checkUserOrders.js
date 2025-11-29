// Script để kiểm tra user và xóa order test
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Order = require('./models/orderModel');
require('dotenv').config();

async function checkUserAndCleanOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop');
    console.log('✅ Connected to MongoDB');

    // Tìm user với email user@example.com
    const user = await User.findOne({ email: 'user@example.com' });
    
    if (user) {
      console.log('\n👤 User Info:');
      console.log('- User ID:', user._id);
      console.log('- User ID (string):', user._id.toString());
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      
      // Kiểm tra orders của user này
      const userOrders = await Order.find({ accountId: user._id.toString() });
      console.log(`\n📦 Found ${userOrders.length} orders for this user`);
    } else {
      console.log('⚠️ User not found');
    }
    
    // Xóa order test (không có accountId)
    const deleteResult = await Order.deleteMany({ accountId: null });
    console.log(`\n🗑️ Deleted ${deleteResult.deletedCount} orders without accountId`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUserAndCleanOrders();
