// controllers/userController.js
const User = require('../models/User');

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      mobileNumber,
      companyName,
      companyType,
      gstin,
      pan,
      companyLogo,
      specializations,
      locations,
      whatsappAlertsEnabled,
      alertPreferences,
      totalTenders,
      wonTenders,
      wonValue
    } = req.body;

    // Profile & Company Details Updates
    if (mobileNumber !== undefined) user.mobileNumber = String(mobileNumber).trim();
    if (companyName !== undefined) user.companyName = String(companyName).trim();
    if (companyType !== undefined) user.companyType = String(companyType).trim();
    if (gstin !== undefined) user.gstin = String(gstin).trim();
    if (pan !== undefined) user.pan = String(pan).trim().toUpperCase();
    if (companyLogo !== undefined) user.companyLogo = companyLogo;
    if (specializations !== undefined) user.specializations = specializations;
    if (locations !== undefined) user.locations = locations;
    if (whatsappAlertsEnabled !== undefined) user.whatsappAlertsEnabled = whatsappAlertsEnabled;
    if (alertPreferences !== undefined) user.alertPreferences = alertPreferences;

    // Direct Stats Update (Tenders / Won / Won Value)
    if (totalTenders !== undefined) user.totalTenders = Number(totalTenders);
    if (wonTenders !== undefined) user.wonTenders = Number(wonTenders);
    if (wonValue !== undefined) user.wonValue = Number(wonValue);

    await user.save();

    console.log(`✅ PROFILE & COMPANY DETAILS UPDATED FOR: ${user.email}`);

    return res.status(200).json(user);
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ message: err.message || 'Error updating profile' });
  }
};

module.exports = {
  getUserProfile: async (req, res) => {
    try {
      const userId = req.user._id || req.user.id || req.user.userId;
      const user = await User.findById(userId).select('-password -otp -mobileOtp');
      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  updateUserProfile
};