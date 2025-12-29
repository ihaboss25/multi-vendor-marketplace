const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a product (image upload)
router.post('/', 
  auth, 
  checkRole(['seller', 'admin']), 
  upload.single('image'),
  productController.createProduct
);

// Get all products
router.get('/', productController.getAllProducts);

// Get products for logged-in seller - CORRIGÉ
router.get('/seller/my-products', auth, checkRole(['seller', 'admin']), (req, res) => {
  res.json({ test: 'Route works', userId: req.userId });
});

// Get product by ID
router.get('/:id', productController.getProductById);

// Update a product
router.put('/:id', auth, checkRole(['seller', 'admin']), productController.updateProduct);

// Delete a product
router.delete('/:id', auth, checkRole(['seller', 'admin']), productController.deleteProduct);

module.exports = router;