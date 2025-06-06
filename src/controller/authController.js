const bcrypt = require('bcryptjs');
const { Student, Admin } = require('../model/userSchema'); // Import both models
const sendOtp = require('../utils/sentOtp');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisClient');

// Helper function to find a user (Student or Admin) by email
const findUserByEmail = async (email) => {
  let user = await Student.findOne({ email });
  if (user) return { user, model: Student };
  user = await Admin.findOne({ email });
  if (user) return { user, model: Admin };
  return null;
};

const register = async (req, res) => {
  const { firstname, lastname, email, password, cohort, role } = req.body;

  try {
    // Check if user exists in either Student or Admin collection
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Determine model based on role (default to Student if no role provided)
    const isAdmin = role === 'admin';
    const Model = isAdmin ? Admin : Student;

    // Validate cohort for students
    if (!isAdmin && !cohort) {
      return res.status(400).json({ message: 'Cohort is required for students' });
    }

    const userData = JSON.stringify({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      cohort: isAdmin ? undefined : cohort, // Cohort only for students
      role: isAdmin ? 'admin' : 'student',
      otp
    });

    await redisClient.setEx(email, 6 * 60 * 60, userData);

    await sendOtp(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const data = await redisClient.get(email);
    if (!data) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    const parsed = JSON.parse(data);

    if (parsed.otp !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Determine model based on role
    const isAdmin = parsed.role === 'admin';
    const Model = isAdmin ? Admin : Student;

    const user = new Model({
      firstname: parsed.firstname,
      lastname: parsed.lastname,
      email: parsed.email,
      password: parsed.password,
      cohort: isAdmin ? undefined : parsed.cohort, // Cohort only for students
      role: isAdmin ? 'admin' : 'student',
      isVerified: true
    });

    await user.save();
    await redisClient.del(email);

    res.status(201).json({ message: 'User verified and registered successfully' });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in either Student or Admin collection
    const userData = await findUserByEmail(email);
    if (!userData) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { user, model: Model } = userData;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h'
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d'
    });

    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
        sameSite: 'strict'
      })
      .status(200)
      .json({
        message: 'Login successful',
        refreshToken,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role
        }
      });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user in either Student or Admin collection
    const userData = await findUserByEmail(decoded.email);
    if (!userData || userData.user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const { user, model: Model } = userData;

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      .status(200)
      .json({
        message: 'Access token refreshed successfully',
        refreshToken: newRefreshToken,
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userData = await findUserByEmail(email);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const redisKey = `forgot:${email}`;

    await redisClient.setEx(redisKey, 600, otp.toString());

    const verifyLink = `${process.env.BACKEND_URL}/verify-otp?email=${encodeURIComponent(email)}`;

    await sendOtp(email, otp, verifyLink);

    res.status(200).json({
      message: 'OTP and verification link sent to your email',
      code: 'OTP_SENT'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
};

const verifyOtpForReset = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      error: 'Email and OTP are required',
      code: 'MISSING_FIELDS'
    });
  }

  try {
    const redisKey = `forgot:${email}`;
    const storedOtp = await redisClient.get(redisKey);

    if (!storedOtp) {
      return res.status(400).json({
        error: 'OTP expired or not requested',
        code: 'OTP_EXPIRED'
      });
    }

    if (storedOtp !== otp.trim()) {
      return res.status(400).json({
        error: 'Invalid OTP',
        code: 'INVALID_OTP'
      });
    }

    await redisClient.del(redisKey);

    return res.json({
      success: true,
      redirect: `${process.env.FRONTEND_URL}?email=${encodeURIComponent(email)}`
    });
  } catch (error) {
    console.error('OTP verification failed:', error);
    return res.status(500).json({
      error: 'Server error during OTP verification',
      code: 'SERVER_ERROR'
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const userData = await findUserByEmail(email);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { user, model: Model } = userData;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  register,
  verifyOtp,
  refreshAccessToken,
  forgotPassword,
  verifyOtpForReset,
  resetPassword
};