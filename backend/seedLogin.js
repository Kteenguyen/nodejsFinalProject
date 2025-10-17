// seeder.js

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
        userId: uuidv4(),
        name: 'Admin User',
        userName: 'admin',
        email: 'admin@example.com',
        password: '123456',
        isAdmin: true,
        role: 'admin'
    },
    {
        userId: uuidv4(),
        name: 'Normal User',
        userName: 'user',
        email: 'user@example.com',
        password: '123456',
        isAdmin: false,
        role: 'user'
    },
];

const discounts = [
    {
        discountID: uuidv4(),
        discountCode: "SALE10",
        discountName: "Giảm giá 10%",
        percent: 10,
        maxUses: 10,
        uses: 0,
    },
    {
        discountID: uuidv4(),
        discountCode: "USEDUP",
        discountName: "Mã đã hết lượt",
        percent: 20,
        maxUses: 2,
        uses: 2,
    }
];

// --- LOGIC SCRIPT ---
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối Database thành công...');

        console.log('🗑️  Đang xóa dữ liệu Users và Discounts cũ...');
        await User.deleteMany();
        await Discount.deleteMany();

        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return { ...user, password: hashedPassword };
            })
        );
        
        console.log('➕ Đang thêm dữ liệu mới...');
        await User.insertMany(usersWithHashedPasswords);
        await Discount.insertMany(discounts);

        console.log('🎉 Dữ liệu Users và Discounts đã được thêm thành công!');
    } catch (error) {
        console.error(`❌ Lỗi: ${error.message}`);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

importData();