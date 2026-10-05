// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Account Credentials
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    default: '' 
  },
  companyName: { 
    type: String, 
    default: '' 
  },

  // Business & Identity Info (NEW FIELDS ADDED)
  companyType: { 
    type: String, 
    default: '' 
  },
  gstin: { 
    type: String, 
    default: '' 
  },
  panNumber: { 
    type: String, 
    default: '' 
  },

  // Email OTP & Verification Status
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String, 
    default: null 
  },
  otpExpires: { 
    type: Date, 
    default: null 
  },

  // Mobile & WhatsApp Verification
  mobileNumber: { 
    type: String, 
    default: '' 
  },
  isMobileVerified: { 
    type: Boolean, 
    default: false 
  },
  whatsappAlertsEnabled: { 
    type: Boolean, 
    default: true 
  },
  mobileOtp: { 
    type: String, 
    default: null 
  },
  mobileOtpExpires: { 
    type: Date, 
    default: null 
  },

  // Alert Preferences
  alertPreferences: {
    locations: [{ type: String }],
    keywords: [{ type: String }],
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);