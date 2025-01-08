const fmsdb = require('../db');  // PostgreSQL DB connection
const express = require('express');
const router = express.Router();

// Endpoint to get all feedbacks sorted by rating (highest to lowest)
router.get('/api/feedbacks', (req, res) => {
    const query = 'SELECT * FROM feedbacks ORDER BY rating DESC';
    fmsdb.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching feedbacks:', err);
            return res.status(500).send('Database error');
        }
        res.json(result.rows);
    });
});

// Endpoint to handle submitting feedback
router.post('/api/submit-feedback', (req, res) => {
    const { restaurant, rating, comment } = req.body;

    // Validate input: Check if all fields are present
    if (!restaurant || !rating || !comment) {
        return res.status(400).send('Missing required fields');
    }

    // Insert the feedback into the database
    const query = 'INSERT INTO feedbacks (restaurant, rating, comment) VALUES ($1, $2, $3)';
    const values = [restaurant, parseInt(rating), comment];

    fmsdb.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting feedback:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send('Feedback submitted successfully!');
    });
});

// Endpoint to get feedback by ID
router.get('/api/feedbacks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const query = 'SELECT * FROM feedbacks WHERE id = $1';
    fmsdb.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).send('Database error');
        }
        if (result.rows.length === 0) {
            return res.status(404).send('Feedback not found');
        }
        res.json(result.rows[0]);
    });
});

// Endpoint to update feedback by ID
router.put('/api/feedbacks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { restaurant, rating, comment } = req.body;
    const query = 'UPDATE feedbacks SET restaurant = $1, rating = $2, comment = $3 WHERE id = $4';
    const values = [restaurant, parseInt(rating), comment, id];

    fmsdb.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating feedback:', err);
            return res.status(500).send('Database error');
        }
        if (result.rowCount === 0) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).send('Feedback updated successfully!');
    });
});

// Endpoint to delete feedback by ID
router.delete('/api/feedbacks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const query = 'DELETE FROM feedbacks WHERE id = $1';

    fmsdb.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting feedback:', err);
            return res.status(500).send('Database error');
        }
        if (result.rowCount === 0) {
            return res.status(404).send('Feedback not found');
        }
        res.status(200).send('Feedback deleted successfully!');
    });
});

module.exports = router;