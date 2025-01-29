const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/feedback');
require('dotenv').config();
const router = express.Router();
const dbURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Endpoint to get all feedbacks sorted by rating (highest to lowest)
router.get('/api/feedbacks', (req, res) => {
    Feedback.find().sort({ rating: -1 }).exec((err, feedbacks) => {
        if (err) {
            console.error('Error fetching feedbacks:', err);
            return res.status(500).send('Database error');
        }
        res.json(feedbacks);
    });
});

// Endpoint to handle submitting feedback
router.post('/api/submit-feedback', async(req, res) => {
    console.log('Received feedback submission request:', req.body);
    const { restaurant, rating, comment } = req.body;

    // Validate input: Check if all fields are present
    if (!restaurant || !rating || !comment) {
        console.error('Missing required fields');
        return res.status(400).send('Missing required fields');
    }

    // Create a new feedback object
    const newFeedback = new Feedback({
        restaurant,
        rating: parseInt(rating),
        comment
    });

    try {
        await newFeedback.save();
        console.log('Feedback submitted successfully');
        res.status(200).send('Feedback submitted successfully!');
    } catch (err) {
        console.error('Error inserting feedback:', err);
        res.status(500).send('Database error');
    }
});
// Endpoint to get feedback by ID
router.get('/api/feedbacks/:id', (req, res) => {
    const id = req.params.id;

    Feedback.findById(id, (err, feedback) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).send('Database error');
        }
        if (!feedback) {
            return res.status(404).send('Feedback not found');
        }
        res.json(feedback);
    });
});

// Endpoint to update feedback by ID
router.put('/api/feedbacks/:id', (req, res) => {
    const id = req.params.id;
    const { restaurant, rating, comment } = req.body;

    Feedback.findByIdAndUpdate(id, { restaurant, rating: parseInt(rating), comment }, { new: true }, (err, feedback) => {
        if (err) {
            console.error('Error updating feedback:', err);
            return res.status(500).send('Database error');
        }
        if (!feedback) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).send('Feedback updated successfully!');
    });
});

// Endpoint to delete feedback by ID
router.delete('/api/feedbacks/:id', (req, res) => {
    const id = req.params.id;

    Feedback.findByIdAndDelete(id, (err, feedback) => {
        if (err) {
            console.error('Error deleting feedback:', err);
            return res.status(500).send('Database error');
        }
        if (!feedback) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).send('Feedback deleted successfully!');
    });
});

module.exports = router;