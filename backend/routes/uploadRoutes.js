// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Cấu hình Cloudinary config từ env
const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (hasCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Xác định thư mục upload tạm (nếu chạy trên Vercel thì dùng /tmp)
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../public/images');
if (!isVercel && !fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Failed to create upload directory:', err.message);
    }
}

// Cấu hình disk storage cho local
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Cấu hình Cloudinary Storage cho product images
const cloudinaryStorage = hasCloudinary ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'phone_world_products',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => {
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            return `${name}-${Date.now()}`;
        }
    }
}) : null;

// Chọn storage phù hợp
const storage = hasCloudinary ? cloudinaryStorage : diskStorage;

// Filter để chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

// Cấu hình upload với giới hạn kích thước
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter
});

// Route upload ảnh đơn
router.post('/image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không có file nào được upload!' 
            });
        }

        // Trả về đường dẫn ảnh
        const imagePath = hasCloudinary ? req.file.path : `/images/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Upload ảnh thành công!',
            imagePath: imagePath,
            path: imagePath,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi upload ảnh!' 
        });
    }
});

// Route upload nhiều ảnh
router.post('/images', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không có file nào được upload!' 
            });
        }

        // Trả về mảng đường dẫn ảnh
        const imagePaths = req.files.map(file => hasCloudinary ? file.path : `/images/${file.filename}`);
        
        res.json({
            success: true,
            message: `Upload ${req.files.length} ảnh thành công!`,
            imagePaths: imagePaths,
            files: req.files.map(file => ({
                path: hasCloudinary ? file.path : `/images/${file.filename}`,
                filename: file.filename,
                originalname: file.originalname,
                size: file.size
            }))
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi upload ảnh!' 
        });
    }
});

// Middleware xử lý lỗi multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn! Kích thước tối đa là 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Lỗi upload file: ' + error.message
        });
    }
    
    if (error.message === 'Chỉ chấp nhận file ảnh!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
});

module.exports = router;