const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const User = require('../models/user');
const router = express.Router();
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Middleware to validate input data
const validateRegistration = [
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
];

// Endpoint to handle user registration
router.post('/api/register', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'Username already exists' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Generate token after registration
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'User registered successfully!',
            token,
            user: {
                id: newUser._id,
                username: newUser.username
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error registering user: ${err.message}`);
    }
});

// Middleware to validate login input data
const validateLogin = [
    body('password').notEmpty().withMessage('Password is required')
];
// Login endpoint
router.post('/api/login', validateLogin, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // Generate access token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            refreshToken,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

// Refresh token endpoint
router.post('/api/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(403).json({ message: 'User not found' });
        }

        const newToken = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token: newToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
});

module.exports = router;