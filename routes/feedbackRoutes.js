const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Проверяем наличие функций контроллера
console.log('Controller functions:', feedbackController);

// Определяем маршруты
router.get('/feedbacks', (req, res) => {
    feedbackController.getAllFeedbacks(req, res);
});

router.post('/submit-feedback', (req, res) => {
    feedbackController.submitFeedback(req, res);
});

router.get('/feedbacks/:id', (req, res) => {
    feedbackController.getFeedbackById(req, res);
});

module.exports = router;