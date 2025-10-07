const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const resolveProduct = require('../middleware/resolveProductId');
const auth = require('../middleware/auth');
const Product = require('../models/productModel');

// Middleware để resolve product
const resolveProductMiddleware = resolveProduct(Product);

// === Danh sách sản phẩm ===
// GET /api/products - Lấy tất cả sản phẩm với phân trang, lọc, sắp xếp
//router.get('/', productController.getProducts);

// === Featured Collections ===
// GET /api/products/collections/bestsellers - Lấy sản phẩm bán chạy
router.get('/collections/bestsellers', productController.getBestSellers);

// GET /api/products/collections/new - Lấy sản phẩm mới
router.get('/collections/new', productController.getNewProducts);

// === Category ===
// GET /api/products/category/:categoryId - Lấy sản phẩm theo danh mục
router.get('/category/:categoryId', productController.getProductsByCategory);

// === Product Detail ===
// GET /api/products/:productId - Lấy chi tiết sản phẩm
router.get('/:productId', resolveProduct, productController.getProductDetails);

// === Reviews ===
// POST /api/products/:productId/reviews - Thêm đánh giá sản phẩm (yêu cầu đăng nhập)
//router.post('/:productId/reviews', auth, resolveProduct, productController.addReviewAndRating);

// === Homepage Sections ===

module.exports = router;
