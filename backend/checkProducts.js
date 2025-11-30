// Quick script to check products in database
const mongoose = require('mongoose');
const Product = require('./models/productModel');

mongoose.connect('mongodb://localhost:27017/phoneworld', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const products = await Product.find({}).select('productName price images').limit(10);
    
    console.log('\n📦 Products in database:', products.length);
    console.log('\n--- First 10 products ---');
    products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.productName} - ${p.price.toLocaleString()}₫`);
    });
    
    if (products.length === 0) {
        console.log('\n⚠️ No products found! Run seedProducts.js first.');
    }
    
    process.exit(0);
})
.catch(err => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
});
