const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
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

//Tải ảnh tĩnh (phải để trước routes)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// DB
const { connectDB } = require('./config/dbConnection');

// Kết nối đến cơ sở dữ liệu
connectDB();

// Routes
app.use('/api', siteRoutes);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
