// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const Support = require('../models/Support');

// Middleware safe import
const authImport = require('../middleware/authMiddleware');
const protect = typeof authImport === 'function' ? authImport : (authImport.protect || authImport.authMiddleware || authImport.verifyToken);

// Create support ticket/message
router.post('/', protect, async (req, res) => {
  try {
    const message = await Support.create({ ...req.body, userId: req.user.id });
    res.json({ message: 'Support query received successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting support query', error: error.message });
  }
});

module.exports = router;