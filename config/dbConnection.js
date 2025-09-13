const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/shop'); // Loại bỏ các tùy chọn không cần thiết
        console.log('Đã kết nối thành công với MongoDB!');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error);
    }
};

const db = mongoose.connection;

module.exports = { connectDB, db };
