const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({

    restaurant: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    numericId: { type: Text, unique: true }
    
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;