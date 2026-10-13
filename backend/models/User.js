// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Auth Fields
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },

  // Mobile Verification Fields
  mobileNumber: { type: String, default: '' },
  mobileOtp: { type: String, default: null },
  mobileOtpExpires: { type: Date, default: null },
  isMobileVerified: { type: Boolean, default: false },

  // Profile & Company Details
  name: { type: String, default: '' },
  companyName: { type: String, default: '' },
  companyType: { type: String, default: '' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  specializations: [{ type: String }],
  locations: [{ type: String }],

  // Alert Preferences
  alertPreferences: {
    locations: [{ type: String }],
    keywords: [{ type: String }]
  },
  whatsappAlertsEnabled: { type: Boolean, default: true },

  // Dashboard Stats & Profile Strength
  profileStrength: { type: Number, default: 20 },
  totalTenders: { type: Number, default: 0 },
  wonTenders: { type: Number, default: 0 },
  wonValue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);