
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Product = require('./models/productModel'); // đường dẫn tùy vào project

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const seedProducts = async () => {
    await connectDB();

    // Xóa hết sản phẩm cũ trước khi seed (tùy chọn)
    await Product.deleteMany({});

    const products = [
        // Laptops
        {
            productId: 'laptop01',
            productName: 'Laptop Gaming A',
            price: 2000,
            image: 'laptop_a.jpg',
            brand: 'BrandX',
            productDescription: 'Laptop cấu hình cao, chơi game mượt',
            category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 }
        },
        {
            productId: 'laptop02',
            productName: 'Laptop Văn Phòng B',
            price: 1000,
            image: 'laptop_b.jpg',
            brand: 'BrandY',
            productDescription: 'Laptop nhẹ, pin lâu, phù hợp văn phòng',
            category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 }
        },
        // Monitors
        {
            productId: 'monitor01',
            productName: 'Màn Hình 27 inch',
            price: 300,
            image: 'monitor_27.jpg',
            brand: 'BrandM',
            productDescription: 'Màn hình full HD, tần số quét 144Hz',
            category: { categoryId: 'monitor', categoryName: 'Monitor', level: 1 }
        },
        {
            productId: 'monitor02',
            productName: 'Màn Hình 24 inch',
            price: 200,
            image: 'monitor_24.jpg',
            brand: 'BrandN',
            productDescription: 'Màn hình sắc nét, dùng cho văn phòng',
            category: { categoryId: 'monitor', categoryName: 'Monitor', level: 1 }
        },
        // SSDs
        {
            productId: 'ssd01',
            productName: 'SSD 500GB',
            price: 80,
            image: 'ssd_500.jpg',
            brand: 'BrandS',
            productDescription: 'SSD tốc độ cao, boot nhanh',
            category: { categoryId: 'ssd', categoryName: 'SSD', level: 1 }
        },
        {
            productId: 'ssd02',
            productName: 'SSD 1TB',
            price: 150,
            image: 'ssd_1tb.jpg',
            brand: 'BrandS',
            productDescription: 'Dung lượng lớn, tốc độ cao',
            category: { categoryId: 'ssd', categoryName: 'SSD', level: 1 }
        },
    ];

    await Product.insertMany(products);
    console.log('Seed products completed');
    process.exit();
};

seedProducts();
