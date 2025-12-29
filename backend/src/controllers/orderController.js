const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order (checkout)
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

    // Validate products and calculate total
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

      // Reduce stock
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

    // Create order
    const order = new Order({
      buyer: buyerId,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || 'Not specified',
      status: 'pending'
    });

    await order.save();

    // Populate data for response
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

// Get buyer orders
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

// Get seller orders
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

// Update order status
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

    // Check permissions
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

// Simulate payment
exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    // Payment simulation - in a real project, integrate Stripe/PayPal
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

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