const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Thêm uuid để tạo userId

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { userName, password, mail, name, phoneNumber, address } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ mail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({
            userId: uuidv4(),
            userName,
            password: hashedPassword,
            mail,
            name,
            phoneNumber,
            address,
        });

        await newUser.save();

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { mail, password } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        // Tạo token
        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};