const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderControllers');
const { protect, admin } = require('../middleware/authMiddleware');
const identifyUser = require('../middleware/identifyUser');
// POST /api/orders - tạo đơn hàng

// SỬA LẠI: Thay thế 'protect' bằng 'identifyUser'
// Middleware này sẽ gán req.user nếu có token, hoặc bỏ qua nếu không có
router.post('/', identifyUser, orderCtrl.createOrder);

// 2. SỬA LẠI: Thêm middleware 'protect' vào route
// Logic của bạn tự xử lý guest (nếu không có token) và user đã đăng nhập (nếu có token)
// nên chúng ta có thể áp dụng middleware một cách linh hoạt hơn hoặc tạo route riêng.
// Cách tiếp cận đơn giản là tạo 2 route riêng biệt.

// Route cho người dùng đã đăng nhập (YÊU CẦU TOKEN)
router.post('/', protect, orderCtrl.createOrder);

// Route cho khách (KHÔNG YÊU CẦU TOKEN) - có thể tạo một controller riêng hoặc xử lý trong createOrder
// Hiện tại, controller của bạn đã xử lý được cả 2 trường hợp, nhưng việc thiếu middleware
// khiến nó không bao giờ nhận diện được người dùng đã đăng nhập.
// Chỉ cần thêm 'protect' vào route chính là đủ.

// === ROUTE CHO ADMIN ===
// GET /api/orders/admin - Lấy tất cả đơn hàng (yêu cầu quyền Admin)
router.get('/admin/all', protect, admin, orderCtrl.getAllOrdersForAdmin);


// GET /api/orders/:orderId - nhận đơn hàng (Nên được bảo vệ)
// Logic này nên kiểm tra xem người dùng có phải chủ đơn hàng không, hoặc có phải admin không
router.get('/:orderId', protect, orderCtrl.getOrder);
router.put('/:orderId/status', protect, admin, orderCtrl.updateOrderStatus);

// CÁC ROUTE KHÁC (giữ nguyên, nhưng cũng cần xem xét bảo vệ nếu cần)
const discountCtrl = require('../controllers/discountControllers');
router.post('/discount', protect, admin, discountCtrl.createCode);
router.get('/discount/validate', discountCtrl.validateCode);
router.post('/discount', discountCtrl.createCode);


module.exports = router;