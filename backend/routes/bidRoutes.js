// routes/bidRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all registered bidders / contractors
// @route   GET /api/bids/bidders
// @access  Public
router.get('/bidders', async (req, res) => {
  try {
    // 1. Fetch all users from DB
    const users = await User.find({})
      .select('-password -otp -otpExpires -mobileOtp -mobileOtpExpires')
      .lean();

    // 2. Map and Format Bidders Data
    let bidders = users
      .map((user) => {
        // Collect Locations (Combine direct & alert preferences)
        const locSet = new Set([
          ...(Array.isArray(user.locations) ? user.locations : []),
          ...(Array.isArray(user.alertPreferences?.locations) ? user.alertPreferences.locations : [])
        ]);

        // Collect Specializations (Combine direct & alert keywords)
        const specSet = new Set([
          ...(Array.isArray(user.specializations) ? user.specializations : []),
          ...(Array.isArray(user.alertPreferences?.keywords) ? user.alertPreferences.keywords : [])
        ]);

        // Smart Display Name Resolution
        let displayCompany = '';
        if (user.companyName && user.companyName.trim() !== '') {
          displayCompany = user.companyName.trim();
        } else if (user.name && user.name.trim() !== '') {
          displayCompany = user.name.trim();
        } else if (user.email && user.email.includes('@')) {
          displayCompany = user.email.split('@')[0];
        } else {
          displayCompany = 'Registered Enterprise';
        }

        return {
          _id: user._id,
          companyName: displayCompany,
          companyLogo: user.companyLogo || '',
          specializations: Array.from(specSet).filter(Boolean),
          locations: Array.from(locSet).filter(Boolean),
          totalTenders: Number(user.totalTenders) || 0,
          wonTenders: Number(user.wonTenders) || 0,
          wonValue: Number(user.wonValue) || 0,
          isVerified: Boolean(user.isVerified),
          email: user.email || ''
        };
      });

    // 3. Sort Bidders by performance (highest totalTenders & wonTenders first)
    bidders.sort((a, b) => b.totalTenders - a.totalTenders || b.wonTenders - a.wonTenders);

    // Assign isLeader flag to highest performing company
    if (bidders.length > 0) {
      bidders = bidders.map((b, idx) => ({
        ...b,
        isLeader: idx === 0 && b.wonTenders > 0
      }));
    }

    console.log(`✅ [BIDDERS API] Successfully fetched ${bidders.length} bidders from MongoDB`);

    return res.status(200).json(bidders);
  } catch (error) {
    console.error('❌ Fetch Bidders Error:', error);
    return res.status(500).json({
      message: 'Error fetching bidders data',
      error: error.message
    });
  }
});

module.exports = router;