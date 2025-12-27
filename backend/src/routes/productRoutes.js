const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Créer un produit (upload d'image)
router.post('/', 
  auth, 
  checkRole(['seller', 'admin']), 
  upload.single('image'),
  productController.createProduct
);

// Récupérer tous les produits
router.get('/', productController.getAllProducts);

// Récupérer un produit par ID
router.get('/:id', productController.getProductById);

// Mettre à jour un produit
router.put('/:id', auth, checkRole(['seller', 'admin']), productController.updateProduct);

// Supprimer un produit
router.delete('/:id', auth, checkRole(['seller', 'admin']), productController.deleteProduct);

module.exports = router;
