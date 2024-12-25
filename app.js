const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON data in the body of requests
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the 'user-interface' directory
app.use(express.static('user_interface'));

// Serve the submission page at the root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/user_interface/submission_page.html'); // Ensure the HTML file exists in the 'user-interface' folder
});
// Routes for serving HTML pages
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/user_interface/submission_page.html');
});

app.get('/feedback-display', (req, res) => {
    res.sendFile(__dirname + '/user_interface/feedback_display.html');
});

app.get('/restaurant-list', (req, res) => {
    res.sendFile(__dirname + '/user_interface/restaurant_list.html');
});

// Mock data for feedbacks
let feedbacks = [
    { id: 1, restaurant: 'Pasta Palace', rating: 5, comment: 'Excellent food!' },
    { id: 2, restaurant: 'Sultan\'s Delight', rating: 4, comment: 'Very good, but a bit spicy.' },
    { id: 3, restaurant: 'La Pizzeria', rating: 3, comment: 'Good pizza but small portions.' },
    { id: 4, restaurant: 'Burger Town', rating: 4, comment: 'Tasty, but a bit greasy.' }
];

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

    // Create new feedback object
    const newFeedback = {
        id: feedbacks.length + 1,  // Auto-increment ID
        restaurant: restaurant,
        rating: parseInt(rating),  // Make sure rating is an integer
        comment: comment
    };

    // Add the new feedback to the feedback array
    feedbacks.push(newFeedback);

    // Send a response confirming successful feedback submission
    res.status(200).send('Feedback submitted successfully!');
});


// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
