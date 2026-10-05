// models/Usage.js
const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['Free', 'Paid', 'Enterprise'], default: 'Free' },
    
    // Usage counters
    searches: { type: Number, default: 0 },
    tenderPages: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    bidResults: { type: Number, default: 0 },
    profiles: { type: Number, default: 0 },
    deepDiveReports: { type: Number, default: 0 },
    deepDiveReopens: { type: Number, default: 0 },
    listPages: { type: Number, default: 0 },

    // Tracking for auto reset
    lastResetDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usage', usageSchema);