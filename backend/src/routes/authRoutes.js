const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

// Test endpoint to verify authentication
router.get('/test', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Authentication successful', 
    user: req.user 
  });
});

// Get current user data
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 