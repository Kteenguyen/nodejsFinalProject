const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();
const app = express()
const port = 3000 // Đổi sang cổng khác

// Set up view engine
app.set('view engine', 'ejs')
app.set('views', './views')

// Import DB config
const { connectDB } = require('./config/dbConnection');

// Connect to MongoDB
connectDB();

// Import controllers
const { getUsers } = require('./controllers/userControllers')

// Import routes        
const routes = require('./routes/route');

// Middleware để parse JSON và dữ liệu từ form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})