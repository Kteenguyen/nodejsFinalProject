const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartControllers');
const resolveId = require('../middleware/resolveProductId');
const auth = require('../middleware/auth');
const Product = require('../models/productModel');

// Middleware để resolve productId
const resolveProduct = resolveId({
    param: 'productId',
    model: Product,
    customField: 'productId',
    reqKey: 'product'
});

// POST /api/cart/add - Thêm sản phẩm vào giỏ hàng (yêu cầu đăng nhập)
router.post('/add', auth, resolveProduct, cartController.addToCart);

// POST /api/cart/update - Cập nhật số lượng hoặc xóa sản phẩm (yêu cầu đăng nhập)
router.post('/update', auth, resolveProduct, cartController.updateCartItem);

// GET /api/cart - Lấy giỏ hàng (yêu cầu đăng nhập)
router.get('/', auth, cartController.getCart);

// POST /api/cart/clear - Xóa toàn bộ giỏ hàng (yêu cầu đăng nhập)
router.post('/clear', auth, cartController.clearCart);

module.exports = router;
