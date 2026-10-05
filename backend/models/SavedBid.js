// models/SavedBid.js
const mongoose = require('mongoose');

const savedBidSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenderId: { type: String, required: true },
    title: { type: String, required: true },
    value: { type: String, default: 'N/A' },
    closingDate: { type: Date },
    category: { type: String, default: 'General' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedBid', savedBidSchema);