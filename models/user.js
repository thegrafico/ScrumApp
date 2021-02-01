// import DB
const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

let userSchema = new mongoose.Schema({
    username: String,
    fullName: String,
    creationDate: {type: Date, default: Date.now}
});

// TODO: add middleware in order to remove all reference of user from other collections

module.exports = mongoose.model("User", userSchema);

