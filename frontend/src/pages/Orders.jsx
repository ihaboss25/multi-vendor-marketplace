import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { orderService } from '../services/api';

const Orders = ({ sellerView = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchOrders();
  }, [sellerView]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = sellerView 
        ? await orderService.getSellerOrders()
        : await orderService.getBuyerOrders();
      
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        setError(response.error || 'Failed to load orders');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://multi-vendor-marketplace-p89x.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: `Order ${orderId} marked as ${newStatus}`, type: 'success' });
        fetchOrders(); // Refresh orders
      } else {
        setMessage({ text: data.error || 'Update failed', type: 'danger' });
      }
    } catch (err) {
      setMessage({ text: 'Update failed. Try again.', type: 'danger' });
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await handleUpdateStatus(orderId, 'cancelled');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (window.confirm('Mark this order as completed?')) {
      await handleUpdateStatus(orderId, 'completed');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <Badge bg="success">Completed</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Error: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {message.text && (
        <Alert variant={message.type} onClose={() => setMessage({ text: '', type: '' })} dismissible>
          {message.text}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h1>{sellerView ? '📊 Sales Orders' : '📦 My Orders'}</h1>
          <p className="text-muted">
            {sellerView 
              ? 'Manage your sales and track orders' 
              : 'Track and manage your purchase history'}
          </p>
        </Col>
        {!sellerView && (
          <Col className="text-end">
            <Button variant="outline-primary" as="a" href="/products">
              Continue Shopping
            </Button>
          </Col>
        )}
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{orders.length}</Card.Title>
              <Card.Text>Total Orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
              </Card.Title>
              <Card.Text>{sellerView ? 'Total Sales' : 'Total Spent'}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {orders.filter(o => o.status === 'completed' || o.status === 'paid').length}
              </Card.Title>
              <Card.Text>Completed</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {orders.filter(o => o.status === 'pending').length}
              </Card.Title>
              <Card.Text>Pending</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="all" title="All Orders" />
        <Tab eventKey="pending" title="Pending" />
        <Tab eventKey="completed" title="Completed" />
        <Tab eventKey="cancelled" title="Cancelled" />
      </Tabs>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <div className="fs-1 mb-3">
              {sellerView ? '📭' : '📦'}
            </div>
            <Card.Title>No orders found</Card.Title>
            <Card.Text className="mb-4">
              {sellerView 
                ? "You don't have any sales yet. Add products to start selling!"
                : "You haven't placed any orders yet. Start shopping!"}
            </Card.Text>
            <Button 
              variant="primary" 
              as="a" 
              href={sellerView ? "/seller/dashboard" : "/products"}
            >
              {sellerView ? 'Go to Dashboard' : 'Browse Products'}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredOrders.map((order) => (
            <Col key={order._id} md={12} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">Order #{order._id.slice(-6)}</h5>
                      <p className="text-muted mb-0">
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                        {sellerView && order.buyer?.name && ` • Buyer: ${order.buyer.name}`}
                      </p>
                    </div>
                    <div className="text-end">
                      {getStatusBadge(order.status)}
                      <h4 className="mt-2">${order.totalAmount.toFixed(2)}</h4>
                    </div>
                  </div>

                  {/* Items Details */}
                  <Table responsive size="sm" className="mb-3">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.name || 'Product'}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">${item.price.toFixed(2)}</td>
                          <td className="text-end">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Additional Info */}
                  <Row className="mt-3">
                    {!sellerView && order.shippingAddress && (
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Shipping Address:</strong>
                        </p>
                        <p className="text-muted mb-0">{order.shippingAddress}</p>
                      </Col>
                    )}
                    {sellerView && (
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Items:</strong>
                        </p>
                        <p className="text-muted mb-0">
                          {order.items.length} item(s) from your store
                        </p>
                      </Col>
                    )}
                    <Col md={6} className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {order.status === 'pending' && sellerView && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleCompleteOrder(order._id)}
                            >
                              Mark as Completed
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              Cancel Order
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => alert(`Order details for ${order._id}`)}
                        >
                          View Details
                        </Button>
                        {!sellerView && order.status === 'completed' && (
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => alert('Review feature coming soon!')}
                          >
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Orders;