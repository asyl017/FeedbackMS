const express = require('express');
const router = express.Router();
const { authenticateToken, sendOtp, registerUser, loginUser, refreshToken } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middlewares/validation');

router.post('/send-otp', sendOtp);
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/refresh-token', refreshToken);

module.exports = router;