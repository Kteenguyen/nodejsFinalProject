// Seed Admin User for Docker Setup
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import User model
const User = require('./models/userModel');

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || 'mongodb://admin:phoneworld123@localhost:27017/phoneworld?authSource=admin';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@phoneworld.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        // Create admin user
        const admin = await User.create({
            fullName: 'PhoneWorld Admin',
            email: 'admin@phoneworld.com',
            password: hashedPassword,
            phone: '0123456789',
            address: '123 Admin Street',
            role: 'admin',
            isActive: true,
            loyaltyPoints: 0
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@phoneworld.com');
        console.log('🔑 Password: Admin@123');
        console.log('👤 ID:', admin._id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
