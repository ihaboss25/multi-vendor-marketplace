const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'This email is already in use.' 
            });
        }
        
        // Create new user
        const user = new User({
            email,
            password,
            name,
            role: role || 'buyer'
        });
        
        await user.save();
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration error: ' + error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Incorrect email or password.'
            });
        }
        
                // Check password
        const isMatch = await new Promise((resolve, reject) => {
            user.comparePassword(password, (err, isMatch) => {
                if (err) reject(err);
                resolve(isMatch);
            });
        });
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Login error'
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching profile'
        });
    }
};