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
        res.status(500).send("Error: " + err.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const { status, requestId } = req.params;
        const userId = req.user._id;

        // validate the status
        const allowedStatus = ["accepted", "rejected"];
        const isValidStatus = validateStatus(req, allowedStatus);
        if (!isValidStatus) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        // requestId is valid and exists
        // validate if loggedin user us toUserId in request
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: userId,
            status: "interested"
        });
        
        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found " + requestId });
        }
        
        // update the status of the connection request
        connectionRequest.status = status;
        const data = await connectionRequest.save();

        let message;
        if(status === "accepted") {
            message = "Connection request accepted";
        } else if(status === "rejected") {
            message = "Connection request rejected";
        }

        res.json({ message, data });

    } catch (err) {
        res.status(500).json({ ERROR: err.message });
    };
});

module.exports = requestRouter;
