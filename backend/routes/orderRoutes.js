// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Giữ đúng tên file controller bạn đang có:
// Nếu file là controllers/orderControllers.js => dùng dòng dưới:
const orderCtrl = require('../controllers/orderControllers');
// Nếu bạn đã đổi sang orderController.js => dùng:
// const orderCtrl = require('../controllers/orderController');

const discountCtrl = require('../controllers/discountControllers'); // tương tự: controllers/discountControllers.js
const identifyUser = require('../middleware/identifyUser');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * CREATE ORDER (#21) – khách/đăng nhập đều tạo được
 */
router.post('/', identifyUser, orderCtrl.createOrder);

/**
 * ADMIN LIST (#29)
 * Cung cấp 2 alias để dễ test:
 *  - GET /api/orders            (mới thêm)
 *  - GET /api/orders/admin/all  (giữ tương thích)
 */
router.get('/', protect, admin, orderCtrl.listOrders);
router.get('/admin/all', protect, admin, orderCtrl.listOrders);

/**
 * DISCOUNT – đặt TRƯỚC route có param để khỏi bị nuốt
 */
router.post('/discount', protect, admin, discountCtrl.createCode);
router.get('/discount/validate', discountCtrl.validateCode);

/**
 * USER: danh sách đơn của tôi
 */
router.get('/my', protect, orderCtrl.listMyOrders);

/**
 * ORDER DETAIL & UPDATE STATUS
 */
router.get('/:orderId', protect, orderCtrl.getOrder);
router.put('/:orderId/status', protect, admin, orderCtrl.updateOrderStatus);

module.exports = router;
