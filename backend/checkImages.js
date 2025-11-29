// Test script to check product images
const mongoose = require('mongoose');
require('./config/dbConnection');

async function checkImages() {
  try {
    const Product = require('./models/productModel');
    
    // Lấy 1 sản phẩm để test
    const product = await Product.findOne().select('productName productId images');
    
    console.log('=== PRODUCT DATA ===');
    console.log('Name:', product.productName);
    console.log('ID:', product.productId);
    console.log('Images field:', product.images);
    console.log('Images type:', typeof product.images);
    console.log('Is array:', Array.isArray(product.images));
    console.log('Length:', product.images?.length);
    console.log('First image:', product.images?.[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setTimeout(checkImages, 1000);
