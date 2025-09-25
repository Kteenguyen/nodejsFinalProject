const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cartControllers');
const auth = require('../middleware/auth');

// POST /api/cart/add - thêm vào giỏ hàng (khách hoặc người dùng xác thực). trả về cartId cho khách
router.post('/add', cartCtrl.addToCart);

// POST /api/cart/update - cập nhật số lượng hoặc xóa
router.post('/update', cartCtrl.updateCartItem);

// GET /api/cart - lấy các mặt hàng trong giỏ hàng (truyền cartId cho tiêu đề khách hoặc xác thực)
router.get('/', cartCtrl.getCart);

// POST /api/cart/clear - xóa giỏ hàng
router.post('/clear', cartCtrl.clearCart);

module.exports = router;
