#!/usr/bin/env node

/**
 * Script để seed discount dựa trên tên sản phẩm
 * Laptop gaming, cao cấp -> 15-20% off
 * Phụ kiện -> 10-15% off
 * Khác -> 5-10% off
 */

const mongoose = require('mongoose');
const Product = require('../models/productModel');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/nodejs-final';

// Định nghĩa discount dựa trên tên/brand sản phẩm
const discountRules = [
  { keyword: /gaming|legion|rog|msi/i, discount: 18 },
  { keyword: /laptop|macbook|dell/i, discount: 15 },
  { keyword: /iphone|samsung|xiaomi/i, discount: 12 },
  { keyword: /airpods|headphone|earphone/i, discount: 10 },
  { keyword: /ssd|ram|memory/i, discount: 8 },
  { keyword: /.*/, discount: 5 }, // default
];

function getDiscountForProduct(productName, brand) {
  const fullName = `${productName} ${brand}`.toLowerCase();
  
  for (const rule of discountRules) {
    if (rule.keyword.test(fullName)) {
      return rule.discount;
    }
  }
  
  return 5; // default
}

async function seedDiscounts() {
  try {
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`📊 Found ${products.length} products to update\n`);

    let updatedCount = 0;

    for (const product of products) {
      if (!Array.isArray(product.variants) || product.variants.length === 0) {
        continue;
      }

      const discount = getDiscountForProduct(product.productName, product.brand);
      let hasChanges = false;

      product.variants = product.variants.map((variant) => {
        const currentPrice = variant.price || 0;
        
        // Chỉ cập nhật nếu chưa có oldPrice hoặc oldPrice = 0
        if (!variant.oldPrice || variant.oldPrice === 0) {
          const oldPrice = Math.round(currentPrice / (1 - discount / 100));
          variant.oldPrice = oldPrice;
          variant.discount = discount;
          hasChanges = true;
        }
        
        return variant;
      });

      if (hasChanges) {
        await product.save();
        updatedCount++;
        console.log(`✅ ${product.productName}`);
        console.log(`   Brand: ${product.brand}, Discount: ${discount}%`);
        console.log(`   Variants: ${product.variants.map(v => `${v.name} (${v.price}₫)`).join(', ')}\n`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with discounts!`);
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDiscounts();

