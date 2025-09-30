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
            // success: true,
            // products,
            // currentPage: parseInt(page),
            // totalPages: Math.ceil(totalProducts / limit),
            // totalProducts: totalProducts,
            // hasNextPage: page < Math.ceil(totalProducts / limit),
            // hasPrevPage: page > 1
            data: products,
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

        let product;
        if (mongoose.Types.ObjectId.isValid(productId)) {
            product = await Product.findById(productId);
        } else {
            product = await Product.findOne({ productId });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        // lấy comments + rating
        const comments = await Comment.find({ productId: product._id })
            .populate('accountId', 'name email');

        return res.status(200).json({
            success: true,
            product: {
                ...product.toObject(),
                comments: comments,
                averageRating: comments.length > 0
                    ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
                    : 0
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: err.message
        });
    }
};


// Lấy sản phẩm mới
exports.getNewProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await Product.find({ isNewProduct: true })
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error("getNewProducts error:", error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Lấy sản phẩm bán chạy
exports.getBestSellers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await Product.find({ isBestSeller: true })
            .limit(limit);

        return res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error("getBestSellers error:", error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
// Lấy sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.find({ 'category.categoryId': categoryId }).limit(8);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};