const Product = require('../models/productModel');
const Comment = require('../models/commentModel');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// RUBIK #10, #14, #15, #16 — có hỗ trợ search "không dấu" (mặc định) & full-text (tùy chọn)
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 60);

    // Giữ tương thích ngược: ?sort=name_asc|name_desc|price_asc|price_desc|newest|oldest
    let { sort, sortBy = 'newest', sortOrder = 'asc' } = req.query || {};
    if (sort) {
      const map = {
        name_asc: ['name', 'asc'],
        name_desc: ['name', 'desc'],
        price_asc: ['price', 'asc'],
        price_desc: ['price', 'desc'],
        newest: ['newest', 'desc'],
        oldest: ['oldest', 'asc'],
      };
      if (map[sort]) [sortBy, sortOrder] = map[sort];
    }

    const {
      categoryId,
      brand,
      keyword = '',
      minPrice,
      maxPrice,
      // NEW: chế độ search — 'norm' (mặc định, không dấu) | 'text' (Mongo text index)
      searchMode = 'norm'
    } = req.query;

    const match = { status: 'available' };
    if (categoryId) match['category.categoryId'] = categoryId;

    // Multi-brand: brand=Asus,MSI
    if (brand) {
      const arr = String(brand).split(',').map(s => s.trim()).filter(Boolean);
      match.brand = arr.length > 1
        ? { $in: arr.map(b => new RegExp(`^${b}$`, 'i')) }
        : { $regex: brand, $options: 'i' };
    }

    // ====== SEARCH (#14) ======
    const hasKeyword = String(keyword).trim().length > 0;
    const useText = hasKeyword && (String(searchMode).toLowerCase() === 'text');

    if (hasKeyword) {
      if (useText) {
        // Yêu cầu đã tạo text index trong model: productName, productDescription, brand
        match.$text = { $search: String(keyword).trim() };
      } else {
        // Tìm KHÔNG DẤU / không phân biệt hoa thường (cần 3 field *Norm trong model)
        const kw = String(keyword).trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        match.$or = [
          { productNameNorm: { $regex: kw, $options: 'i' } },
          { productDescriptionNorm: { $regex: kw, $options: 'i' } },
          { brandNorm: { $regex: kw, $options: 'i' } },
        ];
      }
    }

    // Price filter dựa trên biến thể
    if (minPrice || maxPrice) {
      match['variants.price'] = {};
      if (minPrice) match['variants.price'].$gte = Number(minPrice);
      if (maxPrice) match['variants.price'].$lte = Number(maxPrice);
    }

    // Sắp xếp mặc định (khi KHÔNG ở chế độ text)
    const sortStage = (() => {
      if (sortBy === 'name') return { productName: (sortOrder === 'desc' ? -1 : 1) };
      if (sortBy === 'price') return { minPrice: (sortOrder === 'desc' ? -1 : 1) };
      if (sortBy === 'oldest') return { createdAt: 1 };
      return { createdAt: -1 }; // newest
    })();

    // ====== PIPELINE ======
    const pipeline = [
      { $match: match },
      ...(useText ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
      { $addFields: { minPrice: { $min: "$variants.price" } } },
      // Nếu searchMode=text: ưu tiên độ liên quan (score DESC), tie-breaker theo minPrice ASC
      { $sort: useText ? { score: { $meta: 'textScore' }, minPrice: 1 } : sortStage },
      {
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                productId: 1, productName: 1, brand: 1, category: 1,
                images: { $slice: ["$images", 1] },
                minPrice: 1, createdAt: 1, variants: 1, status: 1,
                ...(useText ? { score: 1 } : {})
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ];

    const [result] = await Product.aggregate(pipeline);
    const total = result?.total?.[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({
      success: true,
      products: result.items,
      totalProducts: total,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Hiển thị chi tiết một sản phẩm (RUBIK #11)
exports.getProductDetails = async (req, res) => {
  try {
    // Dùng document do middleware resolveProductMiddleware đã gán
    const product = req.product;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Lấy comments (không bắt buộc populate để tránh lệch kiểu accountId)
    const comments = await Comment.find({ productId: product._id }).lean();

    // Tính điểm trung bình
    const avg = comments.length
      ? comments.reduce((s, c) => s + (Number(c.rating) || 0), 0) / comments.length
      : 0;

    // Lấy minPrice từ variants (nếu có)
    const minPrice = Array.isArray(product.variants) && product.variants.length
      ? Math.min(...product.variants.map(v => Number(v.price) || Infinity))
      : 0;

    return res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        minPrice,
        comments,
        averageRating: Number(avg.toFixed(2))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

/**
 * Lấy thông tin chi tiết (giá, tồn kho) của nhiều variant
 * Được gọi bởi CartController.enrichCart
 * POST /api/products/batch
 * Body: { variantIds: ["v1_id", "v2_id", ...] }
 */
exports.batchProductLines = async (req, res) => {
  try {
    const { variantIds } = req.body;

    if (!Array.isArray(variantIds) || variantIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Yêu cầu variantIds là một mảng.' });
    }

    // 1. Tìm TẤT CẢ các sản phẩm chứa bất kỳ variantId nào được yêu cầu
    // Dùng $in để tìm trong mảng 'variants'
    const products = await Product.find({
      'variants.variantId': { $in: variantIds }
    });

    // 2. Lọc ra chỉ những variant cụ thể mà client cần
    const foundVariants = [];
    products.forEach(product => {
      product.variants.forEach(variant => {
        // Nếu variant này nằm trong danh sách client yêu cầu
        if (variantIds.includes(variant.variantId)) {

          // "Làm giàu" (enrich) thông tin variant với thông tin cha
          foundVariants.push({
            // Thông tin từ cha
            productId: product.productId, // String ID ("monitor04")
            _id: product._id, // Mongo ID
            productName: product.productName,
            image: product.images[0] || null,

            // Thông tin từ variant (quan trọng nhất)
            variantId: variant.variantId,
            name: variant.name,
            price: variant.price,
            stock: variant.stock
          });
        }
      });
    });

    // 3. Trả về mảng các variant đã được "làm giàu"
    // (response.data sẽ là một mảng, khớp với CartController.jsx đã sửa ở bước trước)
    res.status(200).json(foundVariants);

  } catch (error) {
    console.error("Lỗi batchProductLines:", error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin sản phẩm' });
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