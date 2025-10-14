// FileName: discountRoutes.js

const express = require('express');
const router = express.Router();
const discountCtrl = require('../controllers/discountControllers');
const { protect, admin } = require('../middleware/authMiddleware'); // Giả sử bạn có middleware để xác thực và kiểm tra admin

// === PUBLIC ROUTE ===
// Route cho khách hàng kiểm tra mã giảm giá
// GET /api/discounts/validate?code=DISCOUNTCODE
router.get('/validate', discountCtrl.validateCode);


// === ADMIN ROUTES ===
// Các route dưới đây yêu cầu đăng nhập và quyền admin

// Route để admin tạo mã giảm giá mới
// POST /api/discounts
router.post('/', protect, admin, discountCtrl.createCode);

// Route để admin xem tất cả mã giảm giá
// GET /api/discounts
router.get('/', protect, admin, discountCtrl.getAllCodes);

// Route để admin xem chi tiết một mã giảm giá
// GET /api/discounts/DISCOUNTCODE
router.get('/:code', protect, admin, discountCtrl.getCodeDetails);


module.exports = router;