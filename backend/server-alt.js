const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');

dotenv.config();
connectDB();

const app = express();

// CORS très permissif
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Route test simple
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!', timestamp: new Date() });
});

// Routes existantes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));

const PORT = 3001; // Port différent

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Alternative server on http://0.0.0.0:${PORT}`);
});
