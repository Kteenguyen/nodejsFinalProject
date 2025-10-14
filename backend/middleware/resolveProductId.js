const mongoose = require("mongoose");

/**
 * Middleware linh hoạt để tìm một document dựa trên ID.
 * Nó nhận một object cấu hình và trả về một middleware.
 */
const resolveId = (options) => {
  // Hàm middleware thực tế sẽ được trả về và sử dụng bởi router
  return async (req, res, next) => {
    try {
      // 1. Lấy các tùy chọn từ object cấu hình
      const idParamName = options.param; // vd: 'productId'
      const Model = options.model;       // vd: Product Model
      const reqKey = options.reqKey;     // vd: 'product'

      // 2. Lấy giá trị ID từ request body (dựa trên tên param đã cấu hình)
      const idValue = req.body[idParamName];
      
      if (!idValue) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required field: ${idParamName}` 
        });
      }

      // 3. Sử dụng Model đã được truyền vào để tìm kiếm
      // (Giữ lại logic tìm kiếm thông minh của bạn)
      let document;
      if (mongoose.Types.ObjectId.isValid(idValue)) {
        document = await Model.findOne({ _id: idValue });
      } else {
        // Fallback to custom field if provided (như productId của bạn)
        const customField = options.customField || idParamName;
        document = await Model.findOne({ [customField]: idValue });
      }

      if (!document) {
        return res.status(404).json({ 
          success: false, 
          message: `${Model.modelName} with ID ${idValue} not found` 
        });
      }

      // 4. Gán document tìm thấy vào request để controller có thể sử dụng
      req[reqKey] = document;
      next();

    } catch (err) {
      console.error('Resolve ID error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while resolving document',
        error: err.message 
      });
    }
  };
};

module.exports = resolveId;