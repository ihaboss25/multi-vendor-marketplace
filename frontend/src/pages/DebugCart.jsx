import React from 'react';
import { Button } from 'react-bootstrap';

const DebugCart = () => {
  const setTestData = () => {
    localStorage.setItem('cart', JSON.stringify([{
      productId: 'test-123',
      name: 'Debug Product',
      price: 50,
      quantity: 3,
      imageUrl: 'https://via.placeholder.com/150',
      sellerId: 'seller-789',
      sellerName: 'Debug Seller'
    }]));
    alert('Test data set! Reload /cart');
  };

  const clearData = () => {
    localStorage.removeItem('cart');
    alert('Cart cleared!');
  };

  const showData = () => {
    alert(localStorage.getItem('cart') || 'Empty');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Debug Cart</h3>
      <Button onClick={setTestData} variant="primary" className="m-2">
        Set Test Cart
      </Button>
      <Button onClick={clearData} variant="danger" className="m-2">
        Clear Cart
      </Button>
      <Button onClick={showData} variant="info" className="m-2">
        Show Cart Data
      </Button>
    </div>
  );
};

export default DebugCart;
