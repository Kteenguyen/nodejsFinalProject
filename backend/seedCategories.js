// backend/seedCategories.js
const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shop");
        console.log('✅ Kết nối MongoDB thành công...');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error);
        process.exit(1);
    }
};

const seedCategories = async () => {
    await connectDB();
    
    try {
        console.log('🗑️  Đang xóa dữ liệu categories cũ...');
        await Category.deleteMany({});

        // Lấy danh sách categories từ products
        const distinctCategories = await Product.aggregate([
            { $match: { 'category.categoryId': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$category.categoryId',
                    name: { $first: '$category.categoryName' }
                }
            }
        ]);

        console.log('📂 Categories tìm thấy trong products:', distinctCategories);

        // Tạo categories với thông tin đầy đủ
        const categories = [
            {
                categoryId: 'laptop',
                name: 'Laptop',
                slug: 'laptop',
                description: 'Laptop gaming, văn phòng, học tập với nhiều cấu hình khác nhau',
                image: 'https://cdn-icons-png.flaticon.com/512/610/610021.png',
                status: 'active',
                displayOrder: 1
            },
            {
                categoryId: 'monitor',
                name: 'Màn hình',
                slug: 'man-hinh',
                description: 'Màn hình máy tính, gaming monitor với độ phân giải cao',
                image: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png',
                status: 'active',
                displayOrder: 2
            },
            {
                categoryId: 'ssd',
                name: 'Ổ cứng',
                slug: 'o-cung',
                description: 'Ổ cứng SSD NVMe, SATA với dung lượng và tốc độ cao',
                image: 'https://cdn-icons-png.flaticon.com/512/4820/4820681.png',
                status: 'active',
                displayOrder: 3
            }
        ];

        console.log('➕ Đang thêm dữ liệu categories mới...');
        await Category.insertMany(categories);
        
        // Đếm số products cho mỗi category
        for (const cat of categories) {
            const count = await Product.countDocuments({ 
                'category.categoryId': cat.categoryId 
            });
            console.log(`   ✓ ${cat.name}: ${count} sản phẩm`);
        }

        console.log(`🎉 Đã thêm thành công ${categories.length} categories!`);
        
    } catch (error) {
        console.error('❌ Lỗi khi thêm dữ liệu categories:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seedCategories();
