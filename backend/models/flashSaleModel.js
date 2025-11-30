// backend/models/flashSaleModel.js
const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    
    // Thời gian flash sale
    timeSlot: {
        type: String,
        enum: ['00:00-02:00', '09:00-12:00', '12:00-14:00', '18:00-21:00', '21:00-23:00'],
        required: true
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    
    // Trạng thái
    status: {
        type: String,
        enum: ['upcoming', 'active', 'ended'],
        default: 'upcoming'
    },
    
    // Danh sách sản phẩm flash sale
    products: [{
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        variantId: { 
            type: String 
        },
        
        // Giá gốc và giá flash sale
        originalPrice: { 
            type: Number, 
            required: true 
        },
        flashPrice: { 
            type: Number, 
            required: true 
        },
        discountPercent: { 
            type: Number, 
            default: 0 
        },
        
        // Số lượng giới hạn
        totalStock: { 
            type: Number, 
            required: true,
            min: 1
        },
        soldCount: { 
            type: Number, 
            default: 0 
        },
        
        // Giới hạn mua
        maxPerOrder: { 
            type: Number, 
            default: 5 
        },
        
        // Metadata
        badge: { 
            type: String 
        } // VD: "SALE SỐC", "HOT"
    }],
    
    // Banner/Image cho flash sale
    bannerImage: { 
        type: String 
    },
    
    // Thống kê
    totalViews: { 
        type: Number, 
        default: 0 
    },
    totalOrders: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

// Index để query nhanh
flashSaleSchema.index({ status: 1, startTime: 1, endTime: 1 });
flashSaleSchema.index({ 'products.productId': 1 });

// Virtual để tính % đã bán
flashSaleSchema.virtual('products.soldPercent').get(function() {
    return this.products.map(p => ({
        ...p,
        soldPercent: Math.round((p.soldCount / p.totalStock) * 100)
    }));
});

// Method: Cập nhật trạng thái tự động
flashSaleSchema.methods.updateStatus = function() {
    const now = new Date();
    if (now < this.startTime) {
        this.status = 'upcoming';
    } else if (now >= this.startTime && now <= this.endTime) {
        this.status = 'active';
    } else {
        this.status = 'ended';
    }
};

// Static: Lấy flash sale đang active
flashSaleSchema.statics.getActive = function() {
    const now = new Date();
    return this.find({
        status: 'active',
        startTime: { $lte: now },
        endTime: { $gte: now }
    }).populate('products.productId');
};

// Static: Lấy flash sale sắp diễn ra
flashSaleSchema.statics.getUpcoming = function() {
    const now = new Date();
    return this.find({
        status: 'upcoming',
        startTime: { $gt: now }
    }).sort({ startTime: 1 }).limit(3);
};

module.exports = mongoose.model('FlashSale', flashSaleSchema);
