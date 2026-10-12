const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==========================================
// 1. SEND EMAIL OTP ROUTE
// ==========================================
router.post('/send-otp', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password).trim();

    // Check if user is already registered and verified
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please login.' });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Save or update unverified user record
    await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          email: cleanEmail,
          password: hashedPassword,
          otp: generatedOTP,
          otpExpires: otpExpires,
          isVerified: false
        }
      },
      { new: true, upsert: true }
    );

    console.log("\n==========================================");
    console.log(`🔑 OTP GENERATED FOR [${cleanEmail}]: ${generatedOTP}`);
    console.log("==========================================\n");

    return res.status(200).json({
      message: 'OTP generated successfully!',
      otp: generatedOTP
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ message: err.message || 'Server error during OTP generation' });
  }
});

// ==========================================
// 2. VERIFY EMAIL OTP ROUTE
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    console.log("📩 INCOMING VERIFY BODY:", req.body);
    const email = req.body.email;
    const otpInput = req.body.otp || req.body.code || req.body.otpCode;

    if (!email || !otpInput) {
      console.log("❌ REJECTED 400: Email or OTP missing in body");
      return res.status(400).json({ message: 'Both email and OTP code are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otpInput).trim();

    // Find user using case-insensitive match
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.log(`❌ REJECTED 400: No record found for ${cleanEmail}`);
      return res.status(400).json({ message: 'User record not found. Click Get OTP again.' });
    }

    const storedOtp = user.otp ? String(user.otp).trim() : '';

    console.log(`🔍 COMPARING -> DB OTP: "${storedOtp}" | INPUT OTP: "${cleanOtp}"`);

    if (!storedOtp || storedOtp !== cleanOtp) {
      console.log("❌ REJECTED 400: OTP Mismatch");
      return res.status(400).json({ message: 'Invalid OTP code. Please re-check.' });
    }

    if (!user.otpExpires || new Date(user.otpExpires).getTime() < Date.now()) {
      console.log("❌ REJECTED 400: OTP Expired");
      return res.status(400).json({ message: 'OTP has expired. Request a new code.' });
    }

    // Success Verification
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log(`✅ VERIFICATION SUCCESSFUL FOR: ${cleanEmail}`);

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || '',
        companyName: user.companyName || '',
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ message: err.message || 'Server error during verification' });
  }
});

// ==========================================
// 3. LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: 'User does not exist. Please register first.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Account not verified. Please complete OTP verification.' });
    }

    const isMatch = await bcrypt.compare(String(password).trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || '',
        companyName: user.companyName || '',
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: err.message || 'Server error during login' });
  }
});

// ==========================================
// 4. SEND MOBILE OTP ROUTE
// ==========================================
router.post('/send-mobile-otp', async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    if (!email || !mobileNumber) {
      return res.status(400).json({ message: 'Email and Mobile Number are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const mobileOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          mobileNumber: String(mobileNumber).trim(),
          mobileOtp: mobileOtp,
          mobileOtpExpires: mobileOtpExpires,
          isMobileVerified: false
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    console.log("\n==========================================");
    console.log(`📱 MOBILE OTP FOR [${mobileNumber}]: ${mobileOtp}`);
    console.log("==========================================\n");

    return res.status(200).json({ 
      message: 'Mobile OTP generated! Check backend terminal.', 
      otp: mobileOtp 
    });
  } catch (err) {
    console.error('Send Mobile OTP Error:', err);
    return res.status(500).json({ message: err.message || 'Server error during mobile OTP generation' });
  }
});

// ==========================================
// 5. VERIFY MOBILE OTP ROUTE (ADDED & FIXED)
// ==========================================
router.post('/verify-mobile-otp', async (req, res) => {
  try {
    const { email, mobileNumber, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    const storedMobileOtp = user.mobileOtp ? String(user.mobileOtp).trim() : '';

    if (!storedMobileOtp || storedMobileOtp !== cleanOtp) {
      return res.status(400).json({ message: 'Invalid OTP code. Please re-check.' });
    }

    if (!user.mobileOtpExpires || new Date(user.mobileOtpExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    // Success Verification
    user.isMobileVerified = true;
    user.mobileOtp = null;
    user.mobileOtpExpires = null;
    if (mobileNumber) {
      user.mobileNumber = String(mobileNumber).trim();
    }
    await user.save();

    console.log(`✅ MOBILE VERIFICATION SUCCESSFUL FOR: ${cleanEmail}`);

    return res.status(200).json({
      message: 'Mobile number verified successfully!',
      isMobileVerified: true,
      mobileNumber: user.mobileNumber
    });
  } catch (err) {
    console.error('Verify Mobile OTP Error:', err);
    return res.status(500).json({ message: err.message || 'Server error during mobile OTP verification' });
  }
});

module.exports = router;