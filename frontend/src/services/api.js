const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  }
};

export const productService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/products`);
    return response.json();
  }
};

export const orderService = {
  checkout: async (orderData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },
  processPayment: async (paymentData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/orders/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  },
  getBuyerOrders: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  getSellerOrders: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/orders/seller-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
