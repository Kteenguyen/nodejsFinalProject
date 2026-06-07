// backend/server.js
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const siteRoutes = require('./routes/route'); 
const { connectDB } = require('./config/dbConnection');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// --- HTTP/HTTPS & SOCKET.IO ---
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');

const app = express();
const port = Number(process.env.PORT) || 3001;

// --- CORS ---
const corsOptions = {
    origin: [
        "https://localhost:3000", 
        "http://localhost:3000",
        "http://localhost:3080",
        process.env.FRONTEND_URL || ""
    ].filter(Boolean),
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

// --- CREATE SERVER (HTTPS nếu có cert, fallback HTTP) ---
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || path.join(__dirname, 'cert.pem');
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || path.join(__dirname, 'key.pem');

let server;
let serverProtocol = 'http';

const certExists = !process.env.VERCEL && fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH);

if (certExists) {
    const httpsOptions = {
        cert: fs.readFileSync(SSL_CERT_PATH),
        key: fs.readFileSync(SSL_KEY_PATH)
    };
    server = https.createServer(httpsOptions, app);
    serverProtocol = 'https';
    console.log('✅ HTTPS server enabled. Certificates loaded.');

    const httpFallbackPort = Number(process.env.HTTP_PORT || 0);
    if (httpFallbackPort) {
        http.createServer(app).listen(httpFallbackPort, () => {
            console.log(`ℹ️  HTTP fallback server running on http://localhost:${httpFallbackPort}`);
        });
    }
} else {
    console.warn('⚠️  SSL certificates not found. Running in HTTP mode.');
    server = http.createServer(app);
}

// --- KHỞI TẠO SOCKET.IO ---
const io = new Server(server, {
    cors: corsOptions
});

// Lắng nghe kết nối
io.on('connection', (socket) => {
    console.log('⚡ Client connected:', socket.id);
    
    // ============ CHAT SOCKET EVENTS ============
    
    // Admin join room để nhận thông báo tin nhắn mới
    socket.on('admin-join', () => {
        socket.join('admin-room');
        console.log(`👤 Admin joined admin-room: ${socket.id}`);
    });
    
    // Customer join room conversation của mình
    socket.on('join-conversation', (conversationId) => {
        socket.join(`conversation-${conversationId}`);
        console.log(`💬 User joined conversation-${conversationId}: ${socket.id}`);
    });
    
    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
        socket.leave(`conversation-${conversationId}`);
        console.log(`🚪 User left conversation-${conversationId}: ${socket.id}`);
    });
    
    // Admin join conversation cụ thể để chat
    socket.on('admin-join-conversation', (conversationId) => {
        socket.join(`conversation-${conversationId}`);
        console.log(`👤 Admin joined conversation-${conversationId}: ${socket.id}`);
    });
    
    // Typing indicators
    socket.on('typing-start', ({ conversationId, sender, senderName }) => {
        socket.to(`conversation-${conversationId}`).emit('user-typing', { 
            conversationId, 
            sender, 
            senderName 
        });
        // Notify admin room nếu là customer đang gõ
        if (sender === 'user') {
            socket.to('admin-room').emit('user-typing', { 
                conversationId, 
                sender, 
                senderName 
            });
        }
    });
    
    socket.on('typing-stop', ({ conversationId, sender }) => {
        socket.to(`conversation-${conversationId}`).emit('user-stop-typing', { 
            conversationId, 
            sender 
        });
        if (sender === 'user') {
            socket.to('admin-room').emit('user-stop-typing', { 
                conversationId, 
                sender 
            });
        }
    });
    
    // ============================================
    
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Gắn io vào app để dùng trong Controller
app.set('socketio', io);

// --- HEALTH CHECK ENDPOINT ---
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    res.status(200).json({ 
        status: 'ok', 
        message: 'PhoneWorld API is running',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
            hasMongoUri: !!process.env.MONGODB_URI,
            dbState: mongoose.connection.readyState // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        }
    });
});

// --- ROUTES ---
app.use('/api/upload', uploadRoutes);
app.use('/api', siteRoutes);

// Fallback routing for Vercel Multi-Services (in case Vercel strips /api prefix)
app.use('/upload', uploadRoutes);
app.use('/', siteRoutes);

// --- SERVE STATIC FRONTEND (Production) ---
if (process.env.NODE_ENV === 'production') {
    // Serve static files from React build
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    // Handle React routing - return index.html for any non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
} else {
    // Development route
    app.get('/', (req, res) => {
        res.json({ 
            message: 'PhoneWorld API Development Server',
            frontend: 'Run separately on port 3000'
        });
    });
}

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

// --- CHẠY SERVER ---
server.listen(port, () => {
    console.log(`🚀 ${serverProtocol.toUpperCase()} Server + Socket.io running on port ${port}`);
});

module.exports = app;