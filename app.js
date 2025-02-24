require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const feedbackRoutes = require('./routes/feedbackRoutes');  // Import feedback routes
const userRoutes = require('./routes/userRoutes');  // Import user routes
const Restaurant = require('./models/restaurant');  // Import restaurant model
const { checkAdminRole } = require('./middlewares/roleCheck');  // Import role check middleware
// Middleware to parse JSON data in the body of requests
app.use(bodyParser.json());

// Middleware for session handling
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Установите true, если используете HTTPS
}));

// Serve static files (HTML, CSS, JS) from the 'user_interface' directory
app.use(express.static('user_interface'));

// Routes for serving HTML pages
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'user_interface', 'restaurant_list.html'));
}); 

app.get('/submission_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_interface', 'submission_page.html'));
});

app.get('/feedback_display',checkAdminRole, (req, res) => {
    res.sendFile(path.join(__dirname, 'user_interface', 'feedback_display.html'));
});

// Route for serving the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_interface', 'register.html'));
});

// Route for serving the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_interface', 'login.html'));
});

// Route for serving the profile page
app.get('/profile', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'user_interface', 'profile.html'));
    } else {
        res.redirect('/login');
    }
});

// Route for serving the restaurant details page
app.get('/restaurant_details', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_interface', 'restaurant_details.html'));
});
    
// Route for checking authentication status
app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// API routes
app.use('/api', feedbackRoutes);
app.use('/api', userRoutes);

// Add a route to get all restaurants with filtering
app.get('/api/restaurants', async (req, res) => {
    const { type, minRating } = req.query;
    const filter = {};

    if (type) {
        filter.cuisine = type;
    }

    if (minRating) {
        filter.rating = { $gte: parseInt(minRating) };
    }

    try {
        const restaurants = await Restaurant.find(filter).exec();
        res.json(restaurants);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ message: 'Error fetching restaurants' });
    }
});

// Add a route to get restaurant details by ID, including reviews
app.get('/api/restaurants/:id', async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId).populate({
            path: 'reviews',
            populate: { path: 'user', select: 'username' }
        }).exec();
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (err) {
        console.error('Error fetching restaurant details:', err);
        res.status(500).json({ message: 'Error fetching restaurant details' });
    }
});
// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});