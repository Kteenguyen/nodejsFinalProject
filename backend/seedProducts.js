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

        const products = [{
                productId: 'laptop02',
                productName: 'ASUS TUF Gaming F15',
                brand: 'ASUS',
                productDescription: 'Laptop gaming với CPU Intel i7 và GPU RTX 3050.',
                images: ['/images/asus-tuf-f15.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'L02-16GB', name: '16GB RAM, 512GB SSD', price: 24500000, stock: 18 }
                ]
            },
            {
                productId: 'laptop03',
                productName: 'MSI Katana GF66',
                brand: 'MSI',
                productDescription: 'Hiệu năng cao với RTX 3060 cho game thủ.',
                images: ['/images/msi-katana.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'L03-16GB', name: '16GB RAM, 1TB SSD', price: 27500000, stock: 10 }
                ]
            },
            {
                productId: 'laptop04',
                productName: 'Acer Nitro 5',
                brand: 'Acer',
                productDescription: 'Gaming bình dân hiệu năng tốt.',
                images: ['/images/acer-nitro5.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'L04-8GB', name: '8GB RAM, 512GB SSD', price: 19500000, stock: 22 }
                ]
            },
            {
                productId: 'laptop05',
                productName: 'HP Victus 16',
                brand: 'HP',
                productDescription: 'Chơi game mượt mà với RTX 3050 Ti.',
                images: ['/images/hp-victus.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'L05-16GB', name: '16GB RAM, 512GB SSD', price: 25900000, stock: 12 }
                ]
            },
            {
                productId: 'laptop06',
                productName: 'MacBook Air M2',
                brand: 'Apple',
                productDescription: 'Nhẹ, đẹp và hiệu năng cực mạnh.',
                images: ['/images/macbook-air-m2.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'L06-8GB-256', name: '8GB RAM, 256GB SSD', price: 28900000, stock: 25 }
                ]
            },
            {
                productId: 'laptop07',
                productName: 'Dell Inspiron 15 3520',
                brand: 'Dell',
                productDescription: 'Laptop văn phòng bền bỉ.',
                images: ['/images/dell-inspiron.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                variants: [
                    { variantId: 'L07-8GB', name: '8GB RAM, 512GB SSD', price: 16500000, stock: 30 }
                ]
            },
            {
                productId: 'laptop08',
                productName: 'Gigabyte G5',
                brand: 'Gigabyte',
                productDescription: 'Laptop gaming giá tốt dành cho sinh viên.',
                images: ['/images/gigabyte-g5.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'L08-16GB', name: '16GB RAM, 512GB SSD', price: 22500000, stock: 14 }
                ]
            },
            {
                productId: 'laptop09',
                productName: 'Lenovo ThinkPad X1 Carbon',
                brand: 'Lenovo',
                productDescription: 'Doanh nhân đẳng cấp, độ bền cao.',
                images: ['/images/thinkpad-x1.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                variants: [
                    { variantId: 'L09-16GB', name: '16GB RAM, 1TB SSD', price: 42000000, stock: 6 }
                ]
            },
            {
                productId: 'laptop10',
                productName: 'ASUS ZenBook OLED',
                brand: 'ASUS',
                productDescription: 'Màn OLED siêu đẹp dành cho sáng tạo.',
                images: ['/images/asus-zenbook.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'L10-16GB', name: '16GB RAM, 512GB SSD', price: 31000000, stock: 9 }
                ]
            },
            {
                productId: 'laptop11',
                productName: 'Acer Swift 3',
                brand: 'Acer',
                productDescription: 'Văn phòng nhẹ đẹp giá tốt.',
                images: ['/images/acer-swift3.jpg'],
                category: { categoryId: 'laptop', categoryName: 'Laptop', level: 1 },
                variants: [
                    { variantId: 'L11-8GB', name: '8GB RAM, 512GB SSD', price: 15800000, stock: 27 }
                ]
            },

            // ➕ Monitor
            {
                productId: 'monitor02',
                productName: 'Samsung Odyssey G3 24"',
                brand: 'Samsung',
                productDescription: '144Hz phù hợp gaming.',
                images: ['/images/odyssey-g3.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'M02-24', name: '24 inch, 144Hz', price: 4500000, stock: 40 }
                ]
            },
            {
                productId: 'monitor03',
                productName: 'LG UltraGear 27"',
                brand: 'LG',
                productDescription: 'Màn IPS màu đẹp cho game thủ.',
                images: ['/images/lg-ultragear.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                variants: [
                    { variantId: 'M03-27', name: '27 inch, 165Hz', price: 6500000, stock: 22 }
                ]
            },
            {
                productId: 'monitor04',
                productName: 'AOC 24G2',
                brand: 'AOC',
                productDescription: '144Hz giá rẻ best choice.',
                images: ['/images/aoc-24g2.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'M04-24', name: '24 inch, 144Hz', price: 3900000, stock: 35 }
                ]
            },
            {
                productId: 'monitor05',
                productName: 'ViewSonic VX2758',
                brand: 'ViewSonic',
                productDescription: 'Giải trí đa dụng, màu tốt.',
                images: ['/images/viewsonic-vx2758.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                variants: [
                    { variantId: 'M05-27', name: '27 inch, 75Hz', price: 5200000, stock: 19 }
                ]
            },
            {
                productId: 'monitor06',
                productName: 'Gigabyte M27Q',
                brand: 'Gigabyte',
                productDescription: 'Màn 2K, 170Hz gaming & đồ họa.',
                images: ['/images/gigabyte-m27q.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'M06-27', name: '27 inch, 170Hz, 2K', price: 8600000, stock: 15 }
                ]
            },
            {
                productId: 'monitor07',
                productName: 'Dell S2421HGF',
                brand: 'Dell',
                productDescription: 'Gaming tấm nền VA.',
                images: ['/images/dell-24.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                variants: [
                    { variantId: 'M07-24', name: '24 inch, 144Hz', price: 4500000, stock: 25 }
                ]
            },
            {
                productId: 'monitor08',
                productName: 'MSI Optix G241',
                brand: 'MSI',
                productDescription: 'IPS gaming, giá tốt performance.',
                images: ['/images/msi-g241.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                variants: [
                    { variantId: 'M08-24', name: '24 inch, 144Hz IPS', price: 5100000, stock: 18 }
                ]
            },
            {
                productId: 'monitor09',
                productName: 'ASUS ProArt PA248QV',
                brand: 'ASUS',
                productDescription: 'Màn đồ họa chuẩn màu cho designer.',
                images: ['/images/proart-pa248.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'M09-24', name: '24 inch, 75Hz', price: 6800000, stock: 12 }
                ]
            },
            {
                productId: 'monitor10',
                productName: 'BenQ EW2780',
                brand: 'BenQ',
                productDescription: 'Giải trí, hỗ trợ HDR.',
                images: ['/images/benq-ew2780.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                variants: [
                    { variantId: 'M10-27', name: '27 inch, 75Hz', price: 5900000, stock: 16 }
                ]
            },
            {
                productId: 'monitor11',
                productName: 'Philips 325E1C',
                brand: 'Philips',
                productDescription: 'Màn cong 2K rộng rãi.',
                images: ['/images/philips-325e.jpg'],
                category: { categoryId: 'monitor', categoryName: 'Màn hình', level: 1 },
                variants: [
                    { variantId: 'M11-32', name: '32 inch, 75Hz, 2K', price: 7900000, stock: 9 }
                ]
            },

            // ➕ SSD
            {
                productId: 'ssd02',
                productName: 'Kingston NV2',
                brand: 'Kingston',
                productDescription: 'SSD NVMe giá rẻ, ổn định.',
                images: ['/images/kingston-nv2.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD02-1TB', name: '1TB', price: 1500000, stock: 60 }
                ]
            },
            {
                productId: 'ssd03',
                productName: 'WD Blue SN570',
                brand: 'WD',
                productDescription: 'Ổ NVMe quốc dân.',
                images: ['/images/wd-sn570.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD03-1TB', name: '1TB', price: 1700000, stock: 50 }
                ]
            },
            {
                productId: 'ssd04',
                productName: 'Crucial P3 Plus',
                brand: 'Crucial',
                productDescription: 'Gen4 tốc độ cao giá mềm.',
                images: ['/images/crucial-p3-plus.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'SSD04-1TB', name: '1TB', price: 1900000, stock: 40 }
                ]
            },
            {
                productId: 'ssd05',
                productName: 'Seagate FireCuda 530',
                brand: 'Seagate',
                productDescription: 'Hiệu năng cao dành cho game thủ.',
                images: ['/images/firecuda-530.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                isBestSeller: true,
                variants: [
                    { variantId: 'SSD05-1TB', name: '1TB', price: 2900000, stock: 20 }
                ]
            },
            {
                productId: 'ssd06',
                productName: 'Samsung 990 Pro',
                brand: 'Samsung',
                productDescription: 'Phân khúc cao cấp siêu nhanh.',
                images: ['/images/samsung-990pro.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD06-1TB', name: '1TB', price: 3800000, stock: 25 }
                ]
            },
            {
                productId: 'ssd07',
                productName: 'ADATA XPG SX8200 Pro',
                brand: 'ADATA',
                productDescription: 'Tối ưu hiệu năng cho gaming.',
                images: ['/images/xpg-sx8200pro.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD07-1TB', name: '1TB', price: 2100000, stock: 30 }
                ]
            },
            {
                productId: 'ssd08',
                productName: 'Lexar NM610 Pro',
                brand: 'Lexar',
                productDescription: 'Ổ cao cấp giá cạnh tranh.',
                images: ['/images/lexar-nm610.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                isNewProduct: true,
                variants: [
                    { variantId: 'SSD08-1TB', name: '1TB', price: 1850000, stock: 28 }
                ]
            },
            {
                productId: 'ssd09',
                productName: 'Corsair MP600',
                brand: 'Corsair',
                productDescription: 'SSD hiệu suất cực cao.',
                images: ['/images/corsair-mp600.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD09-1TB', name: '1TB', price: 3300000, stock: 18 }
                ]
            },
            {
                productId: 'ssd10',
                productName: 'Patriot P310',
                brand: 'Patriot',
                productDescription: 'Giá rẻ, hiệu quả.',
                images: ['/images/patriot-p310.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD10-512', name: '512GB', price: 950000, stock: 45 }
                ]
            },
            {
                productId: 'ssd11',
                productName: 'TeamGroup MP33 Pro',
                brand: 'TeamGroup',
                productDescription: 'Lựa chọn ngân sách tối ưu.',
                images: ['/images/tg-mp33.jpg'],
                category: { categoryId: 'ssd', categoryName: 'Ổ cứng', level: 1 },
                variants: [
                    { variantId: 'SSD11-1TB', name: '1TB', price: 1600000, stock: 50 }
                ]
            },
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