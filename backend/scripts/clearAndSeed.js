// Clear existing data và seed mới
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

async function clearAndSeed() {
    try {
        console.log('🌱 Clearing and seeding data...\n');
        await mongoose.connect(process.env.MONGODB_URI);

        // ========== CLEAR OLD DATA ==========
        console.log('🗑️  Clearing old data...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Cleared old data\n');

        // ========== CATEGORIES ==========
        console.log('📂 Creating categories...');
        const categories = [
            { categoryId: 'smartphone', name: 'Điện thoại', slug: 'dien-thoai', description: 'Smartphone các loại' },
            { categoryId: 'laptop', name: 'Laptop', slug: 'laptop', description: 'Máy tính xách tay' },
            { categoryId: 'tablet', name: 'Máy tính bảng', slug: 'may-tinh-bang', description: 'Tablet' },
            { categoryId: 'accessory', name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện điện thoại' },
            { categoryId: 'headphone', name: 'Tai nghe', slug: 'tai-nghe', description: 'Tai nghe và loa' },
        ];

        for (const cat of categories) {
            await Category.create(cat);
        }
        console.log(`✅ Created ${categories.length} categories\n`);

        // ========== PRODUCTS ==========
        console.log('📦 Creating products...');
        const products = [
            {
                productId: 'IPHONE-15-PRO',
                productName: 'iPhone 15 Pro Max',
                brand: 'Apple',
                productDescription: 'Flagship mới nhất từ Apple với chip A17 Pro',
                category: { categoryId: 'smartphone', categoryName: 'Điện thoại' },
                images: ['https://via.placeholder.com/400x400?text=iPhone+15+Pro'],
                variants: [
                    { variantId: 'IP15P-256-BLK', name: '256GB - Đen', price: 28490500, stock: 50 },
                    { variantId: 'IP15P-512-WHT', name: '512GB - Trắng', price: 33240500, stock: 30 }
                ],
                status: 'available',
                isNewProduct: true,
                isBestSeller: true,
                createdAt: new Date()
            },
            {
                productId: 'SAMSUNG-S24-ULTRA',
                productName: 'Samsung Galaxy S24 Ultra',
                brand: 'Samsung',
                productDescription: 'Flagship Galaxy S24 Ultra với camera 200MP',
                category: { categoryId: 'smartphone', categoryName: 'Điện thoại' },
                images: ['https://via.placeholder.com/400x400?text=Samsung+S24'],
                variants: [
                    { variantId: 'SGS24-256-BLK', name: '256GB - Đen', price: 25490000, stock: 45 },
                    { variantId: 'SGS24-512-SLV', name: '512GB - Bạc', price: 29990000, stock: 25 }
                ],
                status: 'available',
                isBestSeller: true,
                createdAt: new Date()
            },
            {
                productId: 'LENOVO-LEGION-5',
                productName: 'Lenovo Legion 5 Pro',
                brand: 'Lenovo',
                productDescription: 'Gaming laptop mạnh mẽ với RTX 4060',
                category: { categoryId: 'laptop', categoryName: 'Laptop' },
                images: ['https://via.placeholder.com/400x400?text=Lenovo+Legion'],
                variants: [
                    { variantId: 'LL5-RTX4060', name: 'RTX 4060 - 16GB', price: 22990000, stock: 20 },
                    { variantId: 'LL5-RTX4070', name: 'RTX 4070 - 32GB', price: 28990000, stock: 15 }
                ],
                status: 'available',
                createdAt: new Date()
            },
            {
                productId: 'MACBOOK-M3',
                productName: 'MacBook Pro 14" M3',
                brand: 'Apple',
                productDescription: 'MacBook Pro với chip M3 mới',
                category: { categoryId: 'laptop', categoryName: 'Laptop' },
                images: ['https://via.placeholder.com/400x400?text=MacBook+Pro'],
                variants: [
                    { variantId: 'MBP-M3-256', name: 'M3 - 256GB', price: 32990000, stock: 10 },
                    { variantId: 'MBP-M3-512', name: 'M3 - 512GB', price: 37990000, stock: 8 }
                ],
                status: 'available',
                createdAt: new Date()
            },
            {
                productId: 'SONY-WH1000XM5',
                productName: 'Sony WH-1000XM5',
                brand: 'Sony',
                productDescription: 'Tai nghe noise-cancelling hàng đầu',
                category: { categoryId: 'headphone', categoryName: 'Tai nghe' },
                images: ['https://via.placeholder.com/400x400?text=Sony+WH1000XM5'],
                variants: [
                    { variantId: 'SONY-WH1000XM5', name: 'Đen', price: 8990000, stock: 100 }
                ],
                status: 'available',
                isBestSeller: true,
                createdAt: new Date()
            },
            {
                productId: 'IPAD-PRO-12',
                productName: 'iPad Pro 12.9" M2',
                brand: 'Apple',
                productDescription: 'Tablet siêu mạnh với chip M2',
                category: { categoryId: 'tablet', categoryName: 'Máy tính bảng' },
                images: ['https://via.placeholder.com/400x400?text=iPad+Pro'],
                variants: [
                    { variantId: 'IPAD-128GB', name: '128GB - Wi-Fi', price: 16990000, stock: 15 },
                    { variantId: 'IPAD-256GB', name: '256GB - Wi-Fi', price: 18990000, stock: 12 }
                ],
                status: 'available',
                createdAt: new Date()
            },
        ];

        for (const product of products) {
            await Product.create(product);
        }
        console.log(`✅ Created ${products.length} products\n`);

        console.log('🎉 Seeding completed successfully!');
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

clearAndSeed();
