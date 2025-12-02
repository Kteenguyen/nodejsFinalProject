// Script tạo test users để test ban feature
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

async function createTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Xóa test users cũ nếu có
        await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });

        // Tạo admin (password sẽ tự động hash qua pre-save hook)
        const admin = await User.create({
            userId: 'USR' + Date.now() + '1',
            name: 'Admin Test',
            userName: 'admin',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin',
            provider: ['local'],
            isVerified: true,
            isBanned: false
        });
        console.log('✅ Admin created:', admin.email);

        // Tạo user thường
        const user = await User.create({
            userId: 'USR' + Date.now() + '2',
            name: 'User Test',
            userName: 'testuser',
            email: 'user@test.com',
            password: 'user123',
            role: 'user',
            provider: ['local'],
            isVerified: true,
            isBanned: false
        });
        console.log('✅ User created:', user.email);

        console.log('\n📋 Test Accounts:');
        console.log('Admin - Email: admin@test.com | Password: admin123');
        console.log('User  - Email: user@test.com  | Password: user123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUsers();
