const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

//Swagger Setup
const setupSwaggger = require('./config/swqgger');
setupSwaggger(app);

// Middleware for serving static files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Middleware for parsing incoming request data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', require('./routes/auth.Route'));

// Start the server
app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});