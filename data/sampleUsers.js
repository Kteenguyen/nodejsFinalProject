const mongoose = require('mongoose');
const User = require('../models/userModel');
const sampleUsers = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        address: {
            province: 'Province A',
            street: '123 Main St',
            district: 'District 1',
            ward: 'Ward 1'
        },
        phone: '1234567890',
        password: 'password123'
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        address: {
            province: 'Province B',
            street: '456 Elm St',
            district: 'District 2',
            ward: 'Ward 2'
        },
        phone: '0987654321',
        password: 'password456'
    },
    {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        address: {
            province: 'Province C',
            street: '789 Oak St',
            district: 'District 3',
            ward: 'Ward 3'
        },
        phone: '1122334455',
        password: 'password789'
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/shop');
        await User.deleteMany(); // Xóa tất cả dữ liệu cũ
        await User.insertMany(sampleUsers); // Chèn dữ liệu mẫu
        console.log('Database seeded successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

seedDatabase();
