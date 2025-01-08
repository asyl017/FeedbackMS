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

// Use feedback routes
app.use('/', feedbackRoutes);


// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
