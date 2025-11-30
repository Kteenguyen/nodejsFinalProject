const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Discount = require('./models/discountModel');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('MONGO_URI:', MONGO_URI ? 'Found' : 'NOT FOUND');

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    // Cập nhật endDate cho voucher đổi điểm
    const result = await Discount.updateMany(
        { isRedeemable: true, pointsCost: { $gt: 0 } },
        { 
            $set: { 
                endDate: new Date('2026-12-31T23:59:59.000Z'),
                startDate: new Date('2024-01-01T00:00:00.000Z')
            } 
        }
    );
    console.log('Updated vouchers:', result.modifiedCount);
    
    // Kiểm tra lại
    const vouchers = await Discount.find({ isRedeemable: true, pointsCost: { $gt: 0 } });
    console.log('\n=== VOUCHERS SAU KHI CẬP NHẬT ===');
    vouchers.forEach(v => {
        console.log(`- ${v.discountName} | startDate: ${v.startDate} | endDate: ${v.endDate}`);
    });
    
    mongoose.disconnect();
});
