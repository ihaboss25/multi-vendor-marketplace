const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Tentative de connexion à MongoDB...');
        console.log('URI:', process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB connecté avec succès !');
        console.log('📁 Base de données:', mongoose.connection.name);
        console.log('📍 Host:', mongoose.connection.host);
        
        // Test d'une opération simple
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('📊 Collections disponibles:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ ERREUR MongoDB:', error.message);
        console.log('\n💡 Solutions possibles :');
        console.log('1. Vérifiez que MongoDB est démarré');
        console.log('2. Essayez cette commande: mongosh marketplace');
        console.log('3. Essayez cette URI: mongodb://localhost:27017/marketplace');
        process.exit(1);
    }
};

module.exports = connectDB;