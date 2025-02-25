const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const nodemailer = require('nodemailer');
require('dotenv').config();
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Handle sending OTP
const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.verified) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        });

        // Save OTP to database
        await User.findOneAndUpdate({ email }, { otp, verified: false }, { upsert: true });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

// Handle user registration
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.verified) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check OTP
        if (otp !== user.otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.username = username; // Сохраняем username
        user.password = hashedPassword;
        user.verified = true;
        user.otp = undefined; // Clear OTP after verification
        user.role = 'user'; // Присваиваем роль 'user'
        await user.save();

        res.status(200).json({
            message: 'User registered successfully!',
            user: {
                id: user._id,
                username: user.username, // Возвращаем username
                email: user.email,
                role: user.role // Возвращаем роль
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error registering user: ${err.message}` });
    }
};

// Handle user login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Account not registered' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Save user ID in session
        req.session.userId = user._id;

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user._id,
                username: user.username, // Возвращаем username
                email: user.email,
                role: user.role // Возвращаем роль
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Error logging in' });
    }
};

// Handle fetching profile information
const getProfile = async (req, res) => {
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId).select('-password -otp');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Handle user logout
const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Очистить cookie сессии
        res.status(200).json({ message: 'Logout successful' });
    });
};
// Handle fetching all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -otp');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Handle deleting a user by ID
const deleteUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

module.exports = {
    sendOtp,
    registerUser,
    loginUser,
    getProfile,
    logoutUser,
    getAllUsers,
    deleteUserById
};

module.exports = {
    sendOtp,
    registerUser,
    loginUser,
    getProfile,
    logoutUser,
    getAllUsers,
    deleteUserById
};