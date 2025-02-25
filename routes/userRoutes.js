const express = require('express');
const router = express.Router();
const { sendOtp, registerUser, loginUser, getProfile, logoutUser, getAllUsers, deleteUserById } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middlewares/validation');

router.post('/send-otp', sendOtp);
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', getProfile);
router.post('/logout', logoutUser);
router.get('/users', getAllUsers); // Add route to get all users
router.delete('/users/:id', deleteUserById); // Add route to delete user by ID

module.exports = router;