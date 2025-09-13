// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    mail: { type: String, required: true },
    name: { type: String },
    phoneNumber: { type: String },
    address: { type: String }
});


module.exports = mongoose.model('User', userSchema);