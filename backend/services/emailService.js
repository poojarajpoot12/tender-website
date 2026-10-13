// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmailOtp = async (toEmail, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'InfraLens Portal - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">InfraLens Portal</h2>
          <p>Aapka Email Verification OTP niche diya gaya hai:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; background: #f3f4f6; padding: 12px 24px; border-radius: 6px; display: inline-block;">${otpCode}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Yeh OTP sirf 15 minutes ke liye valid hai. Kripya ise kisi ke sath share na karein.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ REAL EMAIL SENT SUCCESSFULLY TO: ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendEmailOtp };