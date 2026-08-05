const userRouter = require('express').Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

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

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        /*
            User should see all the user cards except
            1. his/her own card
            2. cards of users who have already sent a connection request to him/her
            3. cards of users to whom he/she has already sent a connection request
            4. cards of users whom he/she had ignored or rejected in the past or has been ignored or rejected
                by someone in the past
        */
       let limit = parseInt(req.query.limit) || 10; // default limit is 10
       limit = limit > 50 ? 50 : limit; // max limit is 50
       const page = parseInt(req.query.page) || 1; // default page is 0
       const skip = (page - 1) * limit;

       const loggedInUserId = req.user._id;

        // find all connection requests sent or received by the logged in user
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },
                { toUserId: loggedInUserId }
            ]
        }).select('fromUserId toUserId');

        const hideUserFromFeed = new Set(connectionRequests.flatMap(cr => [cr.fromUserId.toString(), cr.toUserId.toString()]));
        // console.log("hideUserFromFeed: ", hideUserFromFeed);

        const users = await User.find({
            _id: { $nin: Array.from(hideUserFromFeed) }
        })
        .select('firstName lastName email gender age photoUrl')
        .limit(limit)
        .skip(skip);

        res.json({
            message: "User feed",
            data: users
        });

        
    } catch (err) {
        res.status(500).json({ ERROR: err.message });
    }
});

module.exports = userRouter;
