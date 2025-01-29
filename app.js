require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const feedbackRoutes = require('./handlers/feedbacks');  // Import feedback routes
const userRoutes = require('./handlers/users');  // Import user routes

// Middleware to parse JSON data in the body of requests
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the 'user_interface' directory
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

// Route for serving the registration page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/user_interface/register.html');
});

// Route for serving the login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/user_interface/login.html');
});

// Use feedback routes
app.use('/feedback', feedbackRoutes);

// Use user routes
app.use('/user', userRoutes);

// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});