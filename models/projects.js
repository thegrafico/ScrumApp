// import DB
const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

let projectSchema = new mongoose.Schema({
    author: {type: ObjectId, ref: "User"},
    title: String,
    description: String,
    status: {type: String, enum: ["New", "Active", "Completed", "Deleted", "Hold", "Abandoned"], default: "New"}
}, {timestamps: true});

module.exports = mongoose.model("Projects", projectSchema);
