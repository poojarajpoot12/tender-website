// backend/controllers/tenderController.js
const Tender = require('../models/Tender');

// Helper to format comma-separated queries to Array
const parseArrayParam = (param) => {
  if (!param) return null;
  if (Array.isArray(param)) return param;
  return param.split(',').map((item) => item.trim());
};

exports.searchTenders = async (req, res) => {
  try {
    const {
      q, stateNames, tenderTypes, categories, subCategories, agencyNames,
      minVal, maxVal, page = 1, limit = 10, sortBy = 'submissionDate', sortOrder = 'asc'
    } = req.query;

    let matchConditions = { isActive: true };

    if (q) matchConditions.$text = { $search: q };

    // Dynamic Filter Mapping to avoid repetitive code blocks
    const filters = {
      stateName: parseArrayParam(stateNames),
      tenderType: parseArrayParam(tenderTypes),
      category: parseArrayParam(categories),
      subCategory: parseArrayParam(subCategories),
      agencyName: parseArrayParam(agencyNames)
    };

    Object.entries(filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        matchConditions[key] = { $in: values.map(v => key === 'agencyName' || key === 'stateName' ? new RegExp(v, 'i') : v) };
      }
    });

    // Value Range Filter
    if (minVal || maxVal) {
      matchConditions.tenderValue = {};
      if (minVal) matchConditions.tenderValue.$gte = Number(minVal);
      if (maxVal) matchConditions.tenderValue.$lte = Number(maxVal);
    }

    // Sorting Setup
    const sortOptions = {};
    if (sortBy === 'highestValue') sortOptions.tenderValue = -1;
    else if (sortBy === 'mostRecent') sortOptions.publicDate = -1;
    else sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Aggregation pipeline with $facet
    const [resultData] = await Tender.aggregate([
      { $match: matchConditions },
      {
        $facet: {
          tenders: [{ $sort: sortOptions }, { $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'count' }],
          statesCount: [{ $group: { _id: '$stateName', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          categoriesCount: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          agencyCount: [{ $group: { _id: '$agencyName', count: { $sum: 1 } } }, { $sort: { count: -1 } }]
        }
      }
    ]);

    const totalResults = resultData.totalCount[0]?.count || 0;

    res.status(200).json({
      success: true,
      total: totalResults,
      page: pageNum,
      totalPages: Math.ceil(totalResults / limitNum),
      facets: {
        states: resultData.statesCount,
        categories: resultData.categoriesCount,
        agencies: resultData.agencyCount
      },
      data: resultData.tenders || []
    });

  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};