const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
// uuid is ESM-only; use dynamic import helper to generate UUIDs in CommonJS
async function generateUuid() {
    const { v4: uuidv4 } = await import('uuid');
    return uuidv4();
}

// Thêm sản phẩm vào giỏ hàng (tạo hoặc cập nhật số lượng). Nếu có tài khoản, lưu trữ accountId; chỉ sử dụng cartId cho khách.
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, cartId } = req.body;
        const accountId = req.user && req.user.id ? req.user.id : null;

        if (!productId) return res.status(400).json({ message: 'productId required' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Xác định CartId giỏ hàng
    const finalCartId = cartId || (accountId ? `account_${accountId}` : await generateUuid());

        // Thử tìm sản phẩm chưa có trong giỏ hàng
        let cartItem = await Cart.findOne({ cartId: finalCartId, productId });
        if (cartItem) {
            cartItem.quantity = Math.max(0, cartItem.quantity + parseInt(quantity));
            if (cartItem.quantity === 0) {
                await cartItem.remove();
                return res.status(200).json({ message: 'Item removed', cartId: finalCartId });
            }
            await cartItem.save();
        } else {
            cartItem = new Cart({
                cartId: finalCartId,
                productId,
                accountId: accountId || null,
                quantity: parseInt(quantity)
            });
            await cartItem.save();
        }

        return res.status(200).json({ success: true, cartId: finalCartId, item: cartItem });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
/// Cập nhập sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;
        if (!cartId || !productId) return res.status(400).json({ message: 'cartId and productId required' });

        const cartItem = await Cart.findOne({ cartId, productId });
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

        if (parseInt(quantity) <= 0) {
            await cartItem.remove();
            return res.status(200).json({ message: 'Item removed' });
        }

        cartItem.quantity = parseInt(quantity);
        await cartItem.save();
        return res.status(200).json({ success: true, item: cartItem });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// Lấy/hiển thị giỏ hàng (hỗ trợ user đã đăng nhập theo accountId hoặc guest theo cartId)
exports.getCart = async (req, res) => {
    try {
        const { cartId } = req.query;
        const accountId = req.user && req.user.id ? req.user.id : null;

        let items;
        if (accountId) {
            items = await Cart.find({ accountId }).populate('productId');
        } else if (cartId) {
            items = await Cart.find({ cartId }).populate('productId');
        } else {
            return res.status(400).json({ message: 'cartId required for guest' });
        }

        // Bản đồ đến UI thân thiện với giao diện người dùng
        const mapped = items.map(i => ({
            productId: i.productId._id,
            name: i.productId.productName,
            price: i.productId.price,
            image: i.productId.image,
            quantity: i.quantity
        }));

        return res.status(200).json({ success: true, items: mapped });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// Xóa toàn bộ mục giỏ hàng (hỗ trợ accountId cho user đã đăng nhập hoặc cartId cho guest)
exports.clearCart = async (req, res) => {
    try {
        const { cartId } = req.body;
        const accountId = req.user && req.user.id ? req.user.id : null;

        if (accountId) {
            await Cart.deleteMany({ accountId });
        } else if (cartId) {
            await Cart.deleteMany({ cartId });
        } else {
            return res.status(400).json({ message: 'cartId required for guest' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
