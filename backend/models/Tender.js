// backend/models/Tender.js
const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
  tenderId: { type: String, required: true, unique: true, index: true },
  refNumber: { type: String, index: true }, // e.g. 2026_NHAI_291809_1
  title: { type: String, required: true },
  description: { type: String },
  
  // Organization & Portal Info
  authorityName: { type: String, required: true, index: true }, // e.g. National Highways Authority of India
  portalSource: { type: String, required: true, index: true }, // e.g. CPSE, CPP eProcure, GeM, RLY IREPS
  authorityType: { type: String, enum: ['CENTRAL', 'STATE', 'PSU', 'OTHER'], default: 'PSU', index: true },
  
  // Categorization & Classification
  tenderType: { type: String, enum: ['Works', 'Supply', 'Services', 'Consulting', 'Leasing', 'Other'], index: true },
  sector: { type: String, index: true }, // e.g. Civic, Railways, Roads & Highways, Power
  subCategory: { type: String, index: true }, // e.g. Water, Buildings, Bridges, SITC, Maintenance
  scheme: { type: String, index: true }, // e.g. Jal Jeevan Mission, AMRUT, Smart City, PMGSY
  
  // Location Details
  location: {
    state: { type: String, required: true, index: true },
    city: { type: String, index: true },
    pincode: { type: String }
  },
  
  // Financials
  financials: {
    estimatedCost: { type: Number, required: true, index: true }, // Numeric value in INR
    currency: { type: String, default: 'INR' },
    isEstValue: { type: Boolean, default: false }, // If value is estimated (e.g. 1,000 Cr+ EST)
    emdAmount: { type: Number },
    tenderFee: { type: Number }
  },
  
  // Dates
  dates: {
    publishedDate: { type: Date, default: Date.now, index: true },
    closingDate: { type: Date, required: true, index: true }
  },
  
  // Stage & Status
  stage: { type: String, enum: ['LIVE', 'CLOSED', 'RESULTS', 'PAST_STAGES'], default: 'LIVE', index: true },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE', index: true },
  documentUrl: { type: String }
}, { timestamps: true });

// Compound Compound Text Indexing for Fast Keyword Searches
tenderSchema.index({
  title: 'text',
  description: 'text',
  authorityName: 'text',
  refNumber: 'text',
  sector: 'text',
  subCategory: 'text'
});

// Compound Indexing for High Performance Multi-filtering
tenderSchema.index({ 'location.state': 1, 'financials.estimatedCost': 1, stage: 1 });

module.exports = mongoose.model('Tender', tenderSchema);