const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartControllers');
const resolveId = require('../middleware/resolveProductId');
const Product = require('../models/productModel');
const { protect } = require('../middleware/authMiddleware');

// Middleware để resolve productId
const resolveProduct = resolveId({
    param: 'productId',
    model: Product,
    customField: 'productId',
    reqKey: 'product'
});

// === ROUTE CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (YÊU CẦU TOKEN) ===
// 2. SỬA LẠI: Sử dụng 'protect' thay vì 'auth'
router.post('/add', protect, resolveProduct, cartController.addToCart);
router.post('/update', protect, resolveProduct, cartController.updateCartItem);
router.get('/', protect, cartController.getCart);
router.post('/clear', protect, cartController.clearCart);

// === ROUTE CÔNG KHAI CHO KHÁCH (GUEST) ===
router.get('/guest', cartController.getGuestCart);
router.post('/guest/add', cartController.addGuestCartItem);
router.post('/guest/update', cartController.updateGuestCartItem);
router.post('/guest/clear', cartController.clearGuestCart);

module.exports = router;