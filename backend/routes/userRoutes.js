// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// === LOGGING (Middleware chạy đầu tiên) ===
router.use((req, res, next) => {
    console.log(`[USERROUTES.JS]: Đã nhận request. Method: ${req.method}, URL: ${req.url}`);
    next();
});

const userController = require('../controllers/userControllers');
const { protect, admin } = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/userControllers');

// =============================================================
// ROUTE DÀNH CHO NGƯỜI DÙNG (PHẢI ĐẶT TRƯỚC)
// =============================================================

// --- Quản lý Profile (FIX: ĐẶT LÊN TRÊN CÙNG) ---
// GET /api/users/profile
router.get('/profile', protect, (req, res, next) => {
    // Log này phải xuất hiện
    console.log("[USERROUTES.JS]: Đã khớp route GET /profile. Đang gọi getUserProfile...");
    next();
}, getUserProfile);

// PUT /api/users/profile
router.put('/profile', protect, userController.updateUserProfile);

// --- Đổi Mật khẩu ---
router.put('/password', protect, userController.changePassword);

// --- Quên Mật khẩu (CÔNG KHAI - KHÔNG CẦN PROTECT) ---
router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password/:token', userController.resetPassword);

// --- Quản lý Địa chỉ Giao hàng ---
router.post('/shipping-address', protect, userController.addShippingAddress);
router.put('/shipping-address/:addressId', protect, userController.updateShippingAddress);
router.delete('/shipping-address/:addressId', protect, userController.deleteShippingAddress);
router.patch('/shipping-address/:addressId/set-default', protect, userController.setDefaultShippingAddress);


// =============================================================
// ROUTE DÀNH CHO ADMIN (ĐẶT SAU CÁC ROUTE CỤ THỂ)
// (Các route này cần :userId động nên phải ở dưới /profile)
// =============================================================
router.get('/', protect, admin, userController.getAllUsers); // Lấy TẤT CẢ users
router.get('/:userId', protect, admin, userController.getUserByIdForAdmin); // Lấy 1 user (phải là admin)
router.put('/:userId', protect, admin, userController.updateUserByAdmin); // Cập nhật 1 user (phải là admin)

module.exports = router;