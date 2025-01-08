const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const fmsdb = require('./db');
const feedbackRoutes = require('./handlers/feedbacks');  // Import feedback routes

// Middleware to parse JSON data in the body of requests
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the 'user-interface' directory
app.use(express.static('user_interface'));

// Routes for serving HTML pages

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/user_interface/restaurant_list.html');
}); 

app.get('/submission_page', (req, res) => {
    res.sendFile(__dirname + '/user_interface/submission_page.html');
});

app.get('/feedback_display', (req, res) => {
    res.sendFile(__dirname + '/user_interface/feedback_display.html');
});


// Endpoint to get all feedbacks sorted by rating (highest to lowest)
app.get('/api/feedbacks', (req, res) => {
    // Sort feedbacks by rating in descending order
    const sortedFeedbacks = feedbacks.sort((a, b) => b.rating - a.rating);
    res.json(sortedFeedbacks);  // Send sorted feedbacks as JSON
});

// Endpoint to handle submitting feedback
app.post('/api/submit-feedback', (req, res) => {
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
            console.error(err);
            return res.status(500).send('Database error');
        }
        // Send a response confirming successful feedback submission
        res.status(200).send('Feedback submitted successfully!');
    });
});

// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
