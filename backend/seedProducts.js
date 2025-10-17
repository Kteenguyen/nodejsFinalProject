// seedProducts.js

const mongoose = require('mongoose');
require('dotenv').config(); // Đảm bảo nạp biến môi trường
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

const seedProducts = async () => {
    await connectDB();
    
    try {
        console.log('🗑️  Đang xóa dữ liệu sản phẩm cũ...');
        await Product.deleteMany({});

        const products = [
            {
                productId: 'laptop01',
                productName: 'Laptop Gaming Legion 5',
                brand: 'Lenovo',
                productDescription: 'Laptop gaming mạnh mẽ với CPU AMD Ryzen 7 và card đồ họa NVIDIA RTX 3060, màn hình 165Hz cho trải nghiệm chơi game đỉnh cao.',
                images: ['/images/legion5.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isNewProduct: true,
                isBestSeller: true,
                variants: [
                    { variantId: 'L01-BLACK-16GB', name: 'Màu Đen, 16GB RAM, 512GB SSD', price: 28500000, stock: 15 },
                    { variantId: 'L01-WHITE-32GB', name: 'Màu Trắng, 32GB RAM, 1TB SSD', price: 32000000, stock: 8 }
                ]
            },
            {
                productId: 'monitor01',
                productName: 'Màn Hình Dell UltraSharp 4K',
                brand: 'Dell',
                productDescription: 'Màn hình 27 inch độ phân giải 4K, độ phủ màu 99% sRGB, lý tưởng cho công việc đồ họa và sáng tạo nội dung.',
                images: ['/images/dell-ultrasharp.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'M01-27INCH', name: '27 inch, 60Hz', price: 12500000, stock: 20 },
                    { variantId: 'M01-32INCH', name: '32 inch, 60Hz', price: 18000000, stock: 12 }
                ]
            },
            {
                productId: 'ssd01',
                productName: 'Ổ cứng SSD Samsung 980 Pro',
                brand: 'Samsung',
                productDescription: 'Ổ cứng SSD NVMe PCIe Gen 4 với tốc độ đọc ghi siêu nhanh, giúp tăng tốc độ khởi động và tải ứng dụng.',
                images: ['/images/samsung-980pro.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'SSD980-1TB', name: 'Dung lượng 1TB', price: 3500000, stock: 50 },
                    { variantId: 'SSD980-2TB', name: 'Dung lượng 2TB', price: 6200000, stock: 25 }
                ]
            }
        ];

        console.log('➕ Đang thêm dữ liệu sản phẩm mới...');
        await Product.insertMany(products);
        console.log(`🎉 Đã thêm thành công ${products.length} sản phẩm!`);
        
    } catch (error) {
        console.error('❌ Lỗi khi thêm dữ liệu sản phẩm:', error);
    } finally {
        // Đóng kết nối sau khi hoàn tất
        mongoose.connection.close();
        process.exit();
    }
};

seedProducts();