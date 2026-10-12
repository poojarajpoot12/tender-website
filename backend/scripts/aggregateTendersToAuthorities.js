const mongoose = require('mongoose');
const Authority = require('../models/Authority');
const Tender = require('../models/Tender'); // Your existing tenders collection

const syncAuthoritiesFromTenders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Syncing Authorities from Tenders Collection...');

    // Aggregation query: Grouping all tenders by authority name
    const aggregatedData = await Tender.aggregate([
      {
        $group: {
          _id: "$authorityName", // Tender document me jaha authority/buyer ka name ho
          totalTenders: { $sum: 1 },
          liveTenders: {
            $sum: {$cond: [{ $eq: ["$status", "live"] }, 1, 0] }
          },
          awardedTenders: {
            $sum: {$cond: [{ $eq: ["$status", "awarded"] }, 1, 0] }
          },
          awardedValue: { $sum: "$tenderValue" },
          sector: { $first: "$sector" },
          primaryState: { $first: "$state" }
        }
      }
    ]);

    // Bulk write into Authority Collection
    const bulkOps = aggregatedData.map(item => ({
      updateOne: {
        filter: { name: item._id },
        update: {
          $set: {
            name: item._id,
            totalTenders: item.totalTenders,
            liveTenders: item.liveTenders,
            awardedTenders: item.awardedTenders,
            awardedValue: item.awardedValue,
            sector: item.sector || 'Civic',
            primaryState: item.primaryState || 'Central',
            category: 'PSU'
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Authority.bulkWrite(bulkOps);
      console.log(`✅ Synced ${bulkOps.length} Authorities successfully!`);
    }

    process.exit();
  } catch (error) {
    console.error("❌ Aggregation Sync Error:", error);
    process.exit(1);
  }
};

syncAuthoritiesFromTenders();