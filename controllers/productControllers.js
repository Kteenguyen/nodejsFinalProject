const Product = require('../models/productModel');

// Hiển thị danh sách sản phẩm với phân trang, lọc và sắp xếp
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, minPrice, maxPrice, sortBy, sortOrder, keyword } = req.query;
        const query = {};

        // Thêm các điều kiện lọc
        if (category) {
            query.category = category;
        }
        if (brand) {
            query.brand = brand;
        }
        if (minPrice || maxPrice) {
            query['variants.price'] = {};
            if (minPrice) {
                query['variants.price'].$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query['variants.price'].$lte = parseFloat(maxPrice);
            }
        }
        
        // Thêm điều kiện tìm kiếm theo từ khóa
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Tạo đối tượng sắp xếp
        const sort = {};
        if (sortBy && sortOrder) {
            // Sắp xếp theo tên (A-Z, Z-A)
            if (sortBy === 'name') {
                sort.name = sortOrder === 'asc' ? 1 : -1;
            }
            // Sắp xếp theo giá (tăng/giảm dần)
            if (sortBy === 'price') {
                sort['variants.price'] = sortOrder === 'asc' ? 1 : -1;
            }
        }

        // Lấy tổng số sản phẩm để tính số trang
        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// Hiển thị chi tiết một sản phẩm
exports.getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// Thêm đánh giá và xếp hạng sản phẩm
exports.addReviewAndRating = async (req, res) => {
    try {
        const { productId } = req.params;
        const { comment, rating } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const newReview = {
            user: req.user._id, // Giả sử người dùng đã đăng nhập
            comment,
            rating
        };

        product.reviews.push(newReview);
        await product.save();
        
        // Bạn có thể sử dụng WebSockets ở đây để cập nhật realtime
        // io.emit('new_review', { productId, newReview });
        
        res.status(201).json({ message: 'Đánh giá đã được thêm thành công', newReview });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};
