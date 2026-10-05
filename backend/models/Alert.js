// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    preference: { type: String, required: true }, // e.g., "Roads & Highways"
    category: { type: String, required: true },
    state: { type: String, default: 'All' },
    status: { type: String, enum: ['Active', 'Paused'], default: 'Active' },
    lastMailed: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);