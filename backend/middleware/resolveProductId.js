const mongoose = require("mongoose");

/**
 * Middleware tự động resolve product.
 * Tìm kiếm theo productId hoặc _id, chỉ trả về sản phẩm available.
 */
function resolveProduct(model) {
  return async (req, res, next) => {
    try {
      const productId = req.params.productId || req.body.productId || req.query.productId;
      
      if (!productId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID is required' 
        });
      }

      let product;
      
      // Tìm theo ObjectId
      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await model.findOne({ 
          $or: [
            { _id: productId },
            { productId: productId }
          ],
          status: 'available',
          soldOut: false
        });
      } else {
        // Tìm theo productId string
        product = await model.findOne({ 
          productId: productId,
          status: 'available',
          soldOut: false
        });
      }

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found or unavailable' 
        });
      }

      // Lưu product vào request để controller sử dụng
      req.product = product;
      next();
    } catch (err) {
      console.error('Resolve product error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while resolving product',
        error: err.message 
      });
    }
  };
}

module.exports = resolveProduct;
