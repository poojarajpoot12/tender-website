// routes/authorityRoutes.js
const express = require('express');
const router = express.Router();
const Authority = require('../models/Authority');
const Tender = require('../models/Tender'); // Make sure Tender model is created

// @desc    Get Hero Stats, Dynamic Sector Counts, and State Counts
// @route   GET /api/authorities/meta-stats
// @access  Public
router.get('/meta-stats', async (req, res) => {
  try {
    // 1. Overall Platform Totals
    const overallStats = await Authority.aggregate([
      {
        $group: {
          _id: null,
          totalAuthorities: { $sum: 1 },
          totalTenderRecords: { $sum: '$totalTenders' },
          totalAwardedValue: { $sum: '$awardedValue' },
          totalLiveNow: { $sum: '$liveTenders' }
        }
      }
    ]);

    // 2. Dynamic Sector Counts (e.g. Civic (1,291), Education (707))
    const sectorBreakdown = await Authority.aggregate([
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3. Dynamic State Counts (e.g. Maharashtra (449), Uttar Pradesh (415))
    const stateBreakdown = await Authority.aggregate([
      { $group: { _id: '$primaryState', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      heroStats: overallStats[0] || {
        totalAuthorities: 0,
        totalTenderRecords: 0,
        totalAwardedValue: 0,
        totalLiveNow: 0
      },
      sectors: sectorBreakdown.map(s => ({ sector: s._id, count: s.count })),
      states: stateBreakdown.map(st => ({ state: st._id, count: st.count }))
    });
  } catch (error) {
    console.error('❌ Authority Meta-Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching meta statistics',
      error: error.message
    });
  }
});

// @desc    Get Paginated Authorities List with Filters & Sorting
// @route   GET /api/authorities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      sector, 
      state, 
      costBracket, 
      sort, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};

    // Filter: Sector
    if (sector && sector !== 'All sectors') {
      query.sector = sector;
    }

    // Filter: State
    if (state && state !== 'All states') {
      query.primaryState = state;
    }

    // Filter: Search Keyword
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { sector: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter: Cost Bracket (in Rupees)
    if (costBracket) {
      if (costBracket === '₹500 Cr+') query.awardedValue = { $gte: 50000000000 };
      else if (costBracket === '₹100–500 Cr') query.awardedValue = { $gte: 10000000000, $lt: 50000000000 };
      else if (costBracket === '₹25–100 Cr') query.awardedValue = { $gte: 2500000000, $lt: 10000000000 };
      else if (costBracket === '₹10–25 Cr') query.awardedValue = { $gte: 1000000000, $lt: 2500000000 };
      else if (costBracket === '₹5–10 Cr') query.awardedValue = { $gte: 500000000, $lt: 1000000000 };
      else if (costBracket === '₹2–5 Cr') query.awardedValue = { $gte: 200000000, $lt: 500000000 };
      else if (costBracket === '₹50 L–2 Cr') query.awardedValue = { $gte: 5000000, $lt: 200000000 };
      else if (costBracket === '< ₹50 L') query.awardedValue = { $lt: 5000000 };
    }

    // Sorting Options
    let sortOption = { awardedValue: -1 }; // Default: Highest Awarded Value
    if (sort === 'Sort: Tenders published' || sort === 'published') {
      sortOption = { totalTenders: -1 };
    } else if (sort === 'Sort: Awarded' || sort === 'awarded') {
      sortOption = { awardedTenders: -1 };
    } else if (sort === 'Sort: Live now' || sort === 'live') {
      sortOption = { liveTenders: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const totalRecords = await Authority.countDocuments(query);
    const authorities = await Authority.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      total: totalRecords,
      page: pageNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      data: authorities
    });
  } catch (error) {
    console.error('❌ Fetch Authorities Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching authorities list',
      error: error.message
    });
  }
});

// @desc    Get Single Authority Details & Active Tenders (Triggered on Card Click)
// @route   GET /api/authorities/:id/details
// @access  Public
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Authority Data
    const authority = await Authority.findById(id).lean();
    if (!authority) {
      return res.status(404).json({
        success: false,
        message: 'Authority not found'
      });
    }

    // 2. Fetch Live Tenders associated with this Authority
    let liveTenders = [];
    try {
      liveTenders = await Tender.find({ 
        authorityId: authority._id, 
        status: 'live' 
      })
        .select('tenderId title tenderValue location deadline category')
        .limit(10)
        .lean();
    } catch (tenderErr) {
      console.warn('⚠️ Could not fetch tenders associated with authority:', tenderErr.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        authority,
        liveTenders,
        stateDistribution: authority.stateBreakdown || []
      }
    });
  } catch (error) {
    console.error('❌ Fetch Single Authority Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching authority details',
      error: error.message
    });
  }
});

module.exports = router;