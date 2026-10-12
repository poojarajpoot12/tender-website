const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }, // e.g., "Western Coalfields Limited"
  code: { type: String, default: '' }, // e.g., "WCL"
  logo: { type: String, default: '' },
  
  // Categorization
  sector: { type: String, required: true, index: true }, // e.g., "Civic", "Power & Energy"
  category: { type: String, enum: ['PSU', 'Central', 'State', 'GeM'], required: true },
  primaryState: { type: String, default: 'Central', index: true }, // e.g., "Maharashtra"

  // Aggregate Metrics (Indexed for Fast Sorting)
  totalTenders: { type: Number, default: 0 },
  awardedTenders: { type: Number, default: 0 },
  liveTenders: { type: Number, default: 0 },
  awardedValue: { type: Number, default: 0, index: true }, // In Rupees (e.g. 394000000000)

  // State-wise Distribution Breakdown (For Authority Detail Drawer/Page)
  stateBreakdown: [{
    state: String,
    count: Number,
    value: Number
  }]
}, { timestamps: true });

// Text Index for Fast Search
authoritySchema.index({ name: 'text', sector: 'text' });

module.exports = mongoose.model('Authority', authoritySchema);