// models/productModel.js
const mongoose = require('mongoose');

// ======================
// Helper: bỏ dấu tiếng Việt + chuẩn hóa
// ======================
function normalizeVi(str = '') {
  return String(str)
    .normalize('NFD')                 // tách dấu
    .replace(/[\u0300-\u036f]/g, '')  // bỏ dấu
    .toLowerCase()
    .trim();
}

// Schema cho một biến thể sản phẩm
const variantSchema = new mongoose.Schema({
  variantId: { type: String, required: true },
  name: { type: String, required: true },  // Ví dụ: "Màu Đen, 16GB RAM"
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 } // Số lượng tồn kho
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  brand: { type: String },
  productDescription: { type: String },

  // Thay thế các trường cũ bằng một mảng các biến thể
  variants: [variantSchema],

  images: [{ type: String }], // Mảng các URL hình ảnh
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  isNewProduct: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  category: {
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    level: { type: Number, required: true }
  },

  // ======================
  // Các field "không dấu" để search #14 (không bắt buộc required)
  // ======================
  productNameNorm: { type: String, default: '' },
  brandNorm: { type: String, default: '' },
  productDescriptionNorm: { type: String, default: '' }
}, { timestamps: true });

// ======================
// Hooks: tự cập nhật *Norm khi tạo/cập nhật
// ======================
productSchema.pre('save', function(next) {
  this.productNameNorm        = normalizeVi(this.productName);
  this.brandNorm              = normalizeVi(this.brand);
  this.productDescriptionNorm = normalizeVi(this.productDescription);
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  const u = this.getUpdate() || {};
  const $set = u.$set || u;

  if ($set.productName !== undefined) {
    $set.productNameNorm = normalizeVi($set.productName);
  }
  if ($set.brand !== undefined) {
    $set.brandNorm = normalizeVi($set.brand);
  }
  if ($set.productDescription !== undefined) {
    $set.productDescriptionNorm = normalizeVi($set.productDescription);
  }

  // ghi ngược vào update
  if (u.$set) this.setUpdate({ ...u, $set });
  else this.setUpdate($set);

  next();
});

// ======================
// Index phục vụ search/filter/sort (14, 15, 16)
// ======================
// 1) Full-text (tùy chọn dùng searchMode=text)
productSchema.index({ productName: 'text', productDescription: 'text', brand: 'text' });
// 2) Search "không dấu"
productSchema.index({ productNameNorm: 1 });
productSchema.index({ brandNorm: 1 });
productSchema.index({ productDescriptionNorm: 1 });
// 3) Filter brand/giá nhanh + sort theo minPrice (được tính ở pipeline)
productSchema.index({ brand: 1 });
productSchema.index({ 'variants.price': 1 });
productSchema.index({ 'category.categoryId': 1 });

module.exports = mongoose.model('Product', productSchema);
