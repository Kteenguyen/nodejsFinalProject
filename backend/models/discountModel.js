const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    discountID: { type: String, required: true, unique: true },
    discountCode: { type: String, required: true, unique: true, uppercase: true },
    discountName: { type: String, required: true },
    percent: { type: Number, required: true, min: 0, max: 100 }, // Đổi tên từ percentDiscount và thêm ràng buộc
    maxUses: { type: Number, required: true, min: 1, max: 10 }, // Thêm trường giới hạn sử dụng
    uses: { type: Number, default: 0 }, // Thêm trường đếm số lần đã sử dụng
    appliedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] // Thêm trường để lưu danh sách đơn hàng đã áp dụng
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt, đáp ứng yêu cầu xem "creation time"
});

module.exports = mongoose.model('Discount', discountSchema);