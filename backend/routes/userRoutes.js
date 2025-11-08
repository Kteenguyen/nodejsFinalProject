// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getUserProfile,
    updateUserProfile,
    changeMyPassword,
    getMyAddresses,
    addAddress,
    updateShippingAddress,
    deleteAddress
    // ... (Thêm các hàm admin của fen nếu muốn)
} = require('../controllers/userControllers'); // 👈 Sửa tên file (có S)
const { protect } = require('../middleware/authMiddleware');

// Tất cả các route dưới đây đều yêu cầu đăng nhập
router.use(protect); 

// === Hồ sơ cá nhân ===
router.route('/me')
    .get(getUserProfile) // GET /api/users/me
    .put(updateUserProfile); // PUT /api/users/me

router.put('/change-password', changeMyPassword); // PUT /api/users/change-password

// === Quản lý địa chỉ ===
router.route('/addresses')
    .get(getMyAddresses) // GET /api/users/addresses
    .post(addAddress); // POST /api/users/addresses

router.route('/addresses/:addressId')
    .put(updateShippingAddress) // PUT /api/users/addresses/:addressId
    .delete(deleteAddress); // DELETE /api/users/addresses/:addressId

// (Các route admin của fen)

module.exports = router;