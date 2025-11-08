// backend/server.js (ĐÃ NÂNG CẤP LÊN HTTPS)

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const siteRoutes = require('./routes/route'); // Đảm bảo đúng tên file routes chính của fen
const { connectDB } = require('./config/dbConnection'); // Đảm bảo đúng tên file db connection

// --- 1. IMPORT CÁC MODULE CẦN THIẾT CHO HTTPS ---
const https = require('https');
const fs = require('fs'); // File System

const app = express();
const port = Number(process.env.PORT) || 3001;

// --- 2. ĐỌC FILE CHỨNG CHỈ VÀ KHÓA ---
// (Đảm bảo file key.pem và cert.pem nằm cùng cấp với server.js)
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};
// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// --- CẤU HÌNH MIDDLEWARE ---

// CORS (QUAN TRỌNG: Phải cho phép cả 2)
app.use(cors({
    origin: ["http://localhost:3000", "https://localhost:3000"], // Cho phép cả HTTP (dự phòng) và HTTPS
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));



// Phục vụ file tĩnh (Fix lỗi 404 cho ảnh)
app.use(express.static(path.join(__dirname, 'public')));

// --- KẾT NỐI DATABASE ---
connectDB();

// --- CÁC ROUTE CHÍNH ---
// Đảm bảo tên biến route chính của fen là 'siteRoutes' và nó chứa các route con như /api/auth, /api/users
app.use('/api', siteRoutes);

// --- ERROR HANDLERS ---
// ... (phần error handlers giữ nguyên như trong hướng dẫn trước) ...
app.use((req, res, next) => {
    console.log(`[SERVER.JS 404]: Không tìm thấy route: ${req.originalUrl}`);
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error("🚨 [SERVER.JS ERROR HANDLER]: ĐÃ BẮT LỖI TỔNG:", err.message);
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- 3. KHỞI CHẠY SERVER HTTPS THAY VÌ HTTP ---
https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`🚀 HTTPS Backend server đang chạy tại: https://localhost:${port}`);
});

module.exports = app;