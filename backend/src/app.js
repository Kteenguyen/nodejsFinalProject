const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT) || 5000;


// Views and static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../../public')));

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
