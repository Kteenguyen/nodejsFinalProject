const express = require('express');
const router = express.Router();

const userController = require('../controllers/userControllers');
const { protect, admin } = require('../middleware/authMiddleware');

// =============================================================
// ROUTE DÀNH CHO ADMIN (Đã hoàn thiện)
// =============================================================
router.get('/admin/all', protect, admin, userController.getAllUsers);
router.get('/admin/:userId', protect, admin, userController.getUserByIdForAdmin);
router.put('/admin/:userId', protect, admin, userController.updateUserByAdmin);


// =============================================================
// ROUTE DÀNH CHO NGƯỜI DÙNG TỰ QUẢN LÝ (Đã hoàn thiện)
// =============================================================

// --- Quản lý Profile & Mật khẩu ---
// GET /api/users/profile - Lấy thông tin cá nhân của người dùng đang đăng nhập
router.get('/profile', protect, userController.getUserProfile);

// PUT /api/users/profile - Cập nhật thông tin cá nhân
router.put('/profile', protect, userController.updateUserProfile);

// PUT /api/users/password - Đổi mật khẩu
router.put('/password', protect, userController.changePassword);


// --- Quên Mật khẩu ---
// POST /api/users/forgot-password - Yêu cầu link reset (công khai)
router.post('/forgot-password', userController.forgotPassword);

// PATCH /api/users/reset-password/:token - Đặt lại mật khẩu với token (công khai)
router.patch('/reset-password/:token', userController.resetPassword);


// --- Quản lý Địa chỉ Giao hàng ---
// POST /api/users/shipping-address - Thêm địa chỉ mới
router.post('/shipping-address', protect, userController.addShippingAddress);

// PUT /api/users/shipping-address/:addressId - Cập nhật một địa chỉ
router.put('/shipping-address/:addressId', protect, userController.updateShippingAddress);

// DELETE /api/users/shipping-address/:addressId - Xóa một địa chỉ
router.delete('/shipping-address/:addressId', protect, userController.deleteShippingAddress);

// PATCH /api/users/shipping-address/:addressId/set-default - Đặt làm địa chỉ mặc định
router.patch('/shipping-address/:addressId/set-default', protect, userController.setDefaultShippingAddress);


module.exports = router;