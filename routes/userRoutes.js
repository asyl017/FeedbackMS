const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken, validateRegistration, validateLogin } = require('../controllers/userController');
// Route for user registration
router.post('/register', validateRegistration, registerUser);

// Route for user login
router.post('/login', validateLogin, loginUser);

// Route for refreshing token
router.post('/refresh-token', refreshToken);

module.exports = router;