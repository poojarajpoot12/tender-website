// backend/models/Tender.js
const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
  // Identifiers & Core Numbers
  tenderNumber: { type: String, required: true, unique: true, index: true },
  tenderID: { type: String, index: true },
  title: { type: String, required: true },
  workDescription: { type: String },
  searchKeyword: { type: String, index: true },
  laguage: { type: String, default: 'English' },

  // Dates & Timeline
  publicDate: { type: Date, index: true },
  purchaseFromDate: { type: Date },
  purchaseToDate: { type: Date },
  submissionDate: { type: Date, index: true },
  openingDate: { type: Date, index: true },
  preBidMeetingDate: { type: Date },

  // Financial & Values
  tenderValue: { type: Number, index: true },
  emdValue: { type: Number },
  documentValue: { type: Number },

  // IDs & Relational Keys
  countryId: { type: String },
  stateId: { type: String },
  cityId: { type: String },
  siteID: { type: String },
  agencyID: { type: String },
  currencyId: { type: String },

  // Agency & Location Information
  agencyName: { type: String, index: true },
  stateName: { type: String, index: true },
  location: { type: String },
  address: { type: String },
  pinCode: { type: String },
  country: { type: String, default: 'India', index: true },

  // Contact Information
  contactPerson: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  contactFax: { type: String },

  // Categorization & Classification
  tenderType: { type: String, index: true },
  tenderCategory: { type: String, index: true },
  category: { type: String, index: true },
  subCategory: { type: String, index: true },
  classificationStatus: { type: String, index: true },
  baseType: { type: String, index: true },

  // URLs & Documents
  tenderURI: { type: String },
  tenderHtmlDoc: { type: String },
  tenderPdf: { type: String },
  tenderZipDoc: { type: String },
  documentURL: { type: String },

  // Status & Control Flags
  tenderStatus: { type: String, index: true },
  entryStatus: { type: String, index: true },
  isActive: { type: Boolean, default: true, index: true },
  isUploaded: { type: Boolean, default: false, index: true },

  // Corrigendum Details
  isCorrigendum: { type: Boolean, default: false },
  corrigendumType: { type: String },

  // Audit / Metadata Tracking
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedDate: { type: Date, default: Date.now }

}, { timestamps: true });

// Text Index for Fast Keyword & Multi-field Searches
tenderSchema.index({
  tenderNumber: 'text',
  title: 'text',
  workDescription: 'text',
  agencyName: 'text',
  stateName: 'text',
  category: 'text',
  subCategory: 'text',
  searchKeyword: 'text'
});

module.exports = mongoose.model('Tender', tenderSchema);