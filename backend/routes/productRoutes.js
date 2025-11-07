// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const Product = require('../models/productModel');

// Import middleware
const { protect, admin } = require('../middleware/authMiddleware');
const resolveId = require('../middleware/resolveProductId');

// Tạo middleware để tìm sản phẩm dựa trên productId trong URL
const resolveProductMiddleware = resolveId({
  param: 'productId',
  model: Product,
  reqKey: 'product',
});

// =============================================================
// ROUTE CÔNG KHAI (PUBLIC)
// =============================================================

// Lấy danh sách sản phẩm (có lọc, sắp xếp, phân trang) — đáp #16
router.get('/', productController.getProducts);

// Lấy các bộ sưu tập đặc biệt
router.get('/collections/bestsellers', productController.getBestSellers);
router.get('/collections/new', productController.getNewProducts);

// Lấy sản phẩm theo danh mục (nếu bạn vẫn cần)
router.get('/category/:categoryId', productController.getProductsByCategory);

// === NEW: Enrich giỏ hàng (#17) ===
// LƯU Ý: đặt TRƯỚC '/:productId' để tránh nuốt '/batch'
router.post('/batch', productController.batchProductLines);

// Lấy chi tiết một sản phẩm (RUBIK #11)
router.get('/:productId', resolveProductMiddleware, productController.getProductDetails);

// =============================================================
// CẬP NHẬT: TÁCH ROUTE BÌNH LUẬN & ĐÁNH GIÁ
// =============================================================

// [GUEST] Khách có thể gửi bình luận mà KHÔNG cần đăng nhập
router.post(
  '/:productId/comments',
  resolveProductMiddleware,
  productController.addGuestComment
);

// [USER] Người dùng phải ĐĂNG NHẬP để gửi đánh giá sao
router.post(
  '/:productId/ratings',
  protect, // <-- Bắt buộc đăng nhập
  resolveProductMiddleware,
  productController.addUserRating
);

// =============================================================
// ROUTE DÀNH CHO ADMIN
// =============================================================

// Thêm sản phẩm mới (yêu cầu quyền Admin)
router.post('/', protect, admin, productController.createProduct);

// Cập nhật sản phẩm (yêu cầu quyền Admin)
router.put('/:productId', protect, admin, resolveProductMiddleware, productController.updateProduct);

// Xóa sản phẩm (yêu cầu quyền Admin)
router.delete('/:productId', protect, admin, resolveProductMiddleware, productController.deleteProduct);

module.exports = router;
