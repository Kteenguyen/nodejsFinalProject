const path = require('path');
const express = require('express');
const cors = require('cors');
const siteRoutes = require('./routes/route');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({
    origin: "http://localhost:3001",  // Đúng domain frontend
    credentials: true,                // Cho phép cookie / token
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
