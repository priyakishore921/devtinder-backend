const requestRouter = require('express').Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const { validateStatus, isValidUser } = require('../utils/validation');

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const { status, toUserId } = req.params;
        const fromUserId = req.user._id;
        
        // if(fromUserId.toString() === toUserId.toString()) {
        //     return res.status(400).json({ message: "Cannot send connection request to yourself" });
        // } ======> this is taken care of in the pre save hook of the connectionRequest model

        // validate if toUserId is a valid user
        if (!await isValidUser(req)) {
            return res.status(400).json({ message: "Invalid toUserId: " + toUserId });
        }
        
        // validate status
        if (!validateStatus(req)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        // dows connection request already exist between these two users
        const existingConnectionRequest = await ConnectionRequest.findOne({ 
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ message: "Connection request already exists between these two users" });
        }

        // create a new connection request
        const connectionRequest = await new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        let message;

        if(status === "interested") {
            message = "Connection request sent";
        } else if(status === "ignored") {
            message = "Connection request ignored";
        } else if(status === "accepted") {
            message = "Connection request accepted ";
        } else if(status === "rejected") {
            message = "Connection request rejected ";
        }

        const data = await connectionRequest.save();
        res.json({ message, data });
    } catch (err) {
        console.log("Error in sending connection request: ", err);
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = requestRouter;
