const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Route publique : Inscription
router.post('/register', authController.register);

// Route publique : Connexion
router.post('/login', authController.login);

// Route protégée : Profil utilisateur
router.get('/profile', auth, authController.getProfile);

// Route de test pour les rôles
router.get('/test-seller', auth, (req, res) => {
    res.json({
        success: true,
        message: 'Accès autorisé pour les vendeurs',
        user: {
            id: req.userId,
            role: req.userRole
        }
    });
});

module.exports = router;