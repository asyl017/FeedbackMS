const express = require('express');
const router = express.Router();
const { sendOtp, registerUser, loginUser, getProfile, logoutUser } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middlewares/validation');

router.post('/send-otp', sendOtp);
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', getProfile);
router.post('/logout', logoutUser); 
module.exports = router;