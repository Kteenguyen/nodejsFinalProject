// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const discountCtrl = require('../controllers/discountControllers');
const identifyUser = require('../middleware/identifyUser');
const { protect, admin } = require('../middleware/authMiddleware');
const orderCtrl = require('../controllers/orderControllers');

// Tạo đơn
router.post('/', identifyUser, orderCtrl.createOrder);

// --- ROUTE MỚI: Thống kê Dashboard (Đặt trước các route có :id) ---
router.get('/dashboard/stats', protect, admin, orderCtrl.getDashboardStats);

// Xem danh sách đơn hàng (Admin)
router.get('/', protect, admin, orderCtrl.listOrders);
router.get('/admin/all', protect, admin, orderCtrl.listOrders);

// Discount
router.post('/discount', protect, admin, discountCtrl.createCode);
router.get('/discount/validate', discountCtrl.validateCode);

// User xem đơn của mình
router.get('/myorders', protect, orderCtrl.listMyOrders);

// Chi tiết và cập nhật trạng thái
router.get('/:orderId', protect, orderCtrl.getOrder);
router.put('/:orderId/status', protect, admin, orderCtrl.updateOrderStatus);

module.exports = router;