const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    restaurant: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Feedback', feedbackSchema);