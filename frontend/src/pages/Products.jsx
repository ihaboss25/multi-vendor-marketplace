import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Données de test (fallback uniquement)
  const allProducts = [];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        // Si l'API retourne { products: [...] } ou directement un tableau
        setProducts(data.products || data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data if API fails
        setProducts(allProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Electronics', 'Books', 'Clothing', 'Home', 'Sports'];

  const handleAddToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = currentCart.findIndex(item => item.productId === product._id);
    
    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        sellerId: product.seller,
        sellerName: typeof product.seller === 'object' ? product.seller.name : product.seller
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert(`✅ ${product.name} added to cart!`);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">🛍️ Browse Products</h1>
      
      {/* Filtres */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>📁</InputGroup.Text>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{filteredProducts.length}</Card.Title>
              <Card.Text>Products Found</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {[...new Set(filteredProducts.map(p => p.category))].length}
              </Card.Title>
              <Card.Text>Categories</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {[...new Set(filteredProducts.map(p => p.seller))].length}
              </Card.Title>
              <Card.Text>Sellers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                ${filteredProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
              </Card.Title>
              <Card.Text>Total Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des produits */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-5">
          <h4>No products found</h4>
          <p>Try changing your search or filter criteria</p>
        </div>
      ) : (
        <Row>
          {filteredProducts.map((product) => (
            <Col key={product._id} md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={product.imageUrl} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-secondary">{product.category}</span>
                    <span className="badge bg-info ms-2">By: {typeof product.seller === 'object' ? product.seller.name : product.seller}</span>
                  </div>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="flex-grow-1">
                    {product.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h4 className="text-primary mb-0">${product.price.toFixed(2)}</h4>
                        <small className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </small>
                      </div>
                      <Button 
                        variant="primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? '🛒 Add to Cart' : 'Sold Out'}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Products;