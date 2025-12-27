import React from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col md={8} className="mx-auto text-center">
          <h1 className="display-4 mb-4">🛒 Multi-Vendor Marketplace</h1>
          <p className="lead mb-4">
            Discover amazing products from multiple sellers. 
            Buy what you love or start selling your own products today!
          </p>
          
          {!isAuthenticated ? (
            <div className="d-flex gap-3 justify-content-center">
              <Button as={Link} to="/register" variant="primary" size="lg">
                Get Started
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg">
                Sign In
              </Button>
            </div>
          ) : (
            <div className="d-flex gap-3 justify-content-center">
              <Button as={Link} to="/products" variant="primary" size="lg">
                Browse Products
              </Button>
              {user?.role === 'seller' && (
                <Button as={Link} to="/seller/dashboard" variant="success" size="lg">
                  Seller Dashboard
                </Button>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-5">
        <h2 className="text-center mb-4">Why Choose Our Marketplace?</h2>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="fs-1 mb-3">🛍️</div>
              <Card.Title>Shop from Multiple Sellers</Card.Title>
              <Card.Text>
                Access a wide variety of products from different vendors in one place.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="fs-1 mb-3">🚀</div>
              <Card.Title>Start Selling Easily</Card.Title>
              <Card.Text>
                Create a seller account and list your products in minutes.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="fs-1 mb-3">🔒</div>
              <Card.Title>Secure Transactions</Card.Title>
              <Card.Text>
                Safe and secure payment processing for buyers and sellers.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* How It Works */}
      <Row className="py-4 bg-light rounded">
        <h2 className="text-center mb-4">How It Works</h2>
        
        <Col md={4} className="mb-3">
          <div className="text-center">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-4">1</span>
            </div>
            <h4>Sign Up</h4>
            <p>Create your account as a buyer or seller</p>
          </div>
        </Col>
        
        <Col md={4} className="mb-3">
          <div className="text-center">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-4">2</span>
            </div>
            <h4>{isAuthenticated && user?.role === 'seller' ? 'List Products' : 'Browse & Buy'}</h4>
            <p>
              {isAuthenticated && user?.role === 'seller' 
                ? 'Add your products to the marketplace'
                : 'Find products you love and add to cart'}
            </p>
          </div>
        </Col>
        
        <Col md={4} className="mb-3">
          <div className="text-center">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
              <span className="fs-4">3</span>
            </div>
            <h4>Complete Transaction</h4>
            <p>Checkout securely and track your orders</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
