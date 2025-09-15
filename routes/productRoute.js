const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Lấy danh sách sản phẩm với phân trang, tìm kiếm, lọc và sắp xếp
router.get('/products', productController.getProducts);

// Lấy chi tiết sản phẩm
router.get('/products/:productId', productController.getProductDetails);

// Thêm đánh giá và xếp hạng cho sản phẩm (sử dụng middleware để kiểm tra đăng nhập)
router.post('/products/:productId/reviews', (req, res, next) => {
    // Middleware kiểm tra đăng nhập ở đây
    if (!req.user) {
        return res.status(401).json({ message: 'Bạn phải đăng nhập để đánh giá' });
    }
    next();
}, productController.addReviewAndRating);

module.exports = router;
