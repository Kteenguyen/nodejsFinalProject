const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shop';

async function seedData() {
  try {
    console.log('🌱 === SEEDING TEST DATA ===\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ===== 1. SEED USERS =====
    console.log('👥 Seeding users...');
    const usersCollection = mongoose.connection.collection('users');
    
    const userCount = await usersCollection.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const hashedPassword2 = await bcrypt.hash('user123', 10);
      const hashedPassword3 = await bcrypt.hash('123456', 10);

      const users = [
        {
          userId: 'admin001',
          userName: 'admin',
          name: 'Admin Test',
          email: 'admin@test.com',
          password: hashedPassword,
          phoneNumber: '0123456789',
          role: 'admin',
          provider: ['local'],
          loyaltyPoints: 0,
          isBanned: false,
          shippingAddresses: [
            {
              fullName: 'Admin Test',
              phoneNumber: '0123456789',
              address: '123 Admin Street',
              city: 'Hồ Chí Minh',
              district: 'Quận 1',
              ward: 'Phường Bến Nghé',
              isDefault: true
            }
          ]
        },
        {
          userId: 'user001',
          userName: 'usertest',
          name: 'User Test',
          email: 'user@test.com',
          password: hashedPassword2,
          phoneNumber: '0987654321',
          role: 'user',
          provider: ['local'],
          loyaltyPoints: 0,
          isBanned: false,
          shippingAddresses: [
            {
              fullName: 'User Test',
              phoneNumber: '0987654321',
              address: '456 User Street',
              city: 'Hồ Chí Minh',
              district: 'Quận 2',
              ward: 'Phường Bình An',
              isDefault: true
            }
          ]
        },
        {
          userId: 'student001',
          userName: '52100759',
          name: 'Nguyễn Khoa Tài',
          email: '52100759@student.tdtu.edu.vn',
          password: hashedPassword3,
          phoneNumber: '0912345678',
          role: 'admin',
          provider: ['local'],
          loyaltyPoints: 0,
          isBanned: false,
          shippingAddresses: [
            {
              fullName: 'Nguyễn Khoa Tài',
              phoneNumber: '0912345678',
              address: 'TDTU Street',
              city: 'Hồ Chí Minh',
              district: 'Quận 7',
              ward: 'Phường Tân Thuận Tây',
              isDefault: true
            }
          ]
        }
      ];

      await usersCollection.insertMany(users);
      console.log(`✅ Created ${users.length} users\n`);
    } else {
      console.log(`⏭️  Users already exist (${userCount}), keeping existing\n`);
    }

    // ===== 2. SEED CATEGORIES =====
    console.log('📂 Seeding categories (fresh reset)...');
    const categoriesCollection = mongoose.connection.collection('categories');
    await categoriesCollection.deleteMany({}); // Delete existing categories to refresh images
    
    const categories = [
      {
        categoryId: 'dien-thoai',
        name: 'Điện thoại',
        slug: 'dien-thoai',
        level: 1,
        parentId: null,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        categoryId: 'laptop',
        name: 'Laptop',
        slug: 'laptop',
        level: 1,
        parentId: null,
        image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=200&h=200&fit=crop',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        categoryId: 'tablet',
        name: 'Tablet',
        slug: 'tablet',
        level: 1,
        parentId: null,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        categoryId: 'phu-kien',
        name: 'Phụ kiện',
        slug: 'phu-kien',
        level: 1,
        parentId: null,
        image: 'https://images.unsplash.com/photo-1588449668338-d13417f16af6?w=200&h=200&fit=crop',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await categoriesCollection.insertMany(categories);
    console.log(`✅ Created ${categories.length} categories\n`);

    // ===== 3. SEED PRODUCTS =====
    console.log('📦 Seeding products (fresh reset)...');
    const productsCollection = mongoose.connection.collection('products');
    await productsCollection.deleteMany({}); // Delete existing products to refresh images
    
    const products = [
      {
        productId: 'prod001',
        productName: 'iPhone 15 Pro Max',
        brand: 'Apple',
        categoryId: 'dien-thoai',
        description: 'iPhone 15 Pro Max hàng chính hãng, thiết kế khung titan bền bỉ, màn hình Dynamic Island sắc nét, chip A17 Pro mạnh mẽ nhất.',
        originalPrice: 34990000,
        salePrice: 29990000,
        quantity: 50,
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop'
        ],
        variants: [
          {
            variantId: 'var001',
            variantName: 'Phiên bản 1',
            color: 'Titan Tự Nhiên',
            capacity: '256GB',
            stock: 25,
            price: 29990000
          },
          {
            variantId: 'var002',
            variantName: 'Phiên bản 2',
            color: 'Titan Xanh',
            capacity: '512GB',
            stock: 25,
            price: 36990000
          }
        ],
        ratings: [],
        avgRating: 4.8,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 'prod002',
        productName: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        categoryId: 'dien-thoai',
        description: 'Samsung Galaxy S24 Ultra tích hợp quyền năng Galaxy AI vượt trội, camera 200MP zoom siêu phân giải, bút S-Pen tiện ích.',
        originalPrice: 33990000,
        salePrice: 28990000,
        quantity: 40,
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop'
        ],
        variants: [
          {
            variantId: 'var003',
            variantName: 'Phiên bản 1',
            color: 'Titan Xám',
            capacity: '256GB',
            stock: 20,
            price: 28990000
          },
          {
            variantId: 'var004',
            variantName: 'Phiên bản 2',
            color: 'Titan Đen',
            capacity: '512GB',
            stock: 20,
            price: 34490000
          }
        ],
        ratings: [],
        avgRating: 4.7,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 'prod003',
        productName: 'MacBook Pro 16"',
        brand: 'Apple',
        categoryId: 'laptop',
        description: 'MacBook Pro 16 inch trang bị chip M3 Max tối thượng cho công việc đồ họa chuyên nghiệp, màn hình Liquid Retina XDR siêu đẹp.',
        originalPrice: 79990000,
        salePrice: 74990000,
        quantity: 20,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop'
        ],
        variants: [
          {
            variantId: 'var005',
            variantName: 'Phiên bản 1',
            color: 'Bạc (Silver)',
            capacity: '16GB RAM / 512GB SSD',
            stock: 10,
            price: 74990000
          },
          {
            variantId: 'var006',
            variantName: 'Phiên bản 2',
            color: 'Đen Không Gian',
            capacity: '32GB RAM / 1TB SSD',
            stock: 10,
            price: 92990000
          }
        ],
        ratings: [],
        avgRating: 4.9,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 'prod004',
        productName: 'iPad Pro 12.9" M2',
        brand: 'Apple',
        categoryId: 'tablet',
        description: 'iPad Pro 12.9 inch M2 hiệu năng đỉnh cao tương đương máy tính, màn hình Liquid Retina XDR mini-LED sống động.',
        originalPrice: 31990000,
        salePrice: 28490000,
        quantity: 30,
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop'
        ],
        variants: [
          {
            variantId: 'var007',
            variantName: 'Phiên bản 1',
            color: 'Xám Không Gian',
            capacity: '128GB Wifi',
            stock: 15,
            price: 28490000
          },
          {
            variantId: 'var008',
            variantName: 'Phiên bản 2',
            color: 'Bạc',
            capacity: '256GB Wifi',
            stock: 15,
            price: 31990000
          }
        ],
        ratings: [],
        avgRating: 4.8,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 'prod005',
        productName: 'AirPods Pro 2 USB-C',
        brand: 'Apple',
        categoryId: 'phu-kien',
        description: 'Tai nghe Apple AirPods Pro 2 trang bị cổng sạc USB-C mới, chống ồn chủ động ANC đỉnh cao, âm thanh vòm sống động.',
        originalPrice: 6190000,
        salePrice: 5690000,
        quantity: 100,
        images: [
          'https://images.unsplash.com/photo-1588449668338-d13417f16af6?w=600&h=600&fit=crop'
        ],
        variants: [
          {
            variantId: 'var009',
            variantName: 'Phiên bản 1',
            color: 'Trắng',
            capacity: 'Tiêu chuẩn',
            stock: 100,
            price: 5690000
          }
        ],
        ratings: [],
        avgRating: 4.7,
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await productsCollection.insertMany(products);
    console.log(`✅ Created ${products.length} products\n`);

    // ===== 4. SEED DISCOUNTS =====
    console.log('🎁 Seeding discounts (fresh reset)...');
    const discountsCollection = mongoose.connection.collection('discounts');
    await discountsCollection.deleteMany({}); // Reset discounts
    
    const discounts = [
      {
        discountID: 'disc001',
        discountCode: 'WELCOME10',
        discountName: 'Chào mừng 10%',
        percent: 10,
        maxUses: 10,
        uses: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        discountID: 'disc002',
        discountCode: 'SUMMER20',
        discountName: 'Hè rực rỡ 20%',
        percent: 20,
        maxUses: 10,
        uses: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await discountsCollection.insertMany(discounts);
    console.log(`✅ Created ${discounts.length} discounts\n`);

    console.log('✅ ✅ ✅ SEEDING COMPLETED SUCCESSFULLY! ✅ ✅ ✅\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   User: user@test.com / user123');
    console.log('   Student Admin: 52100759@student.tdtu.edu.vn / 123456');
    console.log('\n🚀 Ready to test! Visit: https://localhost:3000');

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
