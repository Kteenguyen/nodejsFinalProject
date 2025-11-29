// Script test hệ thống điểm thưởng
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Order = require('./models/orderModel');
require('dotenv').config();

async function testLoyaltyPoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop');
    console.log('✅ Connected to MongoDB\n');

    // Test user
    const testEmail = 'user@example.com';
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('⚠️ User not found. Please create a user first.');
      process.exit(1);
    }

    console.log('👤 USER INFO:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Current Points:', user.loyaltyPoints);
    console.log('- Points Value:', (user.loyaltyPoints * 1000).toLocaleString() + 'đ');
    console.log('- Membership Tier:', user.membershipTier);
    
    // Tìm orders của user
    const orders = await Order.find({ accountId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n📦 RECENT ORDERS:');
    if (orders.length === 0) {
      console.log('No orders found.');
    } else {
      orders.forEach((order, index) => {
        const expectedPoints = Math.floor(order.totalPrice * 0.1 / 1000);
        console.log(`\n${index + 1}. Order ${order.orderId}`);
        console.log('   - Total:', order.totalPrice.toLocaleString() + 'đ');
        console.log('   - Expected Points:', expectedPoints);
        console.log('   - Status:', order.status);
        console.log('   - Date:', order.createdAt.toLocaleDateString('vi-VN'));
      });
    }

    // Tính tổng points nên có
    const totalOrderValue = await Order.aggregate([
      { $match: { accountId: user._id.toString(), status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    if (totalOrderValue.length > 0) {
      const total = totalOrderValue[0].total;
      const expectedTotalPoints = Math.floor(total * 0.1 / 1000);
      
      console.log('\n💰 POINTS SUMMARY:');
      console.log('- Total Order Value:', total.toLocaleString() + 'đ');
      console.log('- Expected Total Points:', expectedTotalPoints);
      console.log('- Current Points:', user.loyaltyPoints);
      console.log('- Difference:', user.loyaltyPoints - expectedTotalPoints);
    }

    // Test scenarios
    console.log('\n🧪 TEST SCENARIOS:');
    console.log('\n1. Order 1.000.000đ:');
    console.log('   → Should earn:', Math.floor(1000000 * 0.1 / 1000), 'points (100.000đ value)');
    
    console.log('\n2. Order 2.500.000đ:');
    console.log('   → Should earn:', Math.floor(2500000 * 0.1 / 1000), 'points (250.000đ value)');
    
    console.log('\n3. Use 50 points:');
    console.log('   → Discount:', (50 * 1000).toLocaleString() + 'đ');
    console.log('   → Remaining points:', user.loyaltyPoints - 50);

    console.log('\n4. Use all points:');
    console.log('   → Max discount:', (user.loyaltyPoints * 1000).toLocaleString() + 'đ');
    console.log('   → Remaining points: 0');

    // Membership tiers
    console.log('\n🏆 MEMBERSHIP TIERS:');
    console.log('- Đồng (Bronze): 0 - 499 points');
    console.log('- Bạc (Silver): 500 - 1,999 points');
    console.log('- Vàng (Gold): 2,000 - 4,999 points');
    console.log('- Kim Cương (Diamond): 5,000+ points');
    console.log(`\n→ Your tier: ${user.membershipTier} (${user.loyaltyPoints} points)`);

    // Points to next tier
    let nextTier = '';
    let pointsNeeded = 0;
    if (user.loyaltyPoints < 500) {
      nextTier = 'Bạc';
      pointsNeeded = 500 - user.loyaltyPoints;
    } else if (user.loyaltyPoints < 2000) {
      nextTier = 'Vàng';
      pointsNeeded = 2000 - user.loyaltyPoints;
    } else if (user.loyaltyPoints < 5000) {
      nextTier = 'Kim Cương';
      pointsNeeded = 5000 - user.loyaltyPoints;
    }

    if (pointsNeeded > 0) {
      console.log(`→ Points to ${nextTier}: ${pointsNeeded} (${(pointsNeeded * 1000).toLocaleString()}đ more spending)`);
    } else {
      console.log('→ You are at the highest tier! 🎉');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run test
testLoyaltyPoints();
