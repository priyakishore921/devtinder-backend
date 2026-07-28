const mongoose = require("mongoose");

const url = "mongodb+srv://priyanka:priyanka@myfreecluster.akatsav.mongodb.net/devTinder";

/*
mongoose.connect returns a promise

*/
const connectDB = async () => {
    await mongoose.connect(url);
};

module.exports = connectDB;
