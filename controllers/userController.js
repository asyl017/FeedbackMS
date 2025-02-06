const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/user');
require('dotenv').config();
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to authenticate token
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

// Middleware to validate registration input data
const validateRegistration = [
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
];

// Middleware to validate login input data
const validateLogin = [
    body('password').notEmpty().withMessage('Password is required')
];

// Handle user registration
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
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
                username: newUser.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error registering user: ${err.message}`);
    }
};

// Handle user login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // Generate access token
        const token = jwt.sign(
            { id: user._id, email: user.email },
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
                email: user.email
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
};

// Handle refresh token
const refreshToken = async (req, res) => {
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
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token: newToken });
    } catch (err) {
        console.error('Error refreshing token:', err);
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

module.exports = {
    authenticateToken,
    validateRegistration,
    validateLogin,
    registerUser,
    loginUser,
    refreshToken
};