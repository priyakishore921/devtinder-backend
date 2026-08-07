const authRouter = require('express').Router();
const { validateSignupData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');

authRouter.post("/signup", async (req, res) => {
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

        res.status(201).json({ message: "User created successfully", data: user});
    } catch (err) {
        console.error(err);
        res.status(400).send("Error saving the user: " + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
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
        res.status(200).json({ message: "Login successful", data: user });
    } catch (err) {
        res.status(500).send("Error logging in: " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
    // remove cookie from the client
    res.clearCookie("token");

    // or
    // res.cookie("token", null, expires: new Date().now());
    res.status(200).send("Logout successful");
});

module.exports = authRouter;