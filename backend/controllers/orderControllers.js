const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail'); // <-- Đảm bảo bạn đã import
const Discount = require('../models/discountModel');
const discountCtrl = require('./discountControllers');

// uuid is ESM-only; use dynamic import helper to generate UUIDs in CommonJS
async function generateUuid() {
    const { v4: uuidv4 } = await import('uuid');
    return uuidv4();
}


/**
 * Helper function để tính toán thông tin item từ giỏ hàng - ĐÃ CẬP NHẬT CHO VARIANTS
 */
async function buildItemsFromCartEntries(entries) {
    const items = [];
    let subTotal = 0;

    for (const e of entries) { // 'e' là một bản ghi từ collection Carts
        const product = await Product.findById(e.productId);
        if (!product) continue;

        // Tìm đúng biến thể mà người dùng đã chọn trong giỏ hàng
        const variant = product.variants.find(v => v.variantId === e.variantId);
        if (!variant) continue; // Bỏ qua nếu biến thể không còn tồn tại

        // Lấy giá từ BIẾN THỂ, không phải từ sản phẩm gốc
        const price = variant.price;
        const qty = e.quantity;

        // Thêm đầy đủ thông tin vào item của đơn hàng, bao gồm cả variantId
        items.push({
            productId: product._id,
            variantId: variant.variantId,
            name: `${product.productName} - ${variant.name}`, // Tên đầy đủ hơn
            price,
            quantity: qty
        });
        subTotal += price * qty;
    }
    return { items, subTotal };
}

/**
 * Tạo đơn hàng - ĐÃ CẬP NHẬT VỚI LOGIC TẠO TÀI KHOẢN VÀ TÍNH ĐIỂM
 */
exports.createOrder = async (req, res) => {
    try {
        const { cartId, shippingAddress, paymentMethod, guestInfo, discountCode } = req.body;
        const loggedInAccountId = req.user && req.user.id ? req.user.id : null;

        if (!shippingAddress || !paymentMethod) return res.status(400).json({ message: 'shippingAddress and paymentMethod required' });

        let entries = [];
        if (loggedInAccountId) {
            entries = await Cart.find({ accountId: loggedInAccountId });
        } else if (cartId) {
            entries = await Cart.find({ cartId });
        } else {
            return res.status(400).json({ message: 'cartId required for guest' });
        }

        if (entries.length === 0) return res.status(400).json({ message: 'Giỏ hàng rỗng' });

        // Gọi hàm xử lý
        const { items, subTotal } = await buildItemsFromCartEntries(entries);

        const shippingPrice = subTotal > 1000000 ? 0 : 30000;
        const tax = +(subTotal * 0.1).toFixed(2);
        let discountAmount = 0;
        let discountPayload = null;
        
        if (discountCode) {
            const d = await Discount.findOne({ discountCode: discountCode.toUpperCase() });
            if (d && d.uses < d.maxUses) {
                discountAmount = +(subTotal * (d.percent / 100)).toFixed(2);
                discountPayload = { code: d.discountCode, percent: d.percent, amount: discountAmount };
            }
        }
            
        const totalPrice = +(subTotal - discountAmount + tax + shippingPrice).toFixed(2);
        
        let finalAccountId = loggedInAccountId;
        let customerEmail;
        let customerName;

        if (!loggedInAccountId && guestInfo && guestInfo.email) {
            const guestEmail = guestInfo.email.toLowerCase();
            customerEmail = guestEmail;
            customerName = guestInfo.name;
            let guestUser = await User.findOne({ email: guestEmail });

            if (!guestUser) {
                const randomPassword = await generateUuid();
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                
                guestUser = new User({
                    userId: await generateUuid(),
                    name: guestInfo.name,
                    email: guestEmail,
                    userName: guestEmail,
                    password: hashedPassword,
                });
                await guestUser.save();
            }
            finalAccountId = guestUser.userId;
        } else if (loggedInAccountId) {
            const user = await User.findOne({ userId: loggedInAccountId });
            if (user) {
                customerEmail = user.email;
                customerName = user.name;
            }
        }

        const order = new Order({
            orderId: uuidv4(),
            accountId: finalAccountId,
            guestInfo: loggedInAccountId ? null : guestInfo,
            items,
            shippingAddress,
            paymentMethod,
            shippingPrice,
            subTotal,
            discount: discountPayload,
            tax,
            totalPrice
        });

        await order.save();
        
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.productId, 'variants.variantId': item.variantId },
                { $inc: { 'variants.$.stock': -item.quantity } }
            );
        }

        if (discountPayload) {
            await discountCtrl.incrementUsage(discountPayload.code, order._id);
        }
        
        if (loggedInAccountId) {
            await Cart.deleteMany({ accountId: loggedInAccountId });
        } else if (cartId) {
            await Cart.deleteMany({ cartId });
        }
        
        if (finalAccountId) {
            const pointsEarned = Math.floor(order.totalPrice / 10000);
            if (pointsEarned > 0) {
                await User.findOneAndUpdate(
                    { userId: finalAccountId },
                    { $inc: { loyaltyPoints: pointsEarned } },
                    { new: true }
                );
            }
        }
        
        if (customerEmail) {
            try {
                await sendEmail({
                    to: customerEmail,
                    subject: `Xác nhận đơn hàng #${order.orderId}`,
                    html: `
                        <h1>Cảm ơn bạn đã đặt hàng!</h1>
                        <p>Chào ${customerName},</p>
                        <p>Chúng tôi đã nhận được đơn hàng của bạn. Dưới đây là thông tin chi tiết:</p>
                        <p><strong>Mã đơn hàng:</strong> ${order.orderId}</p>
                        <p><strong>Tổng tiền:</strong> ${order.totalPrice.toLocaleString('vi-VN')} ₫</p>
                        <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được vận chuyển.</p>
                    `
                });
            } catch (emailError) {
                console.error("Lỗi gửi email xác nhận đơn hàng:", emailError);
            }
        }

        return res.status(201).json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết đơn hàng
exports.getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId }).populate('items.productId');
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
/**
 * [ADMIN] Lấy tất cả đơn hàng với phân trang và bộ lọc
 */
exports.getAllOrdersForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Sắp xếp đơn hàng mới nhất lên đầu
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);

        return res.status(200).json({
            success: true,
            orders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * [ADMIN] Cập nhật trạng thái đơn hàng
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Trạng thái mới là bắt buộc' });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        order.status = status;

        order.statusHistory.push({ status, updatedAt: new Date() });

        await order.save();
        
        // ================== CẬP NHẬT: GỬI EMAIL CẬP NHẬT TRẠNG THÁI ==================
        let customerEmail;
        if (order.accountId) {
             const user = await User.findOne({ userId: order.accountId });
             if(user) customerEmail = user.email;
        } else if (order.guestInfo && order.guestInfo.email) {
            customerEmail = order.guestInfo.email;
        }

        if (customerEmail) {
            try {
                 await sendEmail({
                    to: customerEmail,
                    subject: `Cập nhật trạng thái đơn hàng #${order.orderId}`,
                    html: `
                        <p>Trạng thái đơn hàng của bạn đã được cập nhật thành: <strong>${status}</strong>.</p>
                        <p>Bạn có thể theo dõi chi tiết đơn hàng tại website của chúng tôi.</p>
                    `
                });
            } catch (emailError) {
                console.error("Lỗi gửi email cập nhật trạng thái:", emailError);
            }
        }
        // =========================================================================

        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};