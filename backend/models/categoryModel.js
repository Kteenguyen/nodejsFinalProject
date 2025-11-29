// backend/models/categoryModel.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    categoryId: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    description: { 
      type: String, 
      default: '',
      trim: true
    },
    image: { 
      type: String, 
      default: ''
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true 
  }
);

// Index cho tìm kiếm
categorySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Category', categorySchema);
