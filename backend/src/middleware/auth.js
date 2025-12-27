const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const auth = (req, res, next) => {
    // Récupérer le token du header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Accès non autorisé. Token manquant.'
        });
    }
    
    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les infos utilisateur à la requête
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        
        next(); // Continuer vers la route
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Token invalide ou expiré.'
        });
    }
};

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Accès refusé. Rôle insuffisant.'
            });
        }
        next();
    };
};

module.exports = { auth, checkRole };