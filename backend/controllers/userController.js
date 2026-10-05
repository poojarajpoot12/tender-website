const User = require('../models/User');

// @desc    Get User Profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password -otp -otpExpires -mobileOtp -mobileOtpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update User Profile (Company Details & Profile Strength)
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      mobileNumber,
      companyName,
      companyType,
      gstin,
      pan,
      panNumber,
      whatsappAlertsEnabled,
      alertPreferences
    } = req.body;

    // Update Basic & Business Fields
    if (name !== undefined) user.name = name;
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
    if (companyName !== undefined) user.companyName = companyName;
    if (companyType !== undefined) user.companyType = companyType;
    if (gstin !== undefined) user.gstin = gstin;

    // Handle PAN field mismatch (accepting both pan / panNumber)
    const effectivePan = panNumber !== undefined ? panNumber : pan;
    if (effectivePan !== undefined) {
      user.panNumber = effectivePan;
      user.pan = effectivePan; // Keeps backward compatibility if required
    }

    // Update Alerts & Preferences if passed
    if (whatsappAlertsEnabled !== undefined) user.whatsappAlertsEnabled = whatsappAlertsEnabled;
    if (alertPreferences !== undefined) user.alertPreferences = alertPreferences;

    // Dynamic Profile Strength Calculation Logic
    let strength = 20; // Base score for email registration
    if (user.companyName && user.companyName.trim() !== '') strength += 20;
    if (user.companyType && user.companyType.trim() !== '') strength += 20;
    if (user.gstin && user.gstin.trim() !== '') strength += 20;
    if ((user.panNumber && user.panNumber.trim() !== '') || (user.pan && user.pan.trim() !== '')) strength += 20;

    user.profileStrength = strength;

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        companyName: updatedUser.companyName,
        companyType: updatedUser.companyType,
        gstin: updatedUser.gstin,
        panNumber: updatedUser.panNumber || updatedUser.pan,
        pan: updatedUser.pan || updatedUser.panNumber,
        plan: updatedUser.plan || 'Free',
        profileStrength: updatedUser.profileStrength,
        isVerified: updatedUser.isVerified,
        isMobileVerified: updatedUser.isMobileVerified,
        whatsappAlertsEnabled: updatedUser.whatsappAlertsEnabled,
        alertPreferences: updatedUser.alertPreferences
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};