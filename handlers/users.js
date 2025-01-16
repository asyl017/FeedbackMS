const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fmsdb = require('../db');
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint to handle user registration
router.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    // Validate input: Check if all fields are present
    if (!username || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
        const values = [username, hashedPassword];

        await fmsdb.query(query, values);
        res.status(200).send('User registered successfully!');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Database error');
    }
});


// Endpoint to handle user login
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        const result = await fmsdb.query(query, values);

        if (result.rows.length === 0) {
            return res.status(400).send('Invalid username or password');
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password');
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).send('Database error');
    }
});


module.exports = router;