const Discount = require('../models/discountModel');
// uuid is ESM-only; use dynamic import helper to generate UUIDs in CommonJS
async function generateUuid() {
    const { v4: uuidv4 } = await import('uuid');
    return uuidv4();
}

// KHÁCH HÀNG: Xác thực mã giảm giá
exports.validateCode = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ valid: false, message: 'Vui lòng nhập mã giảm giá' });

        const discount = await Discount.findOne({ discountCode: code.toUpperCase() });
        if (!discount) return res.status(404).json({ valid: false, message: 'Mã không tồn tại' });

        // Kiểm tra số lượt sử dụng
        if (discount.uses >= discount.maxUses) {
            return res.status(400).json({ valid: false, message: 'Mã đã hết lượt sử dụng' });
        }

        // Kiểm tra thời gian hiệu lực
        const now = new Date();
        if (discount.startDate && new Date(discount.startDate) > now) {
            return res.status(400).json({ valid: false, message: 'Mã chưa có hiệu lực' });
        }
        if (discount.endDate && new Date(discount.endDate) < now) {
            return res.status(400).json({ valid: false, message: 'Mã đã hết hạn' });
        }

        return res.status(200).json({ 
            valid: true, 
            percent: discount.percent, 
            uses: discount.uses, 
            maxUses: discount.maxUses,
            discountName: discount.discountName
        });
    } catch (error) {
        return res.status(500).json({ valid: false, message: error.message });
    }
};

// =================================================================
// CHỨC NĂNG DÀNH CHO ADMIN
// =================================================================

// Quản trị viên: tạo mã giảm giá
exports.createCode = async (req, res) => {
    try {
        const { 
            discountName, 
            percent, 
            maxUses = 1, 
            discountCode,
            startDate,
            endDate,
            conditionType,
            conditionValue,
            productIds,
            isStackable,
            isRedeemable,
            pointsCost
        } = req.body;
        
        if (!discountName || typeof percent === 'undefined') {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        // thực thi maxUses <= 10
        const finalMax = Math.min(parseInt(maxUses) || 1, 10);

        const code = discountCode ? discountCode.toUpperCase() : Math.random().toString(36).slice(2, 7).toUpperCase();

        // xác thực đơn giản: 5 ký tự chữ và số
        if (!/^[A-Z0-9]{5}$/.test(code)) {
            return res.status(400).json({ success: false, message: 'discountCode must be 5 alphanumeric characters (A-Z,0-9)' });
        }

        const existing = await Discount.findOne({ discountCode: code });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Mã đã tồn tại' });
        }

        const discount = new Discount({
            discountID: await generateUuid(),
            discountCode: code,
            discountName,
            percent,
            maxUses: finalMax,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            conditionType: conditionType || 'all',
            conditionValue: conditionValue || '',
            productIds: productIds || [],
            isStackable: isStackable || false,
            isRedeemable: isRedeemable || false,
            pointsCost: pointsCost || 0
        });
        
        await discount.save();
        return res.status(201).json({ success: true, discount });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Quản trị viên: tăng mức sử dụng (gọi khi đơn hàng được xác nhận)
// Cần truyền thêm orderId để lưu lại lịch sử áp dụng
exports.incrementUsage = async (code, orderId) => {
    try {
        const discount = await Discount.findOne({ discountCode: code });
        if (!discount) return null;
        
        discount.uses = (discount.uses || 0) + 1;
        
        // Thêm ID của đơn hàng vào danh sách đã áp dụng
        if(orderId) {
            discount.appliedOrders.push(orderId);
        }

        await discount.save();
        return discount;
    } catch (error) {
        console.error("Error incrementing discount usage:", error);
        return null;
    }
};

// (CHỨC NĂNG MỚI) Quản trị viên: Xem danh sách tất cả mã giảm giá
exports.getAllCodes = async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất
        return res.status(200).json({ success: true, discounts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// (CHỨC NĂNG MỚI) Quản trị viên: Xem chi tiết một mã và danh sách đơn hàng đã áp dụng
exports.getCodeDetails = async (req, res) => {
    try {
        const { code } = req.params;
        const discount = await Discount.findOne({ discountCode: code.toUpperCase() }).populate('appliedOrders');
        
        if (!discount) {
            return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
        }
        
        return res.status(200).json({ success: true, discount });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// (CHỨC NĂNG MỚI) Quản trị viên: Cập nhật mã giảm giá
exports.updateCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { discountName, discountCode, percent, maxUses, startDate, endDate, conditionType, conditionValue, productIds, isStackable, isRedeemable, pointsCost } = req.body;

        const discount = await Discount.findById(id);
        if (!discount) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại' });
        }

        // Nếu đổi mã code, kiểm tra trùng (loại trừ chính nó)
        if (discountCode && discountCode.toUpperCase() !== discount.discountCode) {
            const existing = await Discount.findOne({ 
                discountCode: discountCode.toUpperCase(),
                _id: { $ne: id } // Loại trừ chính discount đang sửa
            });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Mã đã tồn tại' });
            }
            discount.discountCode = discountCode.toUpperCase();
        }

        // Cập nhật các trường khác
        if (discountName !== undefined) discount.discountName = discountName;
        if (percent !== undefined) discount.percent = percent;
        if (maxUses !== undefined) discount.maxUses = maxUses;
        if (startDate !== undefined) discount.startDate = startDate;
        if (endDate !== undefined) discount.endDate = endDate;
        if (conditionType !== undefined) discount.conditionType = conditionType;
        if (conditionValue !== undefined) discount.conditionValue = conditionValue;
        if (productIds !== undefined) discount.productIds = productIds;
        if (isStackable !== undefined) discount.isStackable = isStackable;
        if (isRedeemable !== undefined) discount.isRedeemable = isRedeemable;
        if (pointsCost !== undefined) discount.pointsCost = pointsCost;

        await discount.save();
        return res.status(200).json({ success: true, discount });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// (CHỨC NĂNG MỚI) Quản trị viên: Xóa mã giảm giá
exports.deleteCode = async (req, res) => {
    try {
        const { id } = req.params;
        
        const discount = await Discount.findById(id);
        if (!discount) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại' });
        }

        await discount.deleteOne();
        return res.status(200).json({ success: true, message: 'Đã xóa mã giảm giá' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};