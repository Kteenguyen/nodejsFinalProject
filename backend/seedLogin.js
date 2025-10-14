const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/userModel');
const Discount = require('./models/discountModel');

dotenv.config();

// --- DỮ LIỆU MẪU ---
const users = [
    {
        name: 'Admin User',
        userName: 'admin',
        email: 'admin@example.com',
        password: '123456',
        isAdmin: true,
        role: 'admin',
    },
    {
        name: 'Normal User',
        userName: 'user',
        email: 'user@example.com',
        password: '123456',
        isAdmin: false,
        role: 'user',
    },
];

const discounts = [
  {
    discountCode: "WELCOME10",
    discountName: "Mã chào mừng thành viên mới",
    percent: 10,
    maxUses: 10,
    uses: 0,
  },
  {
    discountCode: "FLASH50",
    discountName: "Flash Sale (đã hết)",
    percent: 50,
    maxUses: 5,
    uses: 5,
  }
];

// --- LOGIC SCRIPT ---

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối Database thành công...');

        console.log('🗑️  Xóa dữ liệu cũ...');
        await User.deleteMany();
        await Discount.deleteMany();

        // Xử lý dữ liệu users (thêm userId và mã hóa mật khẩu)
        const processedUsers = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    userId: uuidv4(),
                    password: hashedPassword,
                };
            })
        );
        
        // 👈 SỬA LỖI: Xử lý dữ liệu discounts (thêm discountID)
        const processedDiscounts = discounts.map((discount) => {
            return {
                ...discount,
                discountID: uuidv4(), // Gán một discountID duy nhất
            };
        });

        console.log('➕ Thêm dữ liệu mới...');
        await User.insertMany(processedUsers);
        await Discount.insertMany(processedDiscounts); // 👈 Sử dụng mảng đã được xử lý

        console.log('🎉 Dữ liệu đã được thêm thành công!');
        process.exit();
    } catch (error) {
        console.error(`❌ Lỗi: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối Database thành công...');

        console.log('🗑️  Xóa toàn bộ dữ liệu...');
        await User.deleteMany();
        await Discount.deleteMany();
        
        console.log('🔥 Dữ liệu đã được xóa sạch!');
        process.exit();
    } catch (error) {
        console.error(`❌ Lỗi: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}