const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/database');
const User = require('./models/user');
const validateSignupData = require('./utils/validation');
const userAuth = require('./middlewares/auth');

const app = express();

/**
 * Middleware to parse JSON bodies
 */
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
    try {
        // validate user data
        validateSignupData(req);

        
        const userObj = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
        };
        
        // encrypt the password before saving to DB
        const hashedPassword = await bcrypt.hash(userObj.password, 10);
        userObj.password = hashedPassword;
        
        const user = new User(userObj);
        // save returns a promise, so we need to await it
        await user.save();

        res.status(201).send("User created successfully");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error saving the user: " + err.message);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate email
        if (validator.isEmail(email) === false) {
            return res.status(400).send("Invalid credentials");
        }

        const user = await User.findOne({ email });

        // decrypt the password and compare with the hashed password in DB
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).send("Invalid credentials");
        }

        // create JWT token
        const token = await user.getJWT();

        // create a cookie with the JWT token and send it to the client
        res.cookie("token", token, {
            expires: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
        });
        res.status(200).send("Login successful");
    } catch (err) {
        res.status(500).send("Error logging in: " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

app.post("/sendConnectonRequest", userAuth, async (req, res) => {
    try {
        res.send("Connection request sent successfully");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// a get a user by email
app.get("/user", async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.find({ email });
        if (user.length === 0) {
            return res.status(404).send("User not found");
        }
        res.status(200).send(user[0]);
    } catch (err) {
        res.status(500).send("Error fetching user: " + err.message);
    }
});

// delete a user by id
app.delete("/user", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.query.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).send("User deleted successfully");
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});

// update data of the user
app.patch("/user", async (req, res) => {
    const userId = req.query.id;
    const updatedData = req.body;

    try {
        // do not allow email id and user id to be updated
        if (updatedData.email || updatedData._id) {
            return res.status(400).send("Email and user ID cannot be updated");
        }
        
        if (updatedData.skills && updatedData.skills.length > 10) {
            return res.status(400).send("Skills cannot be more than 10");
        }

        // ensure skills are unique
        if (updatedData.skills) {
            updatedData.skills = [...new Set(updatedData.skills)];
        }

        await User.findByIdAndUpdate({_id: userId}, updatedData, {
            runValidators: true,
        });
        
        res.status(200).send("User updated successfully");
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
});

// get all users from DB
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});

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

