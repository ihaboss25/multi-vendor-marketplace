const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, checkRole } = require('../middleware/auth');

// Créer une commande (checkout) - acheteurs seulement
router.post('/checkout', 
  auth, 
  checkRole(['buyer']), 
  orderController.createOrder
);

// Traiter le paiement
router.post('/process-payment',
  auth,
  checkRole(['buyer']),
  orderController.processPayment
);

// Commandes de l'acheteur
router.get('/my-orders',
  auth,
  checkRole(['buyer']),
  orderController.getBuyerOrders
);

// Commandes du vendeur
router.get('/seller-orders',
  auth,
  checkRole(['seller', 'admin']),
  orderController.getSellerOrders
);

// Mettre à jour le statut d'une commande (vendeur/admin)
router.put('/:orderId/status',
  auth,
  checkRole(['seller', 'admin']),
  orderController.updateOrderStatus
);

// Cancel an order (buyer only)
router.put('/:orderId/cancel', auth, orderController.cancelOrder);

module.exports = router;