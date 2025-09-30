const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Product = require('./models/productModel'); // đường dẫn tùy vào project

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/shop");
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
        { productId: 'laptop01', productName: 'Laptop Gaming A', price: 2000, image: 'https://via.placeholder.com/150?text=Laptop+Gaming+A', brand: 'BrandX', productDescription: 'Laptop cấu hình cao, chơi game mượt', category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 }, isNewProduct: true, isBestSeller: false },
        { productId: 'laptop02', productName: 'Laptop Văn Phòng B', price: 1000, image: 'https://via.placeholder.com/150?text=Laptop+Van+Phong+B', brand: 'BrandY', productDescription: 'Laptop nhẹ, pin lâu, phù hợp văn phòng', category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 }, isNewProduct: false, isBestSeller: true },
        { productId: 'laptop03', productName: 'Laptop Cấu Hình Trung Bình', price: 1500, image: 'https://via.placeholder.com/150?text=Laptop+Trung+Binh', brand: 'BrandZ', productDescription: 'Laptop ổn định, giá hợp lý', category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 }, isNewProduct: true, isBestSeller: true },

        // Monitors
        { productId: 'monitor01', productName: 'Màn Hình 27 inch', price: 300, image: 'https://via.placeholder.com/150?text=Monitor+27inch', brand: 'BrandM', productDescription: 'Màn hình full HD, tần số quét 144Hz', category: { categoryId: 'monitor', categoryName: 'Monitor', level: 1 }, isNewProduct: false, isBestSeller: true },
        { productId: 'monitor02', productName: 'Màn Hình 24 inch', price: 200, image: 'https://via.placeholder.com/150?text=Monitor+24inch', brand: 'BrandN', productDescription: 'Màn hình sắc nét, dùng cho văn phòng', category: { categoryId: 'monitor', categoryName: 'Monitor', level: 1 }, isNewProduct: true, isBestSeller: false },
        { productId: 'monitor03', productName: 'Màn Hình 32 inch', price: 400, image: 'https://via.placeholder.com/150?text=Monitor+32inch', brand: 'BrandO', productDescription: 'Màn hình rộng, chơi game sống động', category: { categoryId: 'monitor', categoryName: 'Monitor', level: 1 }, isNewProduct: true, isBestSeller: true },

        // SSDs
        { productId: 'ssd01', productName: 'SSD 500GB', price: 80, image: 'https://via.placeholder.com/150?text=SSD+500GB', brand: 'BrandS', productDescription: 'SSD tốc độ cao, boot nhanh', category: { categoryId: 'ssd', categoryName: 'SSD', level: 1 }, isNewProduct: true, isBestSeller: false },
        { productId: 'ssd02', productName: 'SSD 1TB', price: 150, image: 'https://via.placeholder.com/150?text=SSD+1TB', brand: 'BrandS', productDescription: 'Dung lượng lớn, tốc độ cao', category: { categoryId: 'ssd', categoryName: 'SSD', level: 1 }, isNewProduct: true, isBestSeller: true },

        // RAM
        { productId: 'ram01', productName: 'RAM 16GB DDR4', price: 120, image: 'https://via.placeholder.com/150?text=RAM+16GB', brand: 'BrandR', productDescription: 'RAM tốc độ cao cho gaming và đồ họa', category: { categoryId: 'ram', categoryName: 'RAM', level: 1 }, isNewProduct: true, isBestSeller: true },
        { productId: 'ram02', productName: 'RAM 8GB DDR4', price: 60, image: 'https://via.placeholder.com/150?text=RAM+8GB', brand: 'BrandR', productDescription: 'RAM phổ thông cho văn phòng', category: { categoryId: 'ram', categoryName: 'RAM', level: 1 }, isNewProduct: false, isBestSeller: false },

        // Mouse
        { productId: 'mouse01', productName: 'Chuột Gaming', price: 50, image: 'https://via.placeholder.com/150?text=Mouse+Gaming', brand: 'BrandG', productDescription: 'Chuột chính xác, led RGB', category: { categoryId: 'mouse', categoryName: 'Mouse', level: 1 }, isNewProduct: true, isBestSeller: false },
        { productId: 'mouse02', productName: 'Chuột Văn Phòng', price: 20, image: 'https://via.placeholder.com/150?text=Mouse+VanPhong', brand: 'BrandG', productDescription: 'Chuột tiện dụng, bền', category: { categoryId: 'mouse', categoryName: 'Mouse', level: 1 }, isNewProduct: false, isBestSeller: true },

        // Keyboard
        { productId: 'keyboard01', productName: 'Bàn phím cơ', price: 80, image: 'https://via.placeholder.com/150?text=Keyboard+Co', brand: 'BrandK', productDescription: 'Bàn phím cơ switch đỏ, RGB', category: { categoryId: 'keyboard', categoryName: 'Keyboard', level: 1 }, isNewProduct: true, isBestSeller: false },
        { productId: 'keyboard02', productName: 'Bàn phím văn phòng', price: 30, image: 'https://via.placeholder.com/150?text=Keyboard+VanPhong', brand: 'BrandK', productDescription: 'Bàn phím êm ái, gõ nhẹ', category: { categoryId: 'keyboard', categoryName: 'Keyboard', level: 1 }, isNewProduct: false, isBestSeller: true },

        // Headset
        { productId: 'headset01', productName: 'Tai nghe Gaming', price: 70, image: 'https://via.placeholder.com/150?text=Headset+Gaming', brand: 'BrandH', productDescription: 'Âm thanh sống động, led RGB', category: { categoryId: 'headset', categoryName: 'Headset', level: 1 }, isNewProduct: true, isBestSeller: false },
        { productId: 'headset02', productName: 'Tai nghe Văn Phòng', price: 40, image: 'https://via.placeholder.com/150?text=Headset+VanPhong', brand: 'BrandH', productDescription: 'Tai nghe nhẹ, đeo êm', category: { categoryId: 'headset', categoryName: 'Headset', level: 1 }, isNewProduct: false, isBestSeller: true },

        // Mainboard
        { productId: 'mainboard01', productName: 'Mainboard Gaming', price: 250, image: 'https://via.placeholder.com/150?text=Mainboard+Gaming', brand: 'BrandMB', productDescription: 'Mainboard chuẩn ATX, hỗ trợ RAM cao', category: { categoryId: 'mainboard', categoryName: 'Mainboard', level: 1 }, isNewProduct: true, isBestSeller: true },
        { productId: 'mainboard02', productName: 'Mainboard Văn Phòng', price: 150, image: 'https://via.placeholder.com/150?text=Mainboard+VanPhong', brand: 'BrandMB', productDescription: 'Mainboard nhỏ gọn, tiết kiệm điện', category: { categoryId: 'mainboard', categoryName: 'Mainboard', level: 1 }, isNewProduct: false, isBestSeller: false },

        // GPU
        { productId: 'gpu01', productName: 'Card đồ họa RTX 4080', price: 1200, image: 'https://via.placeholder.com/150?text=GPU+RTX4080', brand: 'BrandGPU', productDescription:'Card đồ họa mạnh mẽ, chơi game 4K',
            category: { categoryId: 'gpu', categoryName: 'GPU', level: 1 },
            isNewProduct: true,
            isBestSeller: true
        },
        {
            productId: 'gpu02',
            productName: 'Card đồ họa GTX 1660',
            price: 300,
            image: 'https://via.placeholder.com/150?text=GPU+GTX1660',
            brand: 'BrandGPU',
            productDescription: 'Card phổ thông, chơi game Full HD',
            category: { categoryId: 'gpu', categoryName: 'GPU', level: 1 },
            isNewProduct: false,
            isBestSeller: false
        },

// HDD
        {
            productId: 'hdd01',
            productName: 'HDD 1TB',
            price: 50,
            image: 'https://via.placeholder.com/150?text=HDD+1TB',
            brand: 'BrandHDD',
            productDescription: 'Ổ cứng cơ dung lượng lớn',
            category: { categoryId: 'hdd', categoryName: 'HDD', level: 1 },
            isNewProduct: true,
            isBestSeller: false
        },
        {
            productId: 'hdd02',
            productName: 'HDD 2TB',
            price: 80,
            image: 'https://via.placeholder.com/150?text=HDD+2TB',
            brand: 'BrandHDD',
            productDescription: 'Ổ cứng cơ dung lượng rất lớn',
            category: { categoryId: 'hdd', categoryName: 'HDD', level: 1 },
            isNewProduct: false,
            isBestSeller: true
        },
    ];
    await Product.insertMany(products);
    console.log('Seed products completed');
    process.exit();
};

seedProducts();
