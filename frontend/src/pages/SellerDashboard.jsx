import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import { productService } from '../services/api.js';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '1',
    imageUrl: 'https://via.placeholder.com/300x200?text=Product+Image'
  });

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from API...');
      const response = await productService.getMyProducts();
      console.log('Products response:', response.data);
      
      // La réponse peut être response.data.products ou response.data
      const productsData = response.data.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. ' + (err.message || ''));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image'
      };

      console.log('Submitting product:', productData);

      if (editingProduct) {
        await productService.update(editingProduct._id, productData);
      } else {
        await productService.create(productData);
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '1',
        imageUrl: 'https://via.placeholder.com/300x200?text=Product+Image'
      });
      
      fetchProducts(); // Rafraîchir la liste
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.error || 'Failed to save product. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      imageUrl: product.imageUrl
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(productId);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      stock: '1',
      imageUrl: 'https://via.placeholder.com/300x200?text=Product+Image'
    });
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>📊 Seller Dashboard</h1>
          <p className="text-muted">Manage your products and sales</p>
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            + Add New Product
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>
        {error}
      </Alert>}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{products.length}</Card.Title>
              <Card.Text>Total Products</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                ${products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toFixed(2)}
              </Card.Title>
              <Card.Text>Inventory Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {products.filter(p => (p.stock || 0) < 10).length}
              </Card.Title>
              <Card.Text>Low Stock</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {products.filter(p => (p.stock || 0) === 0).length}
              </Card.Title>
              <Card.Text>Out of Stock</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Card>
        <Card.Body>
          <Card.Title>Your Products</Card.Title>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-4">
              <p>No products yet. Add your first product!</p>
              <Button variant="primary" onClick={() => {
                resetForm();
                setShowModal(true);
              }}>
                Add Your First Product
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={product.imageUrl || 'https://via.placeholder.com/50'} 
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <div className="text-muted small" style={{ maxWidth: '200px' }}>
                            {product.description.length > 50 
                              ? product.description.substring(0, 50) + '...'
                              : product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>${(product.price || 0).toFixed(2)}</td>
                    <td>
                      <span className={product.stock < 10 ? 'text-danger fw-bold' : ''}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        resetForm();
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe your product"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <Form.Text className="text-muted">
                Leave empty for default image. Use image hosting services like Imgur.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={formLoading}>
              {formLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingProduct ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingProduct ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SellerDashboard;
