const Product = require('../models/productModel');
const Comment = require('../models/commentModel');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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
            hasPrevPage: page > 1,
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

// =============================================================
// CẬP NHẬT: TÁCH BIỆT BÌNH LUẬN VÀ ĐÁNH GIÁ
// =============================================================

/**
 * [GUEST] Thêm bình luận (không cần đăng nhập)
 */
exports.addGuestComment = async (req, res) => {
    try {
        const { comment, guestName } = req.body;
        const product = req.product; // Từ middleware resolveProduct

        if (!comment || !guestName) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên và nội dung bình luận.' });
        }

        const newComment = new Comment({
            productId: product._id,
            comment: comment,
            guestName: guestName, // Lưu tên của khách
            // Không có accountId và rating ở đây
        });

        await newComment.save();
        
        // Gửi sự kiện WebSocket
        const io = req.app.get('socketio');
        if (io) {
            io.to(product._id.toString()).emit('new_comment', newComment);
        }

        return res.status(201).json({
            success: true,
            message: 'Bình luận của bạn đã được gửi!',
            comment: newComment
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [USER] Thêm đánh giá sao (yêu cầu đăng nhập)
 */
exports.addUserRating = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = req.product; // Từ middleware resolveProduct
        const user = req.user;       // Từ middleware auth

        if (!rating) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số sao đánh giá.' });
        }
        
        // Cho phép người dùng cập nhật đánh giá nếu đã tồn tại
        let userRating = await Comment.findOne({ productId: product._id, accountId: user.id });

        if (userRating) {
            // Cập nhật
            userRating.rating = Number(rating);
            if (comment) userRating.comment = comment; // Cập nhật cả comment nếu có
        } else {
            // Tạo mới
             userRating = new Comment({
                productId: product._id,
                accountId: user.id,
                rating: Number(rating),
                comment: comment // Có thể có hoặc không
            });
        }
        
        await userRating.save();
        
        // Gửi sự kiện WebSocket
        const io = req.app.get('socketio');
        if (io) {
            io.to(product._id.toString()).emit('new_rating', userRating);
        }

        return res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn đã đánh giá sản phẩm!',
            rating: userRating
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [ADMIN] Thêm một sản phẩm mới
 */
exports.createProduct = async (req, res) => {
    try {
        // 1. Lấy mảng 'variants' và các thông tin khác từ body
        const {
            productId,
            productName,
            brand,
            productDescription,
            category,
            images,
            variants // Mảng các biến thể
        } = req.body;

        // 2. Validation cơ bản và validation cho mảng variants
        if (!productId || !productName || !category || !variants) {
            return res.status(400).json({ success: false, message: 'Các trường productId, productName, category, và variants là bắt buộc.' });
        }
        if (!Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({ success: false, message: 'Sản phẩm phải có ít nhất một biến thể.' });
        }

        const existingProduct = await Product.findOne({ productId });
        if (existingProduct) {
            return res.status(400).json({ success: false, message: 'Mã sản phẩm (productId) đã tồn tại.' });
        }

        // 3. Xử lý và validate từng biến thể trong mảng
        const processedVariants = variants.map(v => {
            if (!v.name || typeof v.price === 'undefined' || typeof v.stock === 'undefined') {
                throw new Error('Mỗi biến thể phải có name, price, và stock.');
            }
            return {
                ...v,
                variantId: v.variantId || uuidv4() // Tự động tạo variantId nếu chưa có
            };
        });

        const newProduct = new Product({
            productId,
            productName,
            brand,
            productDescription,
            category,
            images,
            variants: processedVariants // 4. Lưu mảng variants đã xử lý
        });

        const savedProduct = await newProduct.save();
        return res.status(201).json({ success: true, product: savedProduct });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [ADMIN] Cập nhật thông tin một sản phẩm
 */
exports.updateProduct = async (req, res) => {
    try {
        const product = req.product; // Lấy sản phẩm từ middleware resolveProduct

        // 1. Lấy tất cả các trường có thể cập nhật, bao gồm cả mảng 'variants'
        const {
            productName,
            brand,
            productDescription,
            category,
            images,
            status,
            isNewProduct,
            isBestSeller,
            variants
        } = req.body;

        // 2. Cập nhật các trường thông tin chung
        if (productName) product.productName = productName;
        if (brand) product.brand = brand;
        if (productDescription) product.productDescription = productDescription;
        if (category) product.category = category;
        if (images) product.images = images;
        if (status) product.status = status;
        if (typeof isNewProduct !== 'undefined') product.isNewProduct = isNewProduct;
        if (typeof isBestSeller !== 'undefined') product.isBestSeller = isBestSeller;

        // 3. Cập nhật toàn bộ mảng variants nếu được cung cấp
        if (Array.isArray(variants)) {
            if (variants.length === 0) {
                return res.status(400).json({ success: false, message: 'Sản phẩm phải có ít nhất một biến thể.' });
            }
            // Xử lý và validate từng biến thể trong mảng mới
            const processedVariants = variants.map(v => {
                if (!v.name || typeof v.price === 'undefined' || typeof v.stock === 'undefined') {
                    throw new Error('Mỗi biến thể phải có name, price, và stock.');
                }
                return {
                    ...v,
                    variantId: v.variantId || uuidv4()
                };
            });
            product.variants = processedVariants; // Ghi đè toàn bộ mảng variants cũ
        }

        const updatedProduct = await product.save();
        return res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

/**
 * [ADMIN] Xóa một sản phẩm
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = req.product; // Lấy sản phẩm từ middleware resolveProduct

        await Product.deleteOne({ _id: product._id });

        return res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa thành công.' });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};