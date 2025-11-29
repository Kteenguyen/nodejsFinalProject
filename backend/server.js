// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const siteRoutes = require('./routes/route'); 
const { connectDB } = require('./config/dbConnection');
const paymentRoutes = require('./routes/paymentRoutes');

// --- HTTP & SOCKET.IO (Đổi từ HTTPS sang HTTP để tránh mixed content) ---
const http = require('http');
const { Server } = require('socket.io'); // Import Socket.io

const app = express();
const port = Number(process.env.PORT) || 3001;

// --- CORS ---
// Lưu ý: Cần config này để Socket.io hoạt động không bị chặn
const corsOptions = {
  origin: ["http://localhost:3000", "https://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

connectDB();

// --- TẠO HTTP SERVER ---
const server = http.createServer(app);

// --- KHỞI TẠO SOCKET.IO ---
const io = new Server(server, {
    cors: corsOptions // Dùng chung config CORS với Express
});

// Lắng nghe kết nối (Optional)
io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Gắn io vào app để dùng trong Controller
app.set('socketio', io);

// --- ROUTES ---
app.use('/api', siteRoutes);

// Error Handlers
app.use((req, res, next) => {
    console.log(`[404]: ${req.originalUrl}`);
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    const code = res.statusCode === 200 ? 500 : res.statusCode;
    console.error("ERROR:", err.message);
    res.status(code).json({ message: err.message });
});

// --- CHẠY SERVER (Dùng biến 'server' thay vì 'app') ---
server.listen(port, () => {
    console.log(`🚀 HTTP Server + Socket.io running on port ${port}`);
});

module.exports = app;