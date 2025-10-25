// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Đảm bảo đã load .env

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'phone_world_avatars', // Tên thư mục trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'],
        // public_id sẽ là tên file trên Cloudinary
        public_id: (req, file) => `avatar-${req.body.userName || Date.now()}`,
    },
});

const upload = multer({ storage: storage });
module.exports = upload; 