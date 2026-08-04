const profileRouter = require('express').Router();
const userAuth = require('../middlewares/auth');
const validateProfileEditData = require('../utils/validation').validateProfileEditData;

profileRouter.get("/profile/view", userAuth, async (req, res) => {
     try {
        res.status(200).send(req.user);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async(req, res) => {
    try{
        if(!validateProfileEditData(req)) {
            return res.status(400).send("Invalid edit request");
        } else {
            const loggedInUser = req.user;
            Object.keys(req.body).forEach(field => {
                loggedInUser[field] = req.body[field];
            });
            await loggedInUser.save();
            res.json({
                message: `${loggedInUser.firstName} ${loggedInUser.lastName}'s profile updated successfully`,
                data: loggedInUser
            });
        } 

    } catch (err) {
        res.status(500).send("Error in editing the profile: " + err.message);
    }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const { user } = req;

        if (req.body.oldPassword === req.body.newPassword) {
            return res.status(400).send("New password cannot be the same as the old password");
        }

        user.password = req.body.newPassword;
        await user.save();
        res.status(200).send("Password changed successfully");
    } catch (err) {
        res.status(500).send("Error in changing the password: " + err.message);
    }
});

module.exports = profileRouter;
