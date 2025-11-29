// backend/controllers/categoryController.js
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// Lấy tất cả categories với số lượng products
exports.getAllCategories = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { categoryId: new RegExp(search, 'i') }
      ];
    }

    const categories = await Category.find(query).sort({ displayOrder: 1, name: 1 });

    // Đếm số products cho mỗi category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ 
          'category.categoryId': cat.categoryId 
        });
        return {
          ...cat.toObject(),
          productCount
        };
      })
    );

    res.json({ 
      success: true, 
      categories: categoriesWithCount,
      total: categoriesWithCount.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách danh mục', 
      error: error.message 
    });
  }
};

// Lấy chi tiết một category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục' 
      });
    }

    // Đếm số products
    const productCount = await Product.countDocuments({ 
      'category.categoryId': category.categoryId 
    });

    res.json({ 
      success: true, 
      category: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thông tin danh mục', 
      error: error.message 
    });
  }
};

// Tạo category mới
exports.createCategory = async (req, res) => {
  try {
    const { categoryId, name, slug, description, image, status, displayOrder } = req.body;

    // Validate required fields
    if (!categoryId || !name || !slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
      });
    }

    // Check duplicate categoryId or slug
    const existing = await Category.findOne({
      $or: [{ categoryId }, { slug }]
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: existing.categoryId === categoryId 
          ? 'Mã danh mục đã tồn tại' 
          : 'Slug đã tồn tại' 
      });
    }

    const category = new Category({
      categoryId,
      name,
      slug,
      description: description || '',
      image: image || '',
      status: status || 'active',
      displayOrder: displayOrder || 0
    });

    await category.save();

    res.status(201).json({ 
      success: true, 
      message: 'Tạo danh mục thành công', 
      category: {
        ...category.toObject(),
        productCount: 0
      }
    });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo danh mục', 
      error: error.message 
    });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, description, image, status, displayOrder } = req.body;

    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục' 
      });
    }

    // Check slug duplicate (nếu thay đổi)
    if (slug && slug !== category.slug) {
      const existing = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Slug đã tồn tại' 
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status) category.status = status;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    await category.save();

    // Cập nhật categoryName trong tất cả products
    if (name && name !== category.name) {
      await Product.updateMany(
        { 'category.categoryId': category.categoryId },
        { $set: { 'category.categoryName': name } }
      );
    }

    const productCount = await Product.countDocuments({ 
      'category.categoryId': category.categoryId 
    });

    res.json({ 
      success: true, 
      message: 'Cập nhật danh mục thành công', 
      category: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật danh mục', 
      error: error.message 
    });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục' 
      });
    }

    // Kiểm tra xem có products nào đang dùng category này không
    const productCount = await Product.countDocuments({ 
      'category.categoryId': category.categoryId 
    });

    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể xóa danh mục này vì có ${productCount} sản phẩm đang sử dụng. Vui lòng chuyển các sản phẩm sang danh mục khác trước.` 
      });
    }

    await category.deleteOne();

    res.json({ 
      success: true, 
      message: 'Xóa danh mục thành công' 
    });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa danh mục', 
      error: error.message 
    });
  }
};

// Lấy stats tổng quan
exports.getCategoryStats = async (req, res) => {
  try {
    const total = await Category.countDocuments();
    const active = await Category.countDocuments({ status: 'active' });
    const inactive = await Category.countDocuments({ status: 'inactive' });

    res.json({
      success: true,
      stats: { total, active, inactive }
    });
  } catch (error) {
    console.error('❌ Error fetching category stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê', 
      error: error.message 
    });
  }
};
