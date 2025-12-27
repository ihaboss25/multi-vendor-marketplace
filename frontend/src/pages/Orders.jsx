import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab } from 'react-bootstrap';

const Orders = ({ sellerView = false }) => {
  // Données de test pour les commandes
  const buyerOrders = [
    {
      id: 'ORD-001',
      date: '2024-12-20',
      status: 'completed',
      total: 2572.77,
      items: [
        { name: 'Laptop Gaming', quantity: 1, price: 1299.99 },
        { name: 'Smartphone', quantity: 2, price: 799.99 },
        { name: 'Programming Book', quantity: 3, price: 39.99 },
      ],
      shippingAddress: '123 Main St, City, Country'
    },
    {
      id: 'ORD-002',
      date: '2024-12-18',
      status: 'pending',
      total: 159.98,
      items: [
        { name: 'T-Shirt', quantity: 2, price: 19.99 },
        { name: 'Coffee Mug', quantity: 4, price: 12.99 },
      ],
      shippingAddress: '456 Oak Ave, Town, Country'
    },
    {
      id: 'ORD-003',
      date: '2024-12-15',
      status: 'cancelled',
      total: 799.99,
      items: [
        { name: 'Headphones', quantity: 1, price: 199.99 },
      ],
      shippingAddress: '789 Pine Rd, Village, Country'
    },
  ];

  const sellerOrders = [
    {
      id: 'SORD-001',
      date: '2024-12-20',
      buyer: 'John Doe',
      status: 'completed',
      total: 1299.99,
      items: [
        { name: 'Laptop Gaming', quantity: 1, price: 1299.99 },
      ],
      revenue: 1169.99 // After marketplace fee (10%)
    },
    {
      id: 'SORD-002',
      date: '2024-12-19',
      buyer: 'Jane Smith',
      status: 'pending',
      total: 1599.98,
      items: [
        { name: 'Smartphone', quantity: 2, price: 799.99 },
      ],
      revenue: 1439.98
    },
    {
      id: 'SORD-003',
      date: '2024-12-18',
      buyer: 'Bob Johnson',
      status: 'completed',
      total: 119.97,
      items: [
        { name: 'Programming Book', quantity: 3, price: 39.99 },
      ],
      revenue: 107.97
    },
  ];

  const [activeTab, setActiveTab] = useState('all');
  const orders = sellerView ? sellerOrders : buyerOrders;

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

  return (
    <Container className="py-4">
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
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </Card.Title>
              <Card.Text>{sellerView ? 'Total Sales' : 'Total Spent'}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {orders.filter(o => o.status === 'completed').length}
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

      {/* Tabs pour filtrer */}
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

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <div className="fs-1 mb-3">
              {sellerView ? '📭' : '📦'}
            </div>
            <Card.Title>No orders found</Card.Title>
            <Card.Text className="mb-4">
              {sellerView 
                ? 'You don\'t have any sales yet. Add products to start selling!'
                : 'You haven\'t placed any orders yet. Start shopping!'}
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
            <Col key={order.id} md={12} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">Order #{order.id}</h5>
                      <p className="text-muted mb-0">
                        Date: {order.date}
                        {sellerView && order.buyer && ` • Buyer: ${order.buyer}`}
                      </p>
                    </div>
                    <div className="text-end">
                      {getStatusBadge(order.status)}
                      <h4 className="mt-2">${order.total.toFixed(2)}</h4>
                    </div>
                  </div>

                  {/* Détails des articles */}
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
                          <td>{item.name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">${item.price.toFixed(2)}</td>
                          <td className="text-end">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Informations supplémentaires */}
                  <Row className="mt-3">
                    {!sellerView && order.shippingAddress && (
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Shipping Address:</strong>
                        </p>
                        <p className="text-muted mb-0">{order.shippingAddress}</p>
                      </Col>
                    )}
                    {sellerView && order.revenue && (
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Your Revenue:</strong>
                        </p>
                        <p className="text-success fs-5 mb-0">
                          ${order.revenue.toFixed(2)} 
                          <small className="text-muted ms-2">
                            (after 10% marketplace fee)
                          </small>
                        </p>
                      </Col>
                    )}
                    <Col md={6} className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button variant="outline-success" size="sm">
                              Mark as Completed
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              Cancel Order
                            </Button>
                          </>
                        )}
                        <Button variant="outline-primary" size="sm">
                          View Details
                        </Button>
                        {!sellerView && order.status === 'completed' && (
                          <Button variant="outline-secondary" size="sm">
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
