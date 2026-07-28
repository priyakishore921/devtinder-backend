const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

/**
 * Middleware to parse JSON bodies
 */
app.use(express.json());

app.post("/signup", async (req, res) => {
    // console.log("req body", req.body);
    try {
        const userObj = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            age: req.body.age
        };

        const user = new User(req.body);
        // save returns a promise, so we need to await it
        await user.save();

        res.status(201).send("User created successfully");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error saving the user: " + err.message);
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
    try {
        const userId = req.query.id;
        const updatedData = req.body;

        await User.findByIdAndUpdate({_id: userId}, updatedData);
        
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

