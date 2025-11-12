// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const Product = require('../models/productModel');

const { protect, admin } = require('../middleware/authMiddleware');
const resolveId = require('../middleware/resolveProductId');

const resolveProductMiddleware = resolveId({
  param: 'productId',
  model: Product,
  reqKey: 'product',
});

// PUBLIC
router.get('/', productController.getProducts); // trả về fields: productId, productName + alias name, minPrice + alias lowestPrice, images[0], brand, ...

router.get('/collections/bestsellers', productController.getBestSellers);
router.get('/collections/new', productController.getNewProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.post('/batch', productController.batchProductLines);

router.get('/:productId', resolveProductMiddleware, productController.getProductDetails);

// COMMENTS & RATINGS
router.post('/:productId/comments', resolveProductMiddleware, productController.addGuestComment);
router.post('/:productId/ratings', protect, resolveProductMiddleware, productController.addUserRating);

// ADMIN
router.post('/', protect, admin, productController.createProduct);
router.put('/:productId', protect, admin, resolveProductMiddleware, productController.updateProduct);
router.delete('/:productId', protect, admin, resolveProductMiddleware, productController.deleteProduct);

module.exports = router;
