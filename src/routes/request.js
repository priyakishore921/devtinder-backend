const requestRouter = require('express').Router();
const userAuth = require('../middlewares/auth');

requestRouter.post("/sendConnectonRequest", userAuth, async (req, res) => {
    try {
        res.send("Connection request sent successfully");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = requestRouter;
