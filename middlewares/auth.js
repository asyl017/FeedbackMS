const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });

        if (!user || user.token !== token) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = {
    authenticateToken
};