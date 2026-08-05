const userRouter = require('express').Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require("../models/connectionRequest");

userRouter.get('/connections', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const connections = await ConnectionRequest.find({
            status: "accepted",
            $or: [
                { fromUserId: userId},
                { toUserId: userId}
            ]
        }).populate('fromUserId', ['firstName', 'lastName']).populate('toUserId', ['firstName', 'lastName']);

        const data = connections.map(connection => {
            if (connection.fromUserId._id.toString() === userId.toString()) {
                return connection.toUserId;
            } else {
                return connection.fromUserId;
            }
        });

        res.json({
            data
        })

    } catch (err) {
        res.status(500).json({ ERROR: err.message });
    }
});

userRouter.get('/requests/received', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const data = await ConnectionRequest.find({
            toUserId: loggedInUserId,
            status: "interested"
        }).populate('fromUserId', ['firstName', 'lastName']);
        
        res.json({
            message: "Requests for your review",
            data
        });
    } catch (err) {
        res.json({
            status: 500,
            message: `Error: ${err.message}`
        })
    }
});

userRouter.get('/requests/sent', userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const data = await ConnectionRequest.find({
            fromUserId: loggedInUserId,
            status: "interested"
        }).populate('toUserId', 'firstName lastName');
        
        res.json({
            message: "Requests sent by you",
            data
        });
    } catch (err) {
        res.status(500).json({ ERROR: err.message });
    }
});

module.exports = userRouter;
