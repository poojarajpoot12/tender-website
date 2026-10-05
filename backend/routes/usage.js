// routes/usage.js
const express = require('express');
const router = express.Router();
const Usage = require('../models/Usage');
const { protect } = require('../middleware/authMiddleware'); // Updated import

// Defined limits per plan
const PLAN_LIMITS = {
  Free: {
    searches: 300,
    tenderPages: 150,
    downloads: 50,
    bidResults: 8,
    profiles: 8,
    deepDiveReports: 1,
    deepDiveReopens: 10,
    listPages: 10,
  },
  Paid: {
    searches: Infinity,
    tenderPages: Infinity,
    downloads: Infinity,
    bidResults: 800,
    profiles: Infinity,
    deepDiveReports: 8,
    deepDiveReopens: Infinity,
    listPages: Infinity,
  }
};

// 1. Get current user usage (with monthly auto-reset check)
router.get('/my-usage', protect, async (req, res) => {
  try {
    let usage = await Usage.findOne({ userId: req.user.id });

    if (!usage) {
      usage = await Usage.create({ userId: req.user.id });
    }

    // Monthly Auto-Reset Check
    const lastReset = new Date(usage.lastResetDate);
    const now = new Date();

    const isDifferentMonth = 
      lastReset.getMonth() !== now.getMonth() || 
      lastReset.getFullYear() !== now.getFullYear();

    if (isDifferentMonth) {
      usage.searches = 0;
      usage.tenderPages = 0;
      usage.downloads = 0;
      usage.bidResults = 0;
      usage.profiles = 0;
      usage.deepDiveReports = 0;
      usage.deepDiveReopens = 0;
      usage.listPages = 0;
      usage.lastResetDate = now;
      await usage.save();
    }

    const limits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.Free;

    res.json({
      usage,
      limits
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching usage data', error: error.message });
  }
});

// 2. Increment action usage (e.g. search, download, view tender)
router.post('/track', protect, async (req, res) => {
  const { actionType } = req.body; 

  const validActions = [
    'searches', 'tenderPages', 'downloads', 'bidResults', 
    'profiles', 'deepDiveReports', 'deepDiveReopens', 'listPages'
  ];

  if (!validActions.includes(actionType)) {
    return res.status(400).json({ message: 'Invalid action type' });
  }

  try {
    let usage = await Usage.findOne({ userId: req.user.id });
    if (!usage) {
      usage = await Usage.create({ userId: req.user.id });
    }

    const limits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.Free;
    const currentCount = usage[actionType];
    const maxLimit = limits[actionType];

    if (currentCount >= maxLimit) {
      return res.status(403).json({ 
        message: `Monthly quota exceeded for ${actionType}. Please upgrade your plan.`,
        limitReached: true
      });
    }

    usage[actionType] += 1;
    await usage.save();

    res.json({ message: 'Usage updated successfully', usage });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking usage', error: error.message });
  }
});

module.exports = router;