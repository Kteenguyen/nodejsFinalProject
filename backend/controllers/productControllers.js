// backend/controllers/productControllers.js
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/productModel');

// Trợ giúp: tìm theo productId (slug) hoặc _id Mongo
async function findBySlugOrId(slug) {
  let p = await Product.findOne({ productId: slug });
  if (!p && /^[0-9a-fA-F]{24}$/.test(slug)) p = await Product.findById(slug);
  return p;
}

/**
 * GET /api/products
 * - Tìm kiếm, lọc, phân trang, sắp xếp
 * - Trả alias name, lowestPrice để FE dùng nhất quán
 */
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 60);

    // backward-compat sort
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
      searchMode = 'norm',     // norm|text
      minRating,               // ⭐️ thêm rating tối thiểu (1..5)
      inStock,                 // optional: true => chỉ còn hàng
      isNew,                   // optional: true => isNewProduct
      bestSeller               // optional: true => isBestSeller
    } = req.query;

    const match = { status: 'available' };
    if (categoryId) match['category.categoryId'] = categoryId;
    if (isNew === 'true') match.isNewProduct = true;
    if (bestSeller === 'true') match.isBestSeller = true;

    // multi-brand: brand=Asus,MSI
    if (brand) {
      const arr = String(brand).split(',').map(s => s.trim()).filter(Boolean);
      match.brand = arr.length > 1
        ? { $in: arr.map(b => new RegExp(`^${b}$`, 'i')) }
        : { $regex: brand, $options: 'i' };
    }

    // ===== Search theo keyword =====
    const hasKeyword = String(keyword).trim().length > 0;
    const useText = hasKeyword && (String(searchMode).toLowerCase() === 'text');
    if (hasKeyword) {
      if (useText) {
        match.$text = { $search: String(keyword).trim() };
      } else {
        const kw = String(keyword).trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        match.$or = [
          { productNameNorm: { $regex: kw, $options: 'i' } },
          { productDescriptionNorm: { $regex: kw, $options: 'i' } },
          { brandNorm: { $regex: kw, $options: 'i' } },
        ];
      }
    }

    // Lọc theo giá (biến thể)
    if (minPrice || maxPrice) {
      match['variants.price'] = {};
      if (minPrice) match['variants.price'].$gte = Number(minPrice);
      if (maxPrice) match['variants.price'].$lte = Number(maxPrice);
    }

    // sort mặc định
    const sortStage = (() => {
      if (sortBy === 'name')   return { productName: (sortOrder === 'desc' ? -1 : 1) };
      if (sortBy === 'price')  return { minPrice: (sortOrder === 'desc' ? -1 : 1) };
      if (sortBy === 'oldest') return { createdAt: 1 };
      return { createdAt: -1 }; // newest
    })();

    // ===== Pipeline =====
    const pipeline = [
      { $match: match },
      ...(useText ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),

      // Tính minPrice (từ variants), avgStars (từ ratings), totalStock (để lọc còn hàng)
      {
        $addFields: {
          minPrice: { $min: '$variants.price' },
          avgStars: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$ratings', []] } }, 0] },
              { $avg: '$ratings.stars' },
              0
            ]
          },
          totalStock: { $sum: '$variants.stock' }
        }
      },

      // Lọc theo rating (nếu có)
      ...(Number(minRating) > 0 ? [{ $match: { avgStars: { $gte: Number(minRating) } } }] : []),

      // Lọc còn hàng (optional)
      ...(inStock === 'true' ? [{ $match: { totalStock: { $gt: 0 } } }] : []),

      // Sắp xếp
      { $sort: useText ? { score: { $meta: 'textScore' }, minPrice: 1 } : sortStage },

      {
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                productId: 1,
                productName: 1,
                name: '$productName',
                brand: 1,
                category: 1,
                images: { $slice: ['$images', 1] },
                minPrice: 1,
                lowestPrice: '$minPrice',
                averageRating: { $round: ['$avgStars', 2] },
                ratingsCount: { $size: { $ifNull: ['$ratings', []] } },
                isNewProduct: 1,
                isBestSeller: 1,
                createdAt: 1,
                totalStock: 1
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ];

    const agg = await Product.aggregate(pipeline);
    const items = (agg[0]?.items || []);
    const total = agg[0]?.meta?.[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({
      success: true,
      products: items,
      totalProducts: total,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

/** Chi tiết */
exports.getProductDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await findBySlugOrId(slug);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const minPrice = product.variants?.length
      ? Math.min(...product.variants.map(v => Number(v.price) || Infinity))
      : 0;

    return res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        lowestPrice: minPrice,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách brand (phục vụ FilterBar)
exports.getBrandsList = async (_req, res) => {
  try {
    const brands = await Product.distinct('brand', { brand: { $nin: [null, ''] } });
    // loại null/undefined, trim & unique mềm
    const list = [...new Set(brands.map(b => String(b).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi'));
    res.json({ success: true, brands: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

// Lấy danh sách category (id + name) từ field category
exports.getCategoriesList = async (_req, res) => {
  try {
    const rows = await Product.aggregate([
      { $match: { 'category.categoryId': { $exists: true, $ne: '' } } },
      { $group: { _id: '$category.categoryId', name: { $first: '$category.name' } } },
      { $project: { _id: 0, id: '$_id', name: { $ifNull: ['$name', ''] } } },
      { $sort: { name: 1 } }
    ]);
    res.json({ success: true, categories: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

/** batch enrich cho giỏ hàng */
exports.batchProductLines = async (req, res) => {
  try {
    const { variantIds } = req.body;
    if (!Array.isArray(variantIds) || variantIds.length === 0) {
      return res.status(400).json({ success: false, message: 'variantIds phải là mảng.' });
    }

    const products = await Product.find({ 'variants.variantId': { $in: variantIds } });
    const found = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (variantIds.includes(v.variantId)) {
          found.push({
            productId: p.productId,
            _id: p._id,
            productName: p.productName,
            image: p.images?.[0] || null,
            variantId: v.variantId,
            name: v.name,
            variantName: v.name,
            price: v.price,
            stock: v.stock,
          });
        }
      });
    });

    return res.status(200).json(found);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi server khi enrich biến thể' });
  }
};

/** Collections */
exports.getBestSellers = async (_req, res) => {
  try {
    const items = await Product.aggregate([
      { $match: { isBestSeller: true, status: 'available' } },
      { $addFields: { minPrice: { $min: '$variants.price' } } },
      { $project: { productId: 1, productName: 1, name: '$productName', brand: 1, images: { $slice: ['$images', 1] }, lowestPrice: '$minPrice' } },
      { $limit: 20 },
    ]);
    res.json({ success: true, products: items });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getNewProducts = async (_req, res) => {
  try {
    const items = await Product.aggregate([
      { $match: { isNewProduct: true, status: 'available' } },
      { $addFields: { minPrice: { $min: '$variants.price' } } },
      { $project: { productId: 1, productName: 1, name: '$productName', brand: 1, images: { $slice: ['$images', 1] }, lowestPrice: '$minPrice' } },
      { $limit: 20 },
    ]);
    res.json({ success: true, products: items });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await Product.aggregate([
      { $match: { 'category.categoryId': categoryId, status: 'available' } },
      { $addFields: { minPrice: { $min: '$variants.price' } } },
      { $project: { productId: 1, productName: 1, name: '$productName', brand: 1, images: { $slice: ['$images', 1] }, lowestPrice: '$minPrice' } },
    ]);
    res.json({ success: true, products: items });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/** ADMIN */
exports.createProduct = async (req, res) => {
  try {
    const {
      productId, productName, brand, productDescription, category, images = [],
      status = 'available', isNewProduct = false, isBestSeller = false, variants = [],
    } = req.body;

    if (!productId || !productName || !category?.categoryId || !variants?.length) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc/biến thể.' });
    }

    const processedVariants = variants.map(v => ({
      variantId: v.variantId || uuidv4(),
      name: v.name,
      price: v.price,
      stock: v.stock ?? 0,
    }));

    const created = await Product.create({
      productId, productName, brand, productDescription, category, images,
      status, isNewProduct, isBestSeller, variants: processedVariants,
    });

    res.status(201).json({ success: true, product: created });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await findBySlugOrId(slug);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const {
      productName, brand, productDescription, category,
      images, status, isNewProduct, isBestSeller, variants,
    } = req.body;

    if (productName) product.productName = productName;
    if (brand) product.brand = brand;
    if (productDescription) product.productDescription = productDescription;
    if (category) product.category = category;
    if (images) product.images = images;
    if (status) product.status = status;
    if (typeof isNewProduct !== 'undefined') product.isNewProduct = isNewProduct;
    if (typeof isBestSeller !== 'undefined') product.isBestSeller = isBestSeller;

    if (Array.isArray(variants)) {
      if (variants.length === 0) {
        return res.status(400).json({ success: false, message: 'Phải có ít nhất 1 biến thể.' });
      }
      product.variants = variants.map(v => ({
        variantId: v.variantId || uuidv4(),
        name: v.name,
        price: v.price,
        stock: v.stock ?? 0,
      }));
    }

    const updated = await product.save();
    return res.status(200).json({ success: true, product: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await findBySlugOrId(slug);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    await Product.deleteOne({ _id: product._id });
    return res.status(200).json({ success: true, message: 'Đã xoá sản phẩm.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

/** ========== COMMENTS (public) ========== */
exports.addComment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { comment, name } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Field "comment" là bắt buộc.' });
    }

    const product = await findBySlugOrId(slug);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    product.comments.push({ name: (name || 'Guest').trim(), comment: comment.trim() });
    await product.save();

    return res.json({ success: true, comments: product.comments });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};

/** ========== RATINGS (login) ========== */
exports.rateProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const stars = Number(req.body?.stars ?? req.body?.rating);

    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Rating phải từ 1-5.' });
    }

    const product = await findBySlugOrId(slug);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    const uid = req.user._id.toString();
    const idx = product.ratings.findIndex(r => r.user.toString() === uid);

    if (idx >= 0) {
      product.ratings[idx].stars = stars;
      product.ratings[idx].createdAt = new Date();
    } else {
      product.ratings.push({ user: req.user._id, stars });
    }

    product.recomputeRating();
    await product.save();

    return res.json({ success: true, avgRating: product.avgRating, ratingsCount: product.ratingsCount });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Lỗi server', error: e.message });
  }
};
