const mongoose = require('mongoose');
const Order = require('./models/orderModel');

mongoose.connect('mongodb://localhost:27017/shop')
    .then(async () => {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderId totalAmount status paymentMethod');
        
        console.log('📦 Recent orders:');
        orders.forEach(o => {
            const amount = o.totalAmount || 0;
            const method = o.paymentMethod || 'N/A';
            console.log(`  ${o.orderId} - ${amount.toLocaleString()} VND - ${o.status} (${method})`);
        });
        
        process.exit();
    });
