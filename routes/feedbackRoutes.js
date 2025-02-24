const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

console.log('Controller functions:', feedbackController);

router.get('/feedbacks', (req, res) => {
    feedbackController.getAllFeedbacks(req, res);
});

router.post('/submit-feedback', (req, res) => {
    feedbackController.submitFeedback(req, res);
});

router.get('/feedbacks/:id', (req, res) => {
    feedbackController.getFeedbackById(req, res);
});

// Add a route to get feedbacks by user ID
router.get('/user-feedbacks', (req, res) => {
    feedbackController.getFeedbacksByUserId(req, res);
});

// Add a route to delete feedback by ID
router.delete('/feedbacks/:id', (req, res) => {
    feedbackController.deleteFeedbackById(req, res);
});

module.exports = router;