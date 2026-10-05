// routes/bidRoutes.js
const express = require('express');
const router = express.Router();
const SavedBid = require('../models/SavedBid');

// Middleware safe import
const authImport = require('../middleware/authMiddleware');
const protect = typeof authImport === 'function' ? authImport : (authImport.protect || authImport.authMiddleware || authImport.verifyToken);

// Get all saved bids for user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const bids = await SavedBid.find({ userId });
    res.json(bids);
  } catch (error) {
    console.error('Error in GET /api/bids:', error);
    res.status(500).json({ message: 'Error fetching saved bids', error: error.message });
  }
});

// Save a new bid
router.post('/save', protect, async (req, res) => {
  try {
    console.log('Incoming req.body:', req.body);
    console.log('Incoming req.user:', req.user);

    // Extract User ID safely (handles req.user.id, req.user._id, req.user.userId)
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID missing in auth token' });
    }

    const newBid = await SavedBid.create({ 
      ...req.body, 
      userId 
    });

    console.log('Saved bid successfully:', newBid);
    res.status(201).json(newBid);
  } catch (error) {
    console.error('❌ Error saving bid:', error.message);
    res.status(500).json({ message: 'Error saving bid', error: error.message });
  }
});

module.exports = router;