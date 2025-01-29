const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    restaurant: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;