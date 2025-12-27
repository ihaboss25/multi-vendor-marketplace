import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api.js';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const navigate = useNavigate();

  // Charger le panier depuis localStorage au démarrage - VERSION CORRIGÉE
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    console.log('DEBUG savedCart:', savedCart);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        console.log('DEBUG parsed:', parsed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        }
      } catch (e) {
        console.error('DEBUG parse error:', e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems(cartItems.filter(item => item.productId !== productId));
    } else {
      setCartItems(cartItems.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (productId) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.productId === product._id);
    if (existingItem) {
      updateQuantity(product._id, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        seller: product.sellerName || 'Unknown Seller',
        sellerName: product.sellerName || 'Unknown Seller'
      }]);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const shippingFee = cartItems.length > 0 ? 9.99 : 0;
  const taxRate = 0.08;
  const subtotal = calculateSubtotal();
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Please enter shipping address');
      return;
    }

    setCheckoutProcessing(true);
    setError('');

    try {
      // 1. Créer la commande
      const orderResponse = await orderService.checkout({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress
      });

      const orderId = orderResponse.data.orderId || orderResponse.data.order._id;

      // 2. Traiter le paiement
      const paymentResponse = await orderService.processPayment({
        orderId,
        paymentMethod
      });

      // 3. Vider le panier
      localStorage.removeItem('cart');
      setCartItems([]);

      // 4. Rediriger vers la page de confirmation
      navigate('/orders', { 
        state: { 
          message: 'Order placed successfully!',
          orderId: paymentResponse.data.transactionId 
        }
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutProcessing(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">🛒 Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <div className="fs-1 mb-3">🛍️</div>
            <Card.Title>Your cart is empty</Card.Title>
            <Card.Text className="mb-4">
              Add some amazing products to your cart!
            </Card.Text>
            <Button as={Link} to="/products" variant="primary">
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Alert variant="info" className="mb-4">
            You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart. 
            Ready to checkout?
          </Alert>

          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.productId}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                              />
                              <div>
                                <strong>{item.name}</strong>
                                <div className="text-muted small">
                                  Seller: {item.sellerName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <Form.Control
                                type="number"
                                min="1"
                                max={item.maxStock}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                style={{ width: '70px', margin: '0 10px', textAlign: 'center' }}
                              />
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td>
                            <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                          </td>
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-between mb-4">
                <Button as={Link} to="/products" variant="outline-primary">
                  ← Continue Shopping
                </Button>
                <Button 
                  variant="outline-danger"
                  onClick={() => {
                    if (window.confirm('Clear your entire cart?')) {
                      localStorage.removeItem('cart');
                      setCartItems([]);
                    }
                  }}
                >
                  Clear Cart
                </Button>
              </div>
            </Col>

            <Col lg={4}>
              <Card className="sticky-top" style={{ top: '20px' }}>
                <Card.Body>
                  <Card.Title>Order Summary</Card.Title>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>${shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong>${total.toFixed(2)}</strong>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Shipping Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter your full shipping address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="mock">Mock Payment (Test)</option>
                    </Form.Select>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="mt-3">
                      {error}
                    </Alert>
                  )}

                  <Button
                    variant="success"
                    size="lg"
                    className="w-100"
                    onClick={handleCheckout}
                    disabled={checkoutProcessing || cartItems.length === 0}
                  >
                    {checkoutProcessing ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>

                  <div className="text-center mt-3 text-muted small">
                    <p className="mb-1">Test Mode: No real payment required</p>
                    <p>Orders are simulated for demonstration</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Order Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Your order has been placed successfully!
              <br />
              Order ID: <strong>ORD-{Date.now()}</strong>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => navigate('/orders')}>
                View Orders
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Cart;
