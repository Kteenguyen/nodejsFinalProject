const Product = require('../models/productModel');
const Comment = require('../models/commentModel');
const mongoose = require('mongoose');

// Hiển thị danh sách sản phẩm với phân trang, lọc và sắp xếp
exports.getProducts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            categoryId, 
            brand, 
            minPrice, 
            maxPrice, 
            sortBy, 
            sortOrder, 
            keyword 
        } = req.query;
        
        const query = { status: 'available' }; // Chỉ lấy sản phẩm available

        // Thêm các điều kiện lọc
        if (categoryId) {
            query['category.categoryId'] = categoryId;
        }
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Thêm điều kiện tìm kiếm theo từ khóa
        if (keyword) {
            query.$or = [
                { productName: { $regex: keyword, $options: 'i' } },
                { productDescription: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Tạo đối tượng sắp xếp
        const sort = {};
        if (sortBy) {
            switch (sortBy) {
                case 'name':
                    sort.productName = sortOrder === 'desc' ? -1 : 1;
                    break;
                case 'price':
                    sort.price = sortOrder === 'desc' ? -1 : 1;
                    break;
                case 'newest':
                    sort.createdAt = -1;
                    break;
                case 'oldest':
                    sort.createdAt = 1;
                    break;
                default:
                    sort.createdAt = -1;
            }
        } else {
            sort.createdAt = -1; // Mặc định sắp xếp mới nhất
        }

        // Lấy tổng số sản phẩm để tính số trang
        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts: totalProducts,
            hasNextPage: page < Math.ceil(totalProducts / limit),
            hasPrevPage: page > 1
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Hiển thị chi tiết một sản phẩm
exports.getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Tìm sản phẩm theo productId hoặc _id
        const product = await Product.findOne({
            $or: [
                { productId: productId },
                { _id: new mongoose.Types.ObjectId(productId) }
            ],
            status: 'available'
        });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }

        // Lấy các comment cho sản phẩm này
        const comments = await Comment.find({ 
            productId: product._id 
        }).populate('accountId', 'name email');

        res.status(200).json({
            success: true,
            product: {
                ...product.toObject(),
                comments: comments,
                averageRating: comments.length > 0 
                    ? comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length 
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Lấy sản phẩm mới (New Products)
exports.getNewProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({ status: 'available' })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
}
// Lấy sản phẩm theo danh mục (Category)
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 12, sortBy, sortOrder } = req.query;

        const query = { 
            'category.categoryId': categoryId,
            status: 'available' 
        };

        // Tạo đối tượng sắp xếp
        const sort = {};
        if (sortBy === 'price') {
            sort.price = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'name') {
            sort.productName = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1; // Mặc định mới nhất
        }

        const products = await Product.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts: totalProducts,
            category: products.length > 0 ? products[0].category : null
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
}
// Lấy sản phẩm bán chạy (Best Sellers)
exports.getBestSellers = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        // Giả sử có trường 'soldCount' trong model - nếu không có thì cần thêm
        const products = await Product.find({ status: 'available' })
            .sort({ soldCount: -1, createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
}

// Thêm đánh giá và xếp hạng sản phẩm (Yêu cầu đăng nhập)
exports.addReviewAndRating = async (req, res) => {
    try {
        const { productId } = req.params;
        const { accountId, content, rating } = req.body;

        // Kiểm tra rating hợp lệ
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false,
                message: 'Rating phải từ 1 đến 5 sao' 
            });
        }

        // 1. Kiểm tra xem sản phẩm có tồn tại không
        const product = await Product.findOne({ 
            $or: [
                { productId: productId },
                { _id: new mongoose.Types.ObjectId(productId) }
            ],
            status: 'available'
        });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }

        // 2. Kiểm tra xem user đã đánh giá sản phẩm này chưa
        const existingComment = await Comment.findOne({
            productId: product._id,
            accountId: accountId
        });

        if (existingComment) {
            return res.status(400).json({ 
                success: false,
                message: 'Bạn đã đánh giá sản phẩm này rồi' 
            });
        }

        // 3. Tạo một bình luận/đánh giá mới
        const newComment = new Comment({
            commentId: new mongoose.Types.ObjectId().toString(),
            accountId: accountId, 
            productId: product._id,
            content: content,
            rating: rating,
            createdAt: new Date()
        });

        // 4. Lưu bình luận vào database
        await newComment.save();

        res.status(201).json({ 
            success: true,
            message: 'Đánh giá đã được thêm thành công', 
            comment: newComment 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};
