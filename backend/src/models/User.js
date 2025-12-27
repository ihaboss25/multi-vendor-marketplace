const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer'
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Password hashing - VERSION SIMPLIFIÉE
userSchema.pre('save', function(next) {
    const user = this;
    
    // Skip if password not modified
    if (!user.isModified('password')) {
        return next();
    }
    
    // Generate salt and hash
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Password comparison - VERSION SIMPLIFIÉE
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Alternative: version async pour le contrôleur
userSchema.methods.comparePasswordAsync = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);