// routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Middleware safe import
const authImport = require('../middleware/authMiddleware');
const protect = typeof authImport === 'function' ? authImport : (authImport.protect || authImport.authMiddleware || authImport.verifyToken);

// Get user alert preferences
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.findOne({ userId: req.user.id });
    res.json(alerts || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert preferences', error: error.message });
  }
});

// Update alert preferences
router.put('/', protect, async (req, res) => {
  try {
    const updatedAlerts = await Alert.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updatedAlerts);
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert preferences', error: error.message });
  }
});

module.exports = router;