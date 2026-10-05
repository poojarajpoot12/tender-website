const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Transporter setup (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

    let user = await User.findOne({ email: cleanEmail });
    
    // Generate 6-digit OTP strictly as a string
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (!user) {
      user = new User({
        email: cleanEmail,
        password: hashedPassword,
        isVerified: false,
        otp: generatedOTP,
        otpExpires: otpExpires
      });
    } else {
      user.password = hashedPassword;
      user.otp = generatedOTP;
      user.otpExpires = otpExpires;
    }

    await user.save();

    console.log("\n==========================================");
    console.log(`🔑 TEST OTP FOR [${cleanEmail}]: ${generatedOTP}`);
    console.log("==========================================\n");

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: '"InfraLens Tenders" <no-reply@infralens.com>',
          to: cleanEmail,
          subject: 'Verification Code for InfraLens Tenders',
          text: `Your OTP verification code is: ${generatedOTP}`
        });
        return res.status(200).json({ message: 'OTP sent successfully to your email!' });
      } catch (emailErr) {
        console.warn('⚠️ Email delivery failed, falling back to Terminal OTP log.');
      }
    }

    return res.status(200).json({ message: 'OTP generated! Check backend terminal for code.' });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// ==========================================
// 2. VERIFY EMAIL OTP & COMPLETE REGISTRATION
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const inputOtp = String(otp).trim();

    console.log(`\n📩 VERIFY ATTEMPT -> Email: "${cleanEmail}" | Entered OTP: "${inputOtp}"`);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      console.log("❌ ERROR: User not found in MongoDB.");
      return res.status(400).json({ message: 'User not found. Please click Get OTP again.' });
    }

    const storedOtp = user.otp ? String(user.otp).trim() : null;
    console.log(`🔑 DB RECORD -> Stored OTP: "${storedOtp}" | Expires: ${user.otpExpires}`);

    if (!storedOtp || storedOtp !== inputOtp) {
      console.log(`❌ ERROR: OTP Mismatch! Provided: [${inputOtp}] vs Stored: [${storedOtp}]`);
      return res.status(400).json({ message: 'Incorrect OTP. Please enter the latest code from terminal.' });
    }

    if (!user.otpExpires || new Date(user.otpExpires).getTime() < Date.now()) {
      console.log("❌ ERROR: OTP Expired.");
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Success: Mark verified & clear temporary OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log("✅ SUCCESS: User verified successfully!");

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || '',
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
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
      return res.status(400).json({ message: 'Email not verified. Please complete OTP verification.' });
    }

    const isMatch = await bcrypt.compare(String(password).trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
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
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// ==========================================
// 4. SEND MOBILE OTP
// ==========================================
router.post('/send-mobile-otp', async (req, res) => {
  try {
    const { email, mobileNumber } = req.body;
    if (!email || !mobileNumber) {
      return res.status(400).json({ message: 'Email and Mobile Number are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const mobileOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.mobileNumber = String(mobileNumber).trim();
    user.mobileOtp = mobileOtp;
    user.mobileOtpExpires = mobileOtpExpires;
    user.isMobileVerified = false;
    await user.save();

    console.log("\n==========================================");
    console.log(`📱 MOBILE TEST OTP FOR [${mobileNumber}]: ${mobileOtp}`);
    console.log("==========================================\n");

    return res.status(200).json({ message: 'Mobile OTP generated! Check backend terminal.' });
  } catch (err) {
    console.error('Send Mobile OTP Error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. VERIFY MOBILE OTP
// ==========================================
router.post('/verify-mobile-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const inputOtp = String(otp).trim();
    const storedMobileOtp = user.mobileOtp ? String(user.mobileOtp).trim() : null;

    if (!storedMobileOtp || storedMobileOtp !== inputOtp) {
      return res.status(400).json({ message: 'Incorrect Mobile OTP.' });
    }

    if (!user.mobileOtpExpires || new Date(user.mobileOtpExpires).getTime() < Date.now()) {
      return res.status(400).json({ message: 'Mobile OTP has expired.' });
    }

    user.isMobileVerified = true;
    user.mobileOtp = undefined;
    user.mobileOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Mobile Number Verified Successfully!', isMobileVerified: true });
  } catch (err) {
    console.error('Verify Mobile OTP Error:', err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;