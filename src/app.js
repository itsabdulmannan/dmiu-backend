const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

//Swagger Setup
const setupSwaggger = require('./config/swqgger');
setupSwaggger(app);

// Cors Setup
app.use(cors());

// Middleware for serving static files
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Middleware for parsing incoming request data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', require('./routes/auth.Route'));
app.use('/users', require('./routes/user.Route'));
app.use('/papers', require('./routes/paper.Route'));

// Start the server
app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});