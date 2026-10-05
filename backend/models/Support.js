// models/Support.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  sender: { type: String, enum: ['User', 'Admin'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const supportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    replies: [replySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Support', supportSchema);