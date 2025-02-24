const User = require('../models/user');

const checkAdminRole = async (req, res, next) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await User.findById(userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    } catch (err) {
        console.error('Error checking user role:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    checkAdminRole
};