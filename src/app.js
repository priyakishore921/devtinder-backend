const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const connectDB = require('./config/database');
const User = require('./models/user');
const validateSignupData = require('./utils/validation');
const userAuth = require('./middlewares/auth');

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

const app = express();

/**
 * Middleware to parse JSON bodies
 */
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // replace with your frontend URL
    credentials: true, // allow cookies to be sent
}));

app.use(cookieParser());

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);


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

