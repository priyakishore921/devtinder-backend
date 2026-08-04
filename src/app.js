const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/database');
const User = require('./models/user');
const validateSignupData = require('./utils/validation');
const userAuth = require('./middlewares/auth');

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');

const app = express();

/**
 * Middleware to parse JSON bodies
 */
app.use(express.json());

app.use(cookieParser());

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);


connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(3000, () => {
            console.log('http server listening on port 3000');
        });
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });

