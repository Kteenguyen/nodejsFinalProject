// backend/controllers/loyaltyController.js
const User = require('../models/userModel');
const Discount = require('../models/discountModel');

// Lấy danh sách vouchers có thể đổi điểm
exports.getRedeemableVouchers = async (req, res) => {
    try {
        const now = new Date();
        const userId = req.user._id;
        
        const vouchers = await Discount.find({ 
            isRedeemable: true,
            pointsCost: { $gt: 0 },
            // Chỉ lấy voucher còn slot
            $expr: { $lt: ['$uses', '$maxUses'] },
            // Chỉ lấy voucher còn hiệu lực hoặc không có giới hạn thời gian
            $or: [
                { startDate: { $exists: false } },
                { startDate: null },
                { startDate: { $lte: now } }
            ],
            $and: [
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: now } }
                    ]
                }
            ]
        }).select('discountCode discountName percent pointsCost maxUses uses redeemedBy startDate endDate');
        
        // Lọc ra các voucher user chưa đổi
        const availableVouchers = vouchers.filter(v => !v.redeemedBy.includes(userId));
        
        res.status(200).json({ 
            success: true, 
            vouchers: availableVouchers
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy danh sách voucher',
            error: error.message 
        });
    }
};

// Đổi điểm lấy voucher
exports.redeemVoucher = async (req, res) => {
    try {
        const userId = req.user._id;
        const { voucherId } = req.body;

        // Tìm user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        // Tìm voucher
        const voucher = await Discount.findById(voucherId);
        if (!voucher) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy voucher' 
            });
        }

        // Kiểm tra voucher có thể đổi không
        if (!voucher.isRedeemable || voucher.pointsCost <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Voucher này không thể đổi bằng điểm' 
            });
        }

        // Kiểm tra thời gian hiệu lực
        const now = new Date();
        if (voucher.startDate && new Date(voucher.startDate) > now) {
            return res.status(400).json({ 
                success: false, 
                message: 'Voucher chưa có hiệu lực' 
            });
        }
        if (voucher.endDate && new Date(voucher.endDate) < now) {
            return res.status(400).json({ 
                success: false, 
                message: 'Voucher đã hết hạn' 
            });
        }

        // Kiểm tra user đã đổi voucher này chưa
        if (voucher.redeemedBy.includes(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn đã đổi voucher này rồi' 
            });
        }

        // Kiểm tra số lượng voucher còn lại (uses < maxUses)
        if (voucher.uses >= voucher.maxUses) {
            return res.status(400).json({ 
                success: false, 
                message: 'Voucher đã hết lượt sử dụng' 
            });
        }

        // Kiểm tra điểm của user
        if (user.loyaltyPoints < voucher.pointsCost) {
            return res.status(400).json({ 
                success: false, 
                message: `Bạn cần ${voucher.pointsCost} điểm để đổi voucher này. Hiện tại bạn có ${user.loyaltyPoints} điểm.` 
            });
        }

        // Trừ điểm user
        user.loyaltyPoints -= voucher.pointsCost;
        await user.save();

        // Thêm user vào danh sách đã đổi
        voucher.redeemedBy.push(userId);
        await voucher.save();

        res.status(200).json({ 
            success: true, 
            message: `Đổi voucher thành công! Mã voucher: ${voucher.discountCode}`,
            data: {
                voucherCode: voucher.discountCode,
                voucherName: voucher.discountName,
                discount: voucher.percent,
                remainingPoints: user.loyaltyPoints
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi đổi voucher',
            error: error.message 
        });
    }
};

// Lấy danh sách vouchers đã đổi của user
exports.getRedeemedVouchers = async (req, res) => {
    try {
        const userId = req.user._id;

        const vouchers = await Discount.find({ 
            redeemedBy: userId 
        }).select('discountCode discountName percent maxUses uses appliedOrders');

        res.status(200).json({ 
            success: true, 
            vouchers 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy vouchers đã đổi',
            error: error.message 
        });
    }
};

// Lấy thông tin điểm thưởng của user
exports.getLoyaltyPoints = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('loyaltyPoints');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        res.status(200).json({ 
            success: true, 
            loyaltyPoints: user.loyaltyPoints 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy điểm thưởng',
            error: error.message 
        });
    }
};
