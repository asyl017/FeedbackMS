const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    verified: { type: Boolean, default: false },
    token: { type: String }, // Store refresh token
    role: { type: String, default: 'user' } // Добавляем поле role с дефолтным значением 'user'
});

const User = mongoose.model('User', userSchema);

module.exports = User;