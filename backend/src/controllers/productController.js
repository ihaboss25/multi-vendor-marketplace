const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Create a product
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

    // Check if a file is uploaded
    let imageUrl = '';
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'marketplace'
        });
        imageUrl = result.secure_url;
        // Delete temporary file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Image upload failed'
        });
      }
    } else {
      // Default placeholder image
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
      message: 'Product created successfully!',
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

// Get all products
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

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
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

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if seller is the owner
    if (product.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    await product.save();
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if seller is the owner
    if (product.seller.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get products for the logged-in seller
exports.getMyProducts = async (req, res) => {
  try {
    console.log('getMyProducts called, user ID:', req.userId);
    const products = await Product.find({ seller: req.userId });
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error in getMyProducts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};