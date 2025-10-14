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
        if (!code) return res.status(400).json({ message: 'code required' });

        const discount = await Discount.findOne({ discountCode: code.toUpperCase() });
        if (!discount) return res.status(404).json({ valid: false, message: 'Mã không tồn tại' });

        if (discount.uses >= discount.maxUses) {
            return res.status(400).json({ valid: false, message: 'Mã đã hết lượt sử dụng' });
        }

        return res.status(200).json({ valid: true, percent: discount.percent, uses: discount.uses, maxUses: discount.maxUses });
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
        const { discountName, percent, maxUses = 1, discountCode } = req.body;
        if (!discountName || typeof percent === 'undefined') return res.status(400).json({ message: 'Missing fields' });

        // thực thi maxUses <= 10
        const finalMax = Math.min(parseInt(maxUses) || 1, 10);

        const code = discountCode ? discountCode.toUpperCase() : Math.random().toString(36).slice(2, 7).toUpperCase();

        // xác thực đơn giản: 5 ký tự chữ và số
        if (!/^[A-Z0-9]{5}$/.test(code)) {
            return res.status(400).json({ message: 'discountCode must be 5 alphanumeric characters (A-Z,0-9)' });
        }

        const existing = await Discount.findOne({ discountCode: code });
        if (existing) return res.status(409).json({ message: 'Mã đã tồn tại' });

        const discount = new Discount({
            discountID: await generateUuid(),
            discountCode: code,
            discountName,
            percent,
            maxUses: finalMax
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