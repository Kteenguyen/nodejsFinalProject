const express = require('express');
const router = express.Router();

const orderCtrl = require('../controllers/orderControllers');
const discountCtrl = require('../controllers/discountControllers');

const identifyUser = require('../middleware/identifyUser'); // gán req.user nếu có token, bỏ qua nếu không
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * CREATE ORDER (#21 — gửi email sau khi đặt)
 * - Cho phép guest hoặc user đăng nhập.
 */
router.post('/', identifyUser, orderCtrl.createOrder);

/**
 * ADMIN LIST (#29) — nên đặt trước route param để không bị nuốt
 */
router.get('/admin/all', protect, admin, orderCtrl.listOrders);

/**
 * USER: danh sách đơn của tôi (tùy chọn)
 */
router.get('/my', protect, orderCtrl.listMyOrders);

/**
 * ORDER DETAIL — owner hoặc admin
 */
router.get('/:orderId', protect, orderCtrl.getOrder);

/**
 * UPDATE STATUS — admin
 */
router.put('/:orderId/status', protect, admin, orderCtrl.updateOrderStatus);

/**
 * DISCOUNT — tạo mã (admin), validate (public)
 */
router.post('/discount', protect, admin, discountCtrl.createCode);
router.get('/discount/validate', discountCtrl.validateCode);

module.exports = router;
