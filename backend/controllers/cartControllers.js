// backend/controllers/cartControllers.js
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// === HÀM MỚI: Lấy giỏ hàng của user đã đăng nhập ===
exports.getCart = async (req, res) => {
    try {
        const cartItems = await Cart.find({ accountId: req.user.id })
            .populate('productId', 'productName images variants productId'); // Thêm 'productId' (string)

        // "Làm giàu" giỏ hàng
        const enrichedItems = cartItems.map(item => {
            if (!item.productId) return null; // Sản phẩm đã bị xóa

            const product = item.productId;
            const variant = product.variants.find(v => v.variantId === item.variantId);

            if (!variant) return null; // Variant đã bị xóa

            return {
                _id: item._id, // cartItemId
                productId: product._id, // Mongo ID
                productStringId: product.productId, // String ID (VD: "monitor04")
                productName: product.productName,
                image: product.images[0] || null, 
                variantId: item.variantId,
                variantName: variant.name,
                price: variant.price,
                stock: variant.stock,
                quantity: item.quantity
            };
        }).filter(item => item !== null); 

        res.status(200).json({ success: true, cart: enrichedItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// === HÀM MỚI: Đồng bộ giỏ hàng (Fix lỗi 500) ===
exports.syncCart = async (req, res) => {
    try {
        const { localCart } = req.body; // Giỏ hàng từ localStorage
        const accountId = req.user.id;

        if (!Array.isArray(localCart) || localCart.length === 0) {
            return exports.getCart(req, res); // Không có gì sync, chỉ cần lấy giỏ hàng DB
        }

        const operations = localCart.map(item => ({
            updateOne: {
                filter: { 
                    accountId: accountId, 
                    productId: new mongoose.Types.ObjectId(item.productId), // 👈 FIX: Ép kiểu về ObjectId
                    variantId: item.variantId 
                },
                update: {
                    $inc: { quantity: item.quantity },
                    $setOnInsert: {
                        accountId: accountId,
                        productId: new mongoose.Types.ObjectId(item.productId), // 👈 FIX: Ép kiểu về ObjectId
                        variantId: item.variantId
                    }
                },
                upsert: true 
            }
        }));

        await Cart.bulkWrite(operations);

        // Sau khi gộp, gọi lại hàm getCart để trả về giỏ hàng mới nhất
        return exports.getCart(req, res);

    } catch (error) {
        // Bắt lỗi nếu 'item.productId' không phải ObjectId hợp lệ
        if (error.name === 'CastError' || error.message.includes('ObjectId')) {
            return res.status(400).json({ success: false, message: 'Lỗi đồng bộ: ProductID trong giỏ hàng local không hợp lệ.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};


// === HÀM CŨ CỦA FEN (ĐÃ SỬA ĐỂ TRẢ VỀ ITEM ĐƯỢC "ENRICH") ===
exports.addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity = 1 } = req.body;
        const accountId = req.user.id;

        if (!productId || !variantId) {
            return res.status(400).json({ success: false, message: 'Thiếu productId hoặc variantId.' });
        }

        // Tìm sản phẩm bằng Mongo _id
        const product = await Product.findById(productId); 
        if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });

        const variant = product.variants.find(v => v.variantId === variantId);
        if (!variant) return res.status(404).json({ success: false, message: 'Phiên bản không tồn tại.' });

        // Tìm item trong giỏ hàng
        let cartItem = await Cart.findOne({
            accountId: accountId,
            productId: product._id, 
            variantId: variantId
        });

        const newQuantity = (cartItem ? cartItem.quantity : 0) + parseInt(quantity);

        if (newQuantity > variant.stock) {
            return res.status(400).json({ success: false, message: `Vượt quá tồn kho (chỉ còn ${variant.stock})` });
        }

        if (cartItem) {
            cartItem.quantity = newQuantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                accountId: accountId,
                productId: product._id,
                variantId: variantId,
                quantity: newQuantity
            });
        }
        
        // Trả về item đã được cập nhật/tạo mới (đã "enrich")
        const enrichedItem = {
            _id: cartItem._id,
            productId: product._id,
            productStringId: product.productId, // String ID (VD: "monitor04")
            productName: product.productName,
            image: product.images[0] || null,
            variantId: variant.variantId,
            variantName: variant.name,
            price: variant.price,
            stock: variant.stock,
            quantity: cartItem.quantity
        };

        res.status(201).json({ success: true, item: enrichedItem });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ... (Các hàm updateCartItem, removeCartItem, clearCart của fen giữ nguyên...)
// ... (Nhưng tui sẽ sửa updateCartItem để nó dùng _id của cartModel)

exports.updateCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params; // 👈 Đây là _id của Cart item
        const { quantity } = req.body;
        const accountId = req.user.id;

        const newQuantity = parseInt(quantity);

        const cartItem = await Cart.findOne({ _id: cartItemId, accountId: accountId })
            .populate('productId', 'variants'); // Lấy product để check stock
        
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng.' });
        }

        // Nếu số lượng <= 0, xóa item
        if (newQuantity <= 0) {
            await Cart.deleteOne({ _id: cartItem._id });
            return res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa (số lượng = 0).', removed: true, variantId: cartItem.variantId });
        }
        
        const product = cartItem.productId;
        const variant = product.variants.find(v => v.variantId === cartItem.variantId);
        
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

exports.removeCartItem = async (req, res) => {
    try {
        const { cartItemId } = req.params; // 👈 Đây là _id của Cart item
        const accountId = req.user.id;

        const result = await Cart.deleteOne({ _id: cartItemId, accountId: accountId });

        if (result.deletedCount === 0) {
             return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng.' });
        }

        return res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ accountId: req.user.id });
        res.status(200).json({ success: true, message: 'Giỏ hàng đã được xóa sạch.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};