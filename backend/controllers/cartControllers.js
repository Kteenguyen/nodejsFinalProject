const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

/**
 * Thêm sản phẩm vào giỏ hàng (yêu cầu đăng nhập)
 */
exports.addToCart = async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const product = req.product; // resolved from middleware
        const accountId = req.user.id; // from auth middleware

        if (!product) {
            return res.status(400).json({ 
                success: false,
                message: 'Product not found or invalid' 
            });
        }

        // Kiểm tra sản phẩm có available không
        if (product.status !== 'available' || product.soldOut) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Tìm sản phẩm trong giỏ hàng
        let cartItem = await Cart.findOne({ 
            accountId: accountId,
            productId: product._id
        });

        const newQuantity = cartItem 
            ? cartItem.quantity + parseInt(quantity)
            : parseInt(quantity);

        // Kiểm tra số lượng tối đa
        if (newQuantity > 20) {
            return res.status(400).json({
                success: false,
                message: 'Maximum quantity per item is 20',
                currentQuantity: cartItem ? cartItem.quantity : 0
            });
        }

        if (cartItem) {
            // Cập nhật số lượng
            if (newQuantity <= 0) {
                await Cart.deleteOne({ _id: cartItem._id });
                return res.status(200).json({
                    success: true,
                    message: 'Item removed from cart'
                });
            }
            cartItem.quantity = newQuantity;
            await cartItem.save();
        } else {
            // Thêm mới vào giỏ
            cartItem = await Cart.create({
                productId: product._id,
                accountId: accountId,
                quantity: newQuantity
            });
        }

        // Populate sản phẩm để trả về thông tin đầy đủ
        await cartItem.populate('productId');

        return res.status(200).json({ 
            success: true, 
            item: {
                id: cartItem._id,
                productId: cartItem.productId._id,
                name: cartItem.productId.productName,
                price: cartItem.productId.price,
                image: cartItem.productId.image,
                quantity: cartItem.quantity,
                itemTotal: cartItem.productId.price * cartItem.quantity
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ (yêu cầu đăng nhập)
 */
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const product = req.product;
        const accountId = req.user.id;

        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Product not found or invalid'
            });
        }

        const cartItem = await Cart.findOne({ 
            accountId: accountId,
            productId: product._id
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Xóa sản phẩm nếu số lượng <= 0
        if (parseInt(quantity) <= 0) {
            await Cart.deleteOne({ _id: cartItem._id });
            return res.status(200).json({
                success: true,
                message: 'Item removed from cart'
            });
        }

        // Kiểm tra số lượng tối đa
        if (parseInt(quantity) > 20) {
            return res.status(400).json({
                success: false,
                message: 'Maximum quantity per item is 20'
            });
        }

        // Cập nhật số lượng
        cartItem.quantity = parseInt(quantity);
        await cartItem.save();

        // Populate sản phẩm để trả về thông tin đầy đủ
        await cartItem.populate('productId');

        return res.status(200).json({
            success: true,
            item: {
                id: cartItem._id,
                productId: cartItem.productId._id,
                name: cartItem.productId.productName,
                price: cartItem.productId.price,
                image: cartItem.productId.image,
                quantity: cartItem.quantity,
                itemTotal: cartItem.productId.price * cartItem.quantity
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Lấy giỏ hàng của user (yêu cầu đăng nhập)
 */
exports.getCart = async (req, res) => {
    try {
        const accountId = req.user.id;

        const items = await Cart.find({ accountId })
            .populate('productId');

        let totalAmount = 0;
        let totalItems = 0;

        const mappedItems = items.map(item => {
            const itemTotal = item.productId.price * item.quantity;
            totalAmount += itemTotal;
            totalItems += item.quantity;

            return {
                id: item._id,
                productId: item.productId._id,
                name: item.productId.productName,
                price: item.productId.price,
                image: item.productId.image,
                quantity: item.quantity,
                itemTotal
            };
        });

        return res.status(200).json({
            success: true,
            items: mappedItems,
            summary: {
                totalItems,
                totalAmount,
                formattedTotal: new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(totalAmount)
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Xóa toàn bộ giỏ hàng của user (yêu cầu đăng nhập)
 */
exports.clearCart = async (req, res) => {
    try {
        const accountId = req.user.id;

        await Cart.deleteMany({ accountId });

        return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// HÀM MỚI DÀNH CHO KHÁCH (GUEST)
// =============================================================

/**
 * [GUEST] Thêm sản phẩm vào giỏ hàng của khách
 */
exports.addGuestCartItem = async (req, res) => {
    try {
        let { cartId, productId, quantity = 1 } = req.body;

        if (!productId) return res.status(400).json({ message: 'productId is required' });

        // Nếu chưa có cartId, tạo một cái mới
        if (!cartId) {
            cartId = `guest_${uuidv4()}`;
        }

        let cartItem = await Cart.findOne({ cartId, productId });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
        } else {
            cartItem = new Cart({ cartId, productId, quantity: parseInt(quantity) });
        }

        await cartItem.save();

        return res.status(200).json({ success: true, cartId, item: cartItem });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * [GUEST] Lấy giỏ hàng của khách
 */
exports.getGuestCart = async (req, res) => {
    try {
        const { cartId } = req.query;
        if (!cartId) return res.status(200).json({ success: true, items: [], summary: {} });

        const items = await Cart.find({ cartId }).populate('productId');
        // ... (logic tính toán summary tương tự như getCart) ...

        return res.status(200).json({ success: true, items });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * [GUEST] Cập nhật giỏ hàng của khách
 */
exports.updateGuestCartItem = async (req, res) => {
    try {
        let { cartId, productId, quantity = 1 } = req.body;

        if (!productId) return res.status(400).json({ message: 'productId is required' });

        // Nếu chưa có cartId, tạo một cái mới
        if (!cartId) {
            cartId = `guest_${uuidv4()}`;
        }

        let cartItem = await Cart.findOne({ cartId, productId });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
        } else {
            cartItem = new Cart({ cartId, productId, quantity: parseInt(quantity) });
        }

        await cartItem.save();

        return res.status(200).json({ success: true, cartId, item: cartItem });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * [GUEST] Xóa giỏ hàng của khách
 */
exports.clearGuestCart = async (req, res) => {
    try {
        const { cartId } = req.body;
        if (!cartId) return res.status(400).json({ message: 'cartId is required' });
        await Cart.deleteMany({ cartId });
        return res.status(200).json({ success: true, message: 'Guest cart cleared' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
