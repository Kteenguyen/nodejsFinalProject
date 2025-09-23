const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderControllers');
const discountCtrl = require('../controllers/discountControllers');
const auth = require('../middleware/auth');

// POST /api/orders - tạo đơn hàng (guest allowed)
router.post('/', orderCtrl.createOrder);

// GET /api/orders/:orderId - nhận đơn hàng
router.get('/:orderId', orderCtrl.getOrder);

// GET /api/orders/discount/validate?code=XXXXX
router.get('/discount/validate', discountCtrl.validateCode);

// Admin create code - z (should be protected in production)
router.post('/discount', discountCtrl.createCode);

module.exports = router;
