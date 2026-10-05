// backend/routes/tenderRoutes.js
const express = require('express');
const router = express.Router();
const tenderController = require('../controllers/tenderController');
const Tender = require('../models/Tender');

// ISO Mapping for Frontend Hotspots
const stateIsoMapping = {
  'Delhi': 'IN-DL',
  'Delhi NCR': 'IN-DL',
  'Rajasthan': 'IN-RJ',
  'Uttar Pradesh': 'IN-UP',
  'Gujarat': 'IN-GJ',
  'Madhya Pradesh': 'IN-MP',
  'Maharashtra': 'IN-MH',
  'West Bengal': 'IN-WB',
  'Karnataka': 'IN-KA',
  'Tamil Nadu': 'IN-TN',
  'Andhra Pradesh': 'IN-AP',
  'Telangana': 'IN-TG',
  'Kerala': 'IN-KL',
  'Punjab': 'IN-PB',
  'Haryana': 'IN-HR',
  'Odisha': 'IN-OR',
  'Assam': 'IN-AS',
  'Bihar': 'IN-BR'
};

// Search & Filtering API Endpoint
router.get('/search', tenderController.searchTenders);

// State Map Stats GET Endpoint
router.get('/state-stats', async (req, res) => {
  try {
    const stats = await Tender.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 },
          totalValueSum: { $sum: '$financials.estimatedCost' },
          sectors: { $push: '$sector' }
        }
      }
    ]);

    const result = {};

    stats.forEach((item) => {
      const stateName = item._id;
      const isoCode = stateIsoMapping[stateName];

      if (isoCode) {
        const sectorFreq = {};
        item.sectors.forEach((sec) => {
          if (sec) sectorFreq[sec] = (sectorFreq[sec] || 0) + 1;
        });

        const topSector = Object.keys(sectorFreq).reduce(
          (a, b) => (sectorFreq[a] > sectorFreq[b] ? a : b),
          'Infrastructure'
        );

        const inCrores = (item.totalValueSum / 10000000).toFixed(2);

        result[isoCode] = {
          name: stateName,
          count: item.count,
          totalValue: `₹${inCrores} Cr`,
          topSector
        };
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating state statistics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;