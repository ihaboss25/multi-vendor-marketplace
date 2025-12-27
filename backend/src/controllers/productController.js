const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Créer un produit
exports.createProduct = async (req, res) => {
  try {
    console.log('Req body:', req.body);
    console.log('Req file:', req.file);
    
    const { name, description, price, category, stock } = req.body;
    const sellerId = req.userId;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Vérifier si un fichier est uploadé
    let imageUrl = '';
    if (req.file) {
      try {
        // Upload sur Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'marketplace'
        });
        imageUrl = result.secure_url;
        // Supprimer le fichier temporaire
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Image upload failed'
        });
      }
    } else {
      // URL par défaut
      imageUrl = 'https://via.placeholder.com/300x200?text=Marketplace+Product';
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      imageUrl,
      seller: sellerId
    });

    await product.save();
    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès !',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer un produit par ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Vérifier que le vendeur est le propriétaire
    if (product.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    await product.save();
    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Vérifier que le vendeur est le propriétaire
    if (product.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
