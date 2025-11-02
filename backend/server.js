// backend/server.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser'); // Đã require
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbConnection');
const siteRoutes = require('./routes/route'); // Chỉ cần import 1 lần

const app = express();
const port = Number(process.env.PORT) || 3001;

// --- CẤU HÌNH MIDDLEWARE (THEO ĐÚNG THỨ TỰ) ---

// 1. CORS (Cho phép request từ frontend)
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

// 2. COOKIE PARSER (ĐỂ ĐỌC req.cookies)
//    *** BẠN ĐANG THIẾU DÒNG NÀY ***
app.use(cookieParser());

// 3. BODY PARSERS (Để đọc req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- KẾT NỐI DATABASE ---
connectDB();

// --- CÁC ROUTE CHÍNH CỦA BẠN ---
// (Xóa các route test và route log lặp lại)
app.use('/api', siteRoutes);

// --- ERROR HANDLERS (PHẢI ĐỂ CUỐI CÙNG) ---

// Bắt lỗi 404 (Not Found) - NẾU KHÔNG CÓ ROUTE NÀO KHỚP
app.use((req, res, next) => {
    console.log(`[SERVER.JS 404]: Không tìm thấy route: ${req.originalUrl}`);
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    res.status(404);
    next(error); // Chuyển lỗi xuống errorHandler tổng
});

// Bắt lỗi 500 (Global Error Handler)
// (Xóa handler lỗi bị đặt sai chỗ ở trên)
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error("🚨 [SERVER.JS ERROR HANDLER]: ĐÃ BẮT LỖI TỔNG:", err.message);

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
app.use(errorHandler);

// --- KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;