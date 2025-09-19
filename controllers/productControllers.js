const Product = require('../models/productModel');

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
    // LƯU Ý: Chức năng này không thể hoạt động với productModel hiện tại
    // vì trong model không có trường `reviews`.
    // Bạn cần thêm trường `reviews: [reviewSchema]` vào productModel để sử dụng.
    
    return res.status(400).json({ 
        message: 'Chức năng này chưa được hỗ trợ. Vui lòng cập nhật productModel để có trường "reviews".' 
    });
};
