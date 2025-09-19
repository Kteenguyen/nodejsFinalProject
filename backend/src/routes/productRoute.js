const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

// GET /api/products - Lấy tất cả sản phẩm với phân trang, lọc, sắp xếp
router.get('/', productController.getProducts);

// GET /api/products/bestsellers - Lấy sản phẩm bán chạy
router.get('/bestsellers', productController.getBestSellers);

// GET /api/products/new - Lấy sản phẩm mới
router.get('/new', productController.getNewProducts);

// GET /api/products/category/:categoryId - Lấy sản phẩm theo danh mục
router.get('/category/:categoryId', productController.getProductsByCategory);

// GET /api/products/:productId - Lấy chi tiết sản phẩm
router.get('/:productId', productController.getProductDetails);

// POST /api/products/:productId/reviews - Thêm đánh giá sản phẩm
router.post('/:productId/reviews', productController.addReviewAndRating);

module.exports = router;
