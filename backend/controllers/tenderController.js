// backend/controllers/tenderController.js
const Tender = require('../models/Tender');

// Helper to format comma-separated queries to Array regex/in
const parseArrayParam = (param) => {
  if (!param) return null;
  if (Array.isArray(param)) return param;
  return param.split(',').map((item) => item.trim());
};

exports.searchTenders = async (req, res) => {
  try {
    const {
      q,               // Search Keyword
      stage = 'LIVE',  // LIVE, CLOSED, RESULTS, GEM
      states,          // Comma separated list of states
      tenderTypes,     // Works, Supply, Services etc.
      sectors,         // Civic, Railways, etc.
      subCategories,   // Water, Buildings, etc.
      schemes,         // JJM, AMRUT, etc.
      authorityTypes,  // PSU, CENTRAL, STATE
      valueBucket,     // preset range (e.g., '<50L', '50L-2Cr', '2Cr-5Cr', '5Cr-10Cr', '10Cr-25Cr', '25Cr-100Cr', '100Cr-500Cr', '500Cr+')
      minCost,
      maxCost,
      closingSoon,     // '48h' or 'true'
      page = 1,
      limit = 10,
      sortBy = 'closingDate', // 'mostRecent', 'highestValue', 'closingSoon', 'closingDate'
      sortOrder = 'asc'
    } = req.query;

    let matchConditions = { status: 'ACTIVE' };

    // 1. Stage / Tab Filter
    if (stage === 'GEM') {
      matchConditions.portalSource = 'GeM';
    } else if (stage) {
      matchConditions.stage = stage.toUpperCase();
    }

    // 2. Text Keyword Search
    if (q) {
      matchConditions.$text = { $search: q };
    }

    // 3. Multi-Select Array Filters ($in)
    const stateList = parseArrayParam(states);
    if (stateList && stateList.length > 0) {
      matchConditions['location.state'] = { $in: stateList.map(s => new RegExp(s, 'i')) };
    }

    const typeList = parseArrayParam(tenderTypes);
    if (typeList && typeList.length > 0) {
      matchConditions.tenderType = { $in: typeList };
    }

    const sectorList = parseArrayParam(sectors);
    if (sectorList && sectorList.length > 0) {
      matchConditions.sector = { $in: sectorList.map(s => new RegExp(s, 'i')) };
    }

    const subCategoryList = parseArrayParam(subCategories);
    if (subCategoryList && subCategoryList.length > 0) {
      matchConditions.subCategory = { $in: subCategoryList.map(s => new RegExp(s, 'i')) };
    }

    const schemeList = parseArrayParam(schemes);
    if (schemeList && schemeList.length > 0) {
      matchConditions.scheme = { $in: schemeList.map(s => new RegExp(s, 'i')) };
    }

    const authTypeList = parseArrayParam(authorityTypes);
    if (authTypeList && authTypeList.length > 0) {
      matchConditions.authorityType = { $in: authTypeList };
    }

    // 4. Financial / Cost Range Preset Handling
    let costMin = minCost ? Number(minCost) : null;
    let costMax = maxCost ? Number(maxCost) : null;

    if (valueBucket) {
      switch (valueBucket) {
        case '<50L':
          costMax = 5000000;
          break;
        case '50L-2Cr':
          costMin = 5000000;
          costMax = 20000000;
          break;
        case '2Cr-5Cr':
          costMin = 20000000;
          costMax = 50000000;
          break;
        case '5Cr-10Cr':
          costMin = 50000000;
          costMax = 100000000;
          break;
        case '10Cr-25Cr':
          costMin = 100000000;
          costMax = 250000000;
          break;
        case '25Cr-100Cr':
          costMin = 250000000;
          costMax = 1000000000;
          break;
        case '100Cr-500Cr':
          costMin = 1000000000;
          costMax = 5000000000;
          break;
        case '500Cr+':
          costMin = 5000000000;
          break;
      }
    }

    if (costMin !== null || costMax !== null) {
      matchConditions['financials.estimatedCost'] = {};
      if (costMin !== null) matchConditions['financials.estimatedCost'].$gte = costMin;
      if (costMax !== null) matchConditions['financials.estimatedCost'].$lte = costMax;
    }

    // 5. Closing Soon (48 Hours) Filter
    if (closingSoon === '48h' || closingSoon === 'true') {
      const now = new Date();
      const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      matchConditions['dates.closingDate'] = { $gte: now, $lte: fortyEightHoursLater };
    }

    // 6. Sorting Setup
    let sortOptions = {};
    if (sortBy === 'highestValue') {
      sortOptions['financials.estimatedCost'] = -1;
    } else if (sortBy === 'mostRecent') {
      sortOptions['dates.publishedDate'] = -1;
    } else if (sortBy === 'closingSoon') {
      sortOptions['dates.closingDate'] = 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute Data Query and Sidebar Aggregations concurrently using $facet
    const aggregationResult = await Tender.aggregate([
      { $match: matchConditions },
      {
        $facet: {
          tenders: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limitNum }
          ],
          totalCount: [
            { $count: 'count' }
          ],
          // Real-time Sidebar Count Aggregations
          statesCount: [
            { $group: { _id: '$location.state', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          typesCount: [
            { $group: { _id: '$tenderType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          sectorsCount: [
            { $group: { _id: '$sector', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          subCategoriesCount: [
            { $group: { _id: '$subCategory', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          schemesCount: [
            { $group: { _id: '$scheme', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    const resultData = aggregationResult[0];
    const tenders = resultData.tenders || [];
    const totalResults = resultData.totalCount[0] ? resultData.totalCount[0].count : 0;

    res.status(200).json({
      success: true,
      total: totalResults,
      page: pageNum,
      totalPages: Math.ceil(totalResults / limitNum),
      facets: {
        states: resultData.statesCount,
        types: resultData.typesCount,
        sectors: resultData.sectorsCount,
        subCategories: resultData.subCategoriesCount,
        schemes: resultData.schemesCount
      },
      data: tenders
    });

  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};