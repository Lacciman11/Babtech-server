const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  verifyOtp, 
  refreshAccessToken, 
  forgotPassword, 
  verifyOtpForReset,
  resetPassword 
} = require('../controller/authController');
const validateUser = require('../middleware/validateUser');

router.post('/register', validateUser, register);
router.post('/login', validateUser, login);
router.post('/verify-otp', verifyOtp); // for registration
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp-reset', verifyOtpForReset); // rename this one to avoid conflict
router.post('/reset-password', resetPassword); 

module.exports = router;
