// Debug script - check DB data
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const categories = await Category.find({});
        const products = await Product.find({});
        
        console.log('📊 DATABASE CHECK');
        console.log(`Total categories: ${categories.length}`);
        console.log(`Total products: ${products.length}`);
        
        if (products.length > 0) {
            console.log('\n📦 Products in DB:');
            products.forEach(p => {
                console.log(`- ${p.productName} (${p.brand})`);
                console.log(`  Variants: ${p.variants.length}`);
                p.variants.forEach(v => {
                    console.log(`    • ${v.name}: ${v.price}₫ (oldPrice: ${v.oldPrice || 'N/A'}, discount: ${v.discount || 'N/A'}%)`);
                });
            });
        }
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkData();
