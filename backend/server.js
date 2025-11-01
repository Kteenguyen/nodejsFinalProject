const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const siteRoutes = require('./routes/route');

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));


// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// DB
const { connectDB } = require('./config/dbConnection');

// Kết nối đến cơ sở dữ liệu
connectDB();
app.use((err, req, res, next) => {
    console.error("🚨 ĐÃ BẮT LỖI TỔNG (GLOBAL ERROR HANDLER):");
    console.error(err.stack); // Log chi tiết lỗi ra console backend

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message, // Gửi thông báo lỗi về frontend
        // Chỉ gửi stack trace khi ở môi trường dev
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

app.use('/api', siteRoutes);

// ===========================================
// === LOGGING: TEST ROUTE (ĐỂ DEBUG) ===
app.get('/api/test-route', (req, res) => {
    console.log("LOG: /api/test-route ĐÃ CHẠY!");
    res.status(200).send('SERVER.JS: Route test /api/test-route HOẠT ĐỘNG!');
});
// ===========================================

// --- CÁC ROUTE CHÍNH ---
// Thêm log để xem request đi vào /api
app.use('/api', (req, res, next) => {
    console.log(`[SERVER.JS]: Đã nhận request. Method: ${req.method}, URL gốc: ${req.originalUrl}`);
    next();
}, siteRoutes);

// --- ERROR HANDLERS (PHẢI ĐỂ CUỐI CÙNG) ---
// Bắt lỗi 404 (Not Found) - NẾU KHÔNG CÓ ROUTE NÀO KHỚP
app.use((req, res, next) => {
    console.log(`[SERVER.JS 404]: Không tìm thấy route: ${req.originalUrl}`);
    res.status(404);
    next(new Error(`Không tìm thấy - ${req.originalUrl}`));
});

// Bắt lỗi 500 (Global Error Handler)
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error("🚨 [SERVER.JS ERROR HANDLER]: ĐÃ BẮT LỖI TỔNG:", err.message);
    
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
