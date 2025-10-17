const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

/**
 * [ADMIN] Lấy các số liệu thống kê tổng quan cho Simple Dashboard
 */
exports.getSimpleStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Sử dụng Aggregation Pipeline để tính tổng doanh thu
        const revenueStats = await Order.aggregate([
            {
                $group: {
                    _id: null, // Nhóm tất cả các document lại
                    totalRevenue: { $sum: '$totalPrice' } // Tính tổng của trường totalPrice
                }
            }
        ]);
        
        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

        // Lấy 5 sản phẩm bán chạy nhất (dựa trên flag isBestSeller)
        const bestSellingProducts = await Product.find({ isBestSeller: true }).limit(5);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalOrders,
                totalRevenue,
                bestSellingProducts
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [ADMIN] Lấy dữ liệu thống kê cho Advanced Dashboard (doanh thu theo thời gian)
 * Đã cập nhật để hỗ trợ lọc theo quý và khoảng ngày tùy chọn.
 */
exports.getAdvancedStats = async (req, res) => {
    try {
        const { period = 'monthly', startDate: customStartDate, endDate: customEndDate } = req.query;
        const now = new Date();
        let groupByFormat;
        let matchQuery = {};

        // Ưu tiên khoảng ngày tùy chọn nếu được cung cấp
        if (customStartDate && customEndDate) {
            matchQuery.createdAt = {
                $gte: new Date(customStartDate),
                $lte: new Date(new Date(customEndDate).setHours(23, 59, 59, 999)) // Bao gồm cả ngày kết thúc
            };
            // Khi có khoảng ngày tùy chỉnh, nhóm theo ngày để có cái nhìn chi tiết
            groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        } else {
            let startDate;
            switch (period) {
                case 'yearly':
                    groupByFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
                    startDate = new Date(now.getFullYear() - 5, 0, 1); // 5 năm gần nhất
                    break;
                case 'quarterly':
                    // Nhóm theo năm và quý
                    groupByFormat = {
                        year: { $year: "$createdAt" },
                        quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } }
                    };
                    startDate = new Date(now.getFullYear() - 2, 0, 1); // 2 năm gần nhất để xem quý
                    break;
                case 'weekly':
                    groupByFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
                    startDate = new Date(now.setDate(now.getDate() - 7 * 12)); // 12 tuần gần nhất
                    break;
                case 'monthly':
                default:
                    groupByFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 tháng gần nhất
                    break;
            }
            matchQuery.createdAt = { $gte: startDate };
        }

        const stats = await Order.aggregate([
            {
                $match: matchQuery // Lọc các đơn hàng trong khoảng thời gian
            },
            {
                $group: {
                    _id: groupByFormat,
                    totalRevenue: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // Sắp xếp theo thời gian tăng dần
            }
        ]);

        res.status(200).json({ success: true, stats });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};