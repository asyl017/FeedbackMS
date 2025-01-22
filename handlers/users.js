const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();

const dbURI = process.env.MONGODB_URI;


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;
// Define User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

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

    // Validate input: Check if all fields are present
    if (!username || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'Username already exists' }] });
        }


        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword });

        // Save the user to the database
        await newUser.save();
        res.status(200).send('User registered successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error registering user: ${err.message}`);
    }
});

// Middleware to validate login input data
const validateLogin = [
    body('password').notEmpty().withMessage('Password is required')
];

/// Endpoint to handle user login
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});


module.exports = router;