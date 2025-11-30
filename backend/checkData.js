require('dotenv').config();
const mongoose = require('mongoose');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Category = require('./models/categoryModel');
        const Product = require('./models/productModel');

        // Kiểm tra danh mục
        const categories = await Category.find().lean();
        console.log('=== DANH MỤC ===');
        if (categories.length === 0) {
            console.log('❌ Không có danh mục nào!');
        } else {
            categories.forEach(c => console.log(`  ${c.categoryId} - ${c.categoryName}`));
        }
        console.log(`Tổng: ${categories.length} danh mục\n`);

        // Kiểm tra sản phẩm
        const totalProducts = await Product.countDocuments();
        console.log('=== SẢN PHẨM ===');
        console.log(`Tổng sản phẩm: ${totalProducts}\n`);

        // Kiểm tra sản phẩm theo danh mục
        console.log('=== SẢN PHẨM THEO DANH MỤC ===');
        for (const cat of categories) {
            const count = await Product.countDocuments({ categoryId: cat.categoryId });
            console.log(`  ${cat.categoryName}: ${count} sản phẩm`);
        }

        // Kiểm tra sản phẩm mới và bán chạy
        console.log('\n=== FLAGS ===');
        const newProducts = await Product.countDocuments({ isNewProduct: true });
        const bestSellers = await Product.countDocuments({ isBestSeller: true });
        console.log(`  Sản phẩm mới (isNewProduct=true): ${newProducts}`);
        console.log(`  Bán chạy (isBestSeller=true): ${bestSellers}`);

        // Kiểm tra sample product
        console.log('\n=== SAMPLE PRODUCT ===');
        const sample = await Product.findOne().lean();
        if (sample) {
            console.log(`  ID: ${sample._id}`);
            console.log(`  productId: ${sample.productId}`);
            console.log(`  Name: ${sample.productName}`);
            console.log(`  categoryId: ${sample.categoryId}`);
            console.log(`  isNewProduct: ${sample.isNewProduct}`);
            console.log(`  isBestSeller: ${sample.isBestSeller}`);
            console.log(`  status: ${sample.status}`);
        } else {
            console.log('❌ Không có sản phẩm nào!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkData();
