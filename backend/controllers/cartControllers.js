// controllers/cartControllers.js

const { v4: uuidv4 } = require('uuid');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// =============================================================
// HÀM DÀNH CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
// =============================================================

/**
 * Thêm sản phẩm vào giỏ hàng (yêu cầu đăng nhập)
 */
exports.addToCart = async (req, res) => {
    try {
        const { quantity = 1, variantId } = req.body;
        const product = req.product; // Lấy từ middleware resolveProduct
        const accountId = req.user.id;

        if (!variantId) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn một phiên bản sản phẩm (variantId).' });
        }

        const variant = product.variants.find(v => v.variantId === variantId);
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Phiên bản sản phẩm không tồn tại.' });
        }
        if (variant.stock < quantity) {
            return res.status(400).json({ success: false, message: `Không đủ số lượng tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
        }
        
        let cartItem = await Cart.findOne({ accountId, productId: product._id, variantId });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
        } else {
            cartItem = new Cart({
                productId: product._id,
                variantId,
                accountId,
                quantity: parseInt(quantity)
            });
        }
        
        await cartItem.save();
        
        return res.status(200).json({ success: true, message: 'Thêm vào giỏ hàng thành công!', item: cartItem });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ (yêu cầu đăng nhập)
 */
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity, variantId } = req.body;
        const product = req.product;
        const accountId = req.user.id;

        if (!variantId || typeof quantity === 'undefined') {
            return res.status(400).json({ success: false, message: 'variantId và quantity là bắt buộc.' });
        }

        const cartItem = await Cart.findOne({ accountId, productId: product._id, variantId });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Sản phẩm này không có trong giỏ hàng của bạn.' });
        }

        const newQuantity = parseInt(quantity);
        if (newQuantity <= 0) {
            await Cart.deleteOne({ _id: cartItem._id });
            return res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' });
        }

        const variant = product.variants.find(v => v.variantId === variantId);
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Phiên bản sản phẩm không tồn tại.' });
        }
        if (variant.stock < newQuantity) {
            return res.status(400).json({ success: false, message: `Không đủ số lượng tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        return res.status(200).json({ success: true, message: 'Cập nhật giỏ hàng thành công!', item: cartItem });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy giỏ hàng của user (yêu cầu đăng nhập)
 */
exports.getCart = async (req, res) => {
    try {
        const accountId = req.user.id;
        const cartItems = await Cart.find({ accountId }).populate('productId');

        let totalAmount = 0;
        let totalItems = 0;

        const mappedItems = cartItems.map(item => {
            const product = item.productId;
            if (!product) return null;

            const variant = product.variants.find(v => v.variantId === item.variantId);
            if (!variant) return null;

            const itemTotal = variant.price * item.quantity;
            totalAmount += itemTotal;
            totalItems += item.quantity;

            return {
                cartItemId: item._id,
                productId: product._id,
                productCustomId: product.productId,
                productName: product.productName,
                variantId: variant.variantId,
                variantName: variant.name,
                price: variant.price,
                image: product.images ? product.images[0] : null,
                quantity: item.quantity,
                stock: variant.stock,
                itemTotal
            };
        }).filter(item => item !== null);

        return res.status(200).json({
            success: true,
            items: mappedItems,
            summary: {
                totalItems,
                totalAmount,
                formattedTotal: totalAmount.toLocaleString('vi-VN') + ' ₫'
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Xóa toàn bộ giỏ hàng của user (yêu cầu đăng nhập)
 */
exports.clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ accountId: req.user.id });
        return res.status(200).json({ success: true, message: 'Giỏ hàng đã được xóa thành công.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =============================================================
// HÀM DÀNH CHO KHÁCH (GUEST)
// =============================================================

/**
 * [GUEST] Thêm sản phẩm vào giỏ hàng của khách
 */
exports.addGuestCartItem = async (req, res) => {
    try {
        let { cartId, productId: customProductId, variantId, quantity = 1 } = req.body;

        if (!customProductId || !variantId) {
            return res.status(400).json({ success: false, message: 'productId và variantId là bắt buộc.' });
        }

        const product = await Product.findOne({ productId: customProductId });
        if (!product) {
            return res.status(404).json({ success: false, message: `Sản phẩm với mã '${customProductId}' không tồn tại.` });
        }
        
        const variant = product.variants.find(v => v.variantId === variantId);
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Phiên bản sản phẩm không tồn tại.' });
        }
        if (variant.stock < quantity) {
            return res.status(400).json({ success: false, message: `Không đủ số lượng tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
        }

        if (!cartId) {
            cartId = `guest_${uuidv4()}`;
        }

        let cartItem = await Cart.findOne({ cartId, productId: product._id, variantId });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
        } else {
            cartItem = new Cart({
                cartId,
                productId: product._id,
                variantId,
                quantity: parseInt(quantity)
            });
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
        if (!cartId) {
            return res.status(200).json({ success: true, items: [], summary: {} });
        }

        const cartItems = await Cart.find({ cartId }).populate('productId');

        let totalAmount = 0;
        let totalItems = 0;

        const mappedItems = cartItems.map(item => {
            const product = item.productId;
            if (!product) return null;

            const variant = product.variants.find(v => v.variantId === item.variantId);
            if (!variant) return null;

            const itemTotal = variant.price * item.quantity;
            totalAmount += itemTotal;
            totalItems += item.quantity;

            return {
                cartItemId: item._id,
                productId: product._id,
                productCustomId: product.productId,
                productName: product.productName,
                variantId: variant.variantId,
                variantName: variant.name,
                price: variant.price,
                image: product.images ? product.images[0] : null,
                quantity: item.quantity,
                stock: variant.stock,
                itemTotal
            };
        }).filter(item => item !== null);

        return res.status(200).json({
            success: true,
            items: mappedItems,
            summary: {
                totalItems,
                totalAmount,
                formattedTotal: totalAmount.toLocaleString('vi-VN') + ' ₫'
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * [GUEST] Cập nhật giỏ hàng của khách
 */
exports.updateGuestCartItem = async (req, res) => {
    try {
        const { cartId, productId: customProductId, variantId, quantity } = req.body;

        if (!cartId || !customProductId || !variantId || typeof quantity === 'undefined') {
            return res.status(400).json({ success: false, message: 'cartId, productId, variantId, và quantity là bắt buộc.' });
        }

        const product = await Product.findOne({ productId: customProductId });
        if (!product) {
            return res.status(404).json({ success: false, message: `Sản phẩm với mã '${customProductId}' không tồn tại.` });
        }

        const cartItem = await Cart.findOne({ cartId, productId: product._id, variantId });
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Sản phẩm này không có trong giỏ hàng.' });
        }

        const newQuantity = parseInt(quantity);
        if (newQuantity <= 0) {
            await Cart.deleteOne({ _id: cartItem._id });
            return res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' });
        }
        
        const variant = product.variants.find(v => v.variantId === variantId);
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Phiên bản sản phẩm không tồn tại.' });
        }
        if (variant.stock < newQuantity) {
            return res.status(400).json({ success: false, message: `Không đủ số lượng tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        return res.status(200).json({ success: true, item: cartItem });
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
        if (!cartId) return res.status(400).json({ message: 'cartId là bắt buộc.' });
        await Cart.deleteMany({ cartId });
        return res.status(200).json({ success: true, message: 'Giỏ hàng của khách đã được xóa.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};