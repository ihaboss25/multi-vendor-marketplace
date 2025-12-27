import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          🛒 Marketplace
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Accueil</Nav.Link>
            <Nav.Link as={Link} to="/products">Produits</Nav.Link>
            
            {isAuthenticated && user?.role === 'buyer' && (
              <>
                <Nav.Link as={Link} to="/cart">Panier</Nav.Link>
                <Nav.Link as={Link} to="/orders">Mes Commandes</Nav.Link>
              </>
            )}
            
            {isAuthenticated && user?.role === 'seller' && (
              <>
                <Nav.Link as={Link} to="/seller/dashboard">Tableau de Bord</Nav.Link>
                <Nav.Link as={Link} to="/seller/orders">Ventes</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <>
                    <span className="me-1">��</span>
                    {user?.name}
                  </>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button variant="outline-light" className="me-2" as={Link} to="/login">
                  Connexion
                </Button>
                <Button variant="light" as={Link} to="/register">
                  Inscription
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
