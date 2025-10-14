const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
// uuid is ESM-only; use dynamic import helper to generate UUIDs in CommonJS
async function generateUuid() {
    const { v4: uuidv4 } = await import('uuid');
    return uuidv4();
}
const Discount = require('../models/discountModel');
const discountCtrl = require('./discountControllers');

// Trợ giúp tính toán các mặt hàng trong giỏ hàng (từ các mục nhập trong giỏ hàng)
async function buildItemsFromCartEntries(entries) {
    const items = [];
    let subTotal = 0;
    for (const e of entries) {
        const product = await Product.findById(e.productId);
        if (!product) continue;
        const price = product.price;
        const qty = e.quantity;
        items.push({ productId: product._id, name: product.productName, price, quantity: qty });
        subTotal += price * qty;
    }
    return { items, subTotal };
}

// Tạo đơn hàng - hỗ trợ khách (cung cấp guestInfo) hoặc người dùng đã xác thực
exports.createOrder = async (req, res) => {
    try {
        const { cartId, shippingAddress, paymentMethod, guestInfo, discountCode } = req.body;
        const accountId = req.user && req.user.id ? req.user.id : null;

        if (!shippingAddress || !paymentMethod) return res.status(400).json({ message: 'shippingAddress and paymentMethod required' });

        // Lấy các mặt hàng trong giỏ hàng
        let entries = [];
        if (accountId) {
            entries = await Cart.find({ accountId });
        } else if (cartId) {
            entries = await Cart.find({ cartId });
        } else {
            return res.status(400).json({ message: 'cartId required for guest' });
        }

        const { items, subTotal } = await buildItemsFromCartEntries(entries);

        if (!items || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng rỗng' });

        // tính toán chi phí vận chuyển (giá cố định đơn giản hoặc dựa trên tổng phụ)
        const shippingPrice = subTotal > 1000 ? 0 : 50; // placeholder logic

        // thuế 10%
        const tax = +(subTotal * 0.1).toFixed(2);

        // áp dụng giảm giá nếu có
        let discount = null;
        let discountAmount = 0;
        if (discountCode) {
            const d = await Discount.findOne({ discountCode: discountCode.toUpperCase() });
            if (!d) return res.status(400).json({ message: 'Mã giảm giá không hợp lệ' });
            if (d.uses >= d.maxUses) return res.status(400).json({ message: 'Mã giảm giá đã hết lượt' });
            discount = { code: d.discountCode, percent: d.percent };
            discountAmount = +(subTotal * (d.percent / 100)).toFixed(2);
        }

        const totalPrice = +(subTotal - discountAmount + tax + shippingPrice).toFixed(2);

        const order = new Order({
            orderId: await generateUuid(),
            accountId: accountId || null,
            guestInfo: accountId ? null : guestInfo || null,
            items,
            shippingAddress,
            paymentMethod,
            shippingPrice,
            subTotal,
            discount: discount ? { code: discount.code, percent: discount.percent, amount: discountAmount } : null,
            tax,
            totalPrice,
            isPaid: false
        });
        //... sau khi lưu đơn hàng
        await order.save();

        // Nếu sử dụng giảm giá, hãy tăng mức sử dụng
        if (discount) {
            await discountCtrl.incrementUsage(discount.code, order._id); // Truyền thêm order._id
        }

        // Tùy chọn xóa giỏ hàng
        if (accountId) {
            await Cart.deleteMany({ accountId });
        } else if (cartId) {
            await Cart.deleteMany({ cartId });
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
