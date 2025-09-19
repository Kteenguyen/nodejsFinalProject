const Product = require('../models/productModel');
const Comment = require('../models/commentModel');

// Hiển thị danh sách sản phẩm với phân trang, lọc và sắp xếp
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, minPrice, maxPrice, sortBy, sortOrder, keyword } = req.query;
        const query = {};

        // Thêm các điều kiện lọc
        if (category) {
            // Lọc theo categoryId bên trong object category
            query['category.categoryId'] = category;
        }
        if (brand) {
            query.brand = brand;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = parseFloat(maxPrice);
            }
        }
        
        // Thêm điều kiện tìm kiếm theo từ khóa
        if (keyword) {
            query.$or = [
                { productName: { $regex: keyword, $options: 'i' } },
                { productDescription: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Tạo đối tượng sắp xếp
        const sort = {};
        if (sortBy && sortOrder) {
            // Sắp xếp theo tên (A-Z, Z-A)
            if (sortBy === 'name') {
                sort.productName = sortOrder === 'asc' ? 1 : -1;
            }
            // Sắp xếp theo giá (tăng/giảm dần)
            if (sortBy === 'price') {
                sort.price = sortOrder === 'asc' ? 1 : -1;
            }
        } else {
            // Mặc định sắp xếp theo ngày tạo mới nhất nếu không có tùy chọn
            sort.createdAt = -1;
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
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts: totalProducts
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Hiển thị chi tiết một sản phẩm
exports.getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        // Dùng findOne với trường `productId` thay vì findById (dùng cho _id)
        const product = await Product.findOne({ productId: productId });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Thêm đánh giá và xếp hạng sản phẩm
exports.addReviewAndRating = async (req, res) => {
    try {
        const { productId } = req.params; // Đây là productId tùy chỉnh của bạn
        const { accountId, content, rating } = req.body; // Lấy thông tin từ request body

        // 1. Kiểm tra xem sản phẩm có tồn tại không
        const product = await Product.findOne({ productId: productId });
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // (Tùy chọn) Kiểm tra xem tài khoản có tồn tại không
        // const user = await User.findById(accountId);
        // if (!user) {
        //     return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
        // }

        // 2. Tạo một bình luận/đánh giá mới
        const newComment = new Comment({
            commentId: new mongoose.Types.ObjectId().toHexString(), // Tạo một ID ngẫu nhiên cho comment
            accountId: accountId, 
            productId: product._id, // Quan trọng: Lưu _id của MongoDB, không phải productId tùy chỉnh
            content: content,
            rating: rating
        });

        // 3. Lưu bình luận vào database
        await newComment.save();

        res.status(201).json({ message: 'Đánh giá đã được thêm thành công', comment: newComment });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
};
