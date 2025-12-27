const Order = require('../models/Order');
const Product = require('../models/Product');

// Créer une commande (checkout)
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const buyerId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Vérifier les produits et calculer le total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      // Réduire le stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        seller: product.seller
      });

      totalAmount += product.price * item.quantity;
    }

    // Créer la commande
    const order = new Order({
      buyer: buyerId,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || 'Not specified',
      status: 'pending'
    });

    await order.save();

    // Peupler les données pour la réponse
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name imageUrl')
      .populate('items.seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder,
      orderId: order._id
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order: ' + error.message
    });
  }
};

// Obtenir les commandes de l'acheteur
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId })
      .populate('items.product', 'name imageUrl price')
      .populate('items.seller', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// Obtenir les commandes du vendeur
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.userId })
      .populate('buyer', 'name email')
      .populate('items.product', 'name imageUrl price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller orders'
    });
  }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const order = await Order.findById(orderId)
      .populate('items.seller');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Vérifier les permissions
    const isSeller = order.items.some(item => 
      item.seller._id.toString() === userId.toString()
    );
    
    if (!isSeller && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this order'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
};

// Simuler un paiement
exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    // Simulation de paiement - dans un vrai projet, intégrer Stripe/PayPal
    const paymentSuccess = Math.random() > 0.1; // 90% de succès

    if (!paymentSuccess) {
      return res.status(400).json({
        success: false,
        error: 'Payment failed. Please try again.'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: 'paid',
        paymentMethod,
        paidAt: new Date()
      },
      { new: true }
    ).populate('buyer', 'name email');

    res.json({
      success: true,
      message: 'Payment processed successfully',
      order,
      transactionId: 'TXN_' + Date.now() + Math.random().toString(36).substr(2, 9)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
};
