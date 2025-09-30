const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors()) // Enable CORS;


// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// DB
const { connectDB } = require('./config/dbConnection');
connectDB();

// Routes
const siteRoutes = require('./routes/route');
app.use('/', siteRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
