const userRouter = require('express').Router();
const userAuth = require('../middlewares/auth');

userRouter.get('/feed', userAuth, async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = userRouter;