require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'chrome-extension://*/'];

// Middleware
app.use(express.json());
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', environment: process.env.NODE_ENV });
});

// Auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
