import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Pages (à créer plus tard)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/cart" element={
              <ProtectedRoute roles={['buyer']}>
                <Cart />
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute roles={['buyer']}>
                <Orders />
              </ProtectedRoute>
            } />
            
            <Route path="/seller/dashboard" element={
              <ProtectedRoute roles={['seller', 'admin']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/seller/orders" element={
              <ProtectedRoute roles={['seller', 'admin']}>
                <Orders sellerView />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </main>
      
      <footer className="footer">
        <div className="container text-center">
          <p>🛒 Multi-Vendor Marketplace &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
