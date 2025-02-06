const { body } = require('express-validator');

const validateRegistration = [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter'),
    body('otp').notEmpty().withMessage('OTP is required')
];

const validateLogin = [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
    validateRegistration,
    validateLogin
};