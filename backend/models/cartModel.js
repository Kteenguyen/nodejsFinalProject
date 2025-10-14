// FileName: cartModel.js

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    // cartId dùng cho khách vãng lai (guest).
    // Nó không bắt buộc vì người dùng đăng nhập sẽ dùng accountId.
    cartId: { 
        type: String, 
        required: false // SỬA LẠI: Không bắt buộc
    }, 
    
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },

    // accountId dùng cho người dùng đã đăng nhập.
    // Nó không bắt buộc vì khách vãng lai sẽ dùng cartId.
    accountId: { 
        type: String, // SỬA LẠI: Đổi từ ObjectId sang String để khớp với user.userId
        ref: 'User', 
        required: false // SỬA LẠI: Không bắt buộc
    },
    
    quantity: { 
        type: Number, 
        required: true,
        min: 1
    }
}, {
    timestamps: true // Thêm timestamps để tiện theo dõi
});

// Thêm một chỉ mục (index) để đảm bảo không có sản phẩm trùng lặp trong giỏ hàng của cùng một người
cartSchema.index({ accountId: 1, productId: 1 }, { unique: true, sparse: true });
cartSchema.index({ cartId: 1, productId: 1 }, { unique: true, sparse: true });


module.exports = mongoose.model('Cart', cartSchema);