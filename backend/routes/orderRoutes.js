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
router.get('/admin/dashboard/stats', protect, admin, orderCtrl.getDashboardStats);

// Xem danh sách đơn hàng (Admin)
router.get('/', protect, admin, orderCtrl.listOrders);
router.get('/admin/all', protect, admin, orderCtrl.listOrders);

// Discount
router.post('/discount', protect, admin, discountCtrl.createCode);
router.get('/discount/validate', discountCtrl.validateCode);

// User xem đơn của mình
router.get('/myorders', protect, orderCtrl.listMyOrders);

// Check trạng thái đơn hàng (không cần auth - dùng cho polling sau thanh toán VNPay)
router.get('/status/:orderId', orderCtrl.checkOrderStatus);

// Upload ảnh chứng từ chuyển khoản (User)
router.post('/:orderId/upload-proof', orderCtrl.uploadPaymentProof);

// Admin xác nhận thanh toán
router.post('/:orderId/confirm-payment', protect, admin, orderCtrl.confirmPayment);

// Mark order as paid (TEST ONLY - xác nhận thanh toán thủ công)
router.post('/:orderId/mark-paid', orderCtrl.markOrderAsPaid);

// Chi tiết và cập nhật trạng thái
router.get('/:orderId', protect, orderCtrl.getOrder);
router.put('/:orderId/status', protect, admin, orderCtrl.updateOrderStatus);

module.exports = router;