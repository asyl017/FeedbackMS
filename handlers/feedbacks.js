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
router.get('/api/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ rating: -1 }).exec();
        res.json(feedbacks);
    } catch (err) {
        console.error('Error fetching feedbacks:', err);
        res.status(500).send('Database error');
    }
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
router.get('/api/feedbacks/:id', async (req, res) => {
    const id = req.params.id;
    console.log('Searching for feedback with ID:', id); // Добавляем логирование

    try {
        let feedback;
        
        // Пробуем найти по ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            feedback = await Feedback.findById(id).exec();
        }
        
        // Если не нашли по ObjectId, пробуем найти по numericId
        if (!feedback) {
            feedback = await Feedback.findOne({ numericId: parseInt(id) }).exec();
        }

        if (!feedback) {
            console.log('Feedback not found for ID:', id); // Добавляем логирование
            return res.status(404).send('Feedback not found');
        }

        console.log('Found feedback:', feedback); // Добавляем логирование
        res.json(feedback);
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).send('Database error');
    }
});
// Endpoint to update feedback by ID
router.put('/api/feedbacks/:id', async (req, res) => {
    const id = req.params.id;
    const { restaurant, rating, comment } = req.body;

    try {
        let feedback;
        
        if (mongoose.Types.ObjectId.isValid(id)) {
            feedback = await Feedback.findByIdAndUpdate(id, 
                { restaurant, rating: parseInt(rating), comment }, 
                { new: true }
            ).exec();
        }
        
        if (!feedback) {
            feedback = await Feedback.findOneAndUpdate(
                { numericId: parseInt(id) },
                { restaurant, rating: parseInt(rating), comment },
                { new: true }
            ).exec();
        }

        if (!feedback) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).send('Feedback updated successfully!');
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).send('Database error');
    }
});

// Endpoint to delete feedback by ID
router.delete('/api/feedbacks/:id', async (req, res) => {
    const id = req.params.id;

    try {
        let feedback;
        
        if (mongoose.Types.ObjectId.isValid(id)) {
            feedback = await Feedback.findByIdAndDelete(id).exec();
        }
        
        if (!feedback) {
            feedback = await Feedback.findOneAndDelete({ numericId: parseInt(id) }).exec();
        }

        if (!feedback) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).send('Feedback deleted successfully!');
    } catch (err) {
        console.error('Error deleting feedback:', err);
        res.status(500).send('Database error');
    }
});

module.exports = router;