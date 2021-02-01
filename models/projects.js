// import DB
const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

let projectSchema = new mongoose.Schema({
    author: {type: ObjectId, ref: "User"},
    title: String,
    description: String,
    creationDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Projects", projectSchema);
