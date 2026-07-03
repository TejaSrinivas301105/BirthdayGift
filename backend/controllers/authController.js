const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getIsMockMode } = require('../config/db');
const { getMockData, saveMockData } = require('../config/mockStore');

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d'
  });
};

// Login user
exports.login = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  email = email.trim().toLowerCase();

  try {
    if (getIsMockMode()) {
      const mockData = getMockData();
      const user = mockData.users.find(u => u.email === email.toLowerCase());

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        token,
        user: { email: user.email }
      });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        token,
        user: { email: user.email }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send OTP for Forgot Password
exports.sendOtp = async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address' });
  }

  email = email.trim().toLowerCase();

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (getIsMockMode()) {
      const mockData = getMockData();
      const userIndex = mockData.users.findIndex(u => u.email === email.toLowerCase());

      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'No account registered with this email' });
      }

      mockData.users[userIndex].otp = otp;
      mockData.users[userIndex].otpExpires = otpExpires.toISOString();
      mockData.users[userIndex].otpVerified = false;
      saveMockData(mockData);
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ success: false, message: 'No account registered with this email' });
      }

      user.otp = otp;
      user.otpExpires = otpExpires;
      user.otpVerified = false;
      await user.save();
    }

    // Send email with OTP
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #0f172a; color: #ffffff;">
        <h2 style="color: #7c3aed; text-align: center;">Asritha's World ✨</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the following One-Time Password (OTP) to proceed. This OTP is valid for 10 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 8px; color: #ffffff; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: "Reset Password - Asritha's World Verification Code",
      html: html
    });

    // Extract OTP from HTML for frontend
    const otpMatch = html.match(/>(\d{6})</);
    const extractedOtp = otpMatch ? otpMatch[1] : otp;

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to email',
      otp: extractedOtp // Send OTP to frontend for EmailJS
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP email' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  let { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
  }

  email = email.trim().toLowerCase();

  try {
    if (getIsMockMode()) {
      const mockData = getMockData();
      const user = mockData.users.find(u => u.email === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.otp || user.otp !== otp || new Date(user.otpExpires) < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Set verified
      const userIndex = mockData.users.findIndex(u => u.email === email.toLowerCase());
      mockData.users[userIndex].otpVerified = true;
      saveMockData(mockData);

      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      user.otpVerified = true;
      await user.save();

      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and new password' });
  }

  email = email.trim().toLowerCase();

  try {
    if (getIsMockMode()) {
      const mockData = getMockData();
      const userIndex = mockData.users.findIndex(u => u.email === email.toLowerCase());

      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = mockData.users[userIndex];
      if (!user.otpVerified) {
        return res.status(400).json({ success: false, message: 'OTP has not been verified yet' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.otp = null;
      user.otpExpires = null;
      user.otpVerified = false;

      mockData.users[userIndex] = user;
      saveMockData(mockData);

      return res.status(200).json({ success: true, message: 'Password Updated Successfully ❤️' });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.otpVerified) {
        return res.status(400).json({ success: false, message: 'OTP has not been verified yet' });
      }

      user.password = password; // Pre-save middleware will hash it
      user.otp = null;
      user.otpExpires = null;
      user.otpVerified = false;
      await user.save();

      return res.status(200).json({ success: true, message: 'Password Updated Successfully ❤️' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current authenticated user
exports.getMe = async (req, res) => {
  try {
    // req.user is already fetched in the protect middleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

