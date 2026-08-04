const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: '{VALUE} is not a valid status'
        },
        required: true
    }
}, { timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre('save', async function () {
    const connectionRequest = this;

    // check if from userid is same as to userid
    if (connectionRequest.fromUserId.toString() === connectionRequest.toUserId.toString()) {
        throw new Error("Cannot send connection request to yourself");
    }
});

module.exports = new mongoose.model('ConnectionRequest', connectionRequestSchema);
