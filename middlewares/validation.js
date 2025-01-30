const { body } = require('express-validator');

const validateRegistration = [
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
];

const validateLogin = [
    body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
    validateRegistration,
    validateLogin
};